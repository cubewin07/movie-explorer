# Recommendation Engine v2 — 5-Stage Implementation Plan

_Last updated: 2026-05-06_

## 0) Summary (what changes in v2)
- Ingest TMDB film-to-film recommendations as **candidates** (not final output).
- Drop weight tables; compute score/components via **joins** during background recompute.
- Serve `GET /recommendations` from a **precomputed user snapshot** (fast request path).
- Make every background workflow **bounded**, **idempotent**, and **failure-tolerant**.
- Replace broad/legacy tests with **recommendation-specific, strict** tests.

### Cross-cutting requirements (do not skip)
- **Boundedness:** every loop has a max (per tick/per user/per film/per TMDB call).
- **Idempotency:** retries must not duplicate rows or advance progress early.
- **Failure tolerance:** tasks retry safely; partial snapshots are never served.

### Caution (system-level)
- TMDB responses can be incomplete (missing dates/ids) and are rate-limited.
- Join-heavy scoring can become expensive; keep it off the request path and budget it.
- “Exact same data” across recomputes requires **one canonical filter + join path** (avoid duplicating filtering rules in multiple places).

## 1) Ingestion — TMDB recommendations endpoint

**Objective**
- Fetch `/movie/{id}/recommendations` and `/tv/{id}/recommendations` and store results as candidate edges.

**Implementation directions**
- Add client methods in `TmdbClient` for movie + tv recommendations.
- Store candidate edges with at least:
  - `source_internal_film_id`, `candidate_internal_film_id`
  - `source_type`, `candidate_type`
  - `tmdb_rank`
  - `ingested_at`
  - `source_tmdb_id`
- Apply shared filters early (e.g., cutoff year, media type, missing date handling).
- Keep ingestion triggered by a bounded background task (not request traffic).

**Boundedness**
- `maxCandidatesPerSource` (top N only; do not paginate endlessly).
- `maxSourcesPerTick` (how many source films per scheduler tick).
- Global `tmdbConcurrencyLimit` + per-call timeouts.

**Idempotency**
- Per source film: *replace semantics* in one transaction:
  - delete existing candidate edges for that source film
  - insert the new bounded set
- Enforce unique constraints to prevent duplicates (`source_internal_id`, `candidate_internal_id`).

**Failure tolerance**
- Retry transient failures with exponential backoff + jitter.
- Treat permanent cases explicitly:
  - `404`/`422` from TMDB ⇒ mark source as `SKIPPED_NOT_FOUND`
  - bad payloads ⇒ `FAILED_NON_RETRYABLE` with `errorCode`
- Never mark ingestion as “done” until the delete+insert transaction commits.

**Caution**
- TMDB can return duplicates across pages or null `release_date/first_air_date`; handle nulls deterministically (either drop or treat as “unknown year” and skip).
- Do not log API keys; sanitize outbound URLs in logs.

## 2) Remove weights — join-based snapshot recomputation (same data)

**Objective**
- Stop maintaining weight tables and recompute the user snapshot using joins so the snapshot reflects the same canonical film/enrichment tables.

**Implementation directions**
- Define a single canonical “candidate set” query:
  - watchlist items → join candidate edges → candidate films (dedupe)
- Define a single canonical “feature/scoring” query:
  - join candidate film → genres/keywords/credits/language/watchlist signals
- Build a new snapshot version, then atomically swap:
  - write rows with `snapshot_version = newVersion`
  - on success, flip “active” version (or delete old version) in one transaction
- If you need parity with v1:
  - keep the old weight-based scorer temporarily behind a debug flag and compare score components for a small fixture dataset until they match.

**Boundedness**
- `maxCandidatesPerUser` (cap the candidate set before expensive joins).
- `maxJoinWorkPerRun` (budget join work by page size / cursor).
- Optional two-pass: cheap score for all candidates, expensive joins only for top K.

**Idempotency**
- Snapshot recompute is idempotent by versioning:
  - reruns overwrite the same `snapshot_version` rows or discard and rebuild
- Task de-dupe:
  - one task row per user; watchlist changes “coalesce” by pushing `nextRunAt`.

**Failure tolerance**
- If recompute fails, keep serving the last completed snapshot.
- Ensure partial writes are not visible:
  - never serve `snapshot_version` until “completed” flag is set
- Dead-letter users after max attempts, but keep the system healthy.

**Caution**
- Join semantics matter: `INNER` vs `LEFT` joins can change scores; document assumptions (e.g., missing credits ⇒ 0 contribution).
- Indexes are not optional (watchlist_items, candidate edges, film_id/type, snapshot `(user_id, version)`).

## 3) Enrichment — reduce workload (bounded + prioritized)

**Objective**
- Keep enrichment quality without exploding TMDB calls or recompute CPU.

**Implementation directions**
- Treat film enrichment as shared state (enrich once per film, not per user).
- Prioritize enrichment for “likely to matter” films:
  - enrich source watchlist films first
  - then enrich only top-K candidate films per user (from cheap ranking)
- Cache computed film features if joins become too heavy:
  - a small `film_feature_cache` or materialized view (not user-specific weights)
- Avoid re-enriching too frequently:
  - only refresh after TTL or when missing critical fields

**Boundedness**
- Per tick: `maxFilmsToEnrich`, `maxTmdbCallsPerTick`.
- Per film: limit which sub-resources to fetch (credits vs keywords) based on need.
- Circuit-breaker on sustained TMDB failures.

**Idempotency**
- Upsert film details by `(tmdb_id, type)`.
- Only update “enriched” timestamps/flags after all sub-resources succeed.

**Failure tolerance**
- Partial enrichment should be allowed but explicit:
  - store `enrichment_stage` and retry remaining stages
- Concurrency control (avoid two workers enriching the same film):
  - DB lock / “in-progress” flag with lease expiry

**Caution**
- Do not record “lastSuccessAt” at the start of a run; record it only after completion (prevents false suppression of retries).

## 4) Observability upgrade

**Objective**
- Make bounded queues + retries debuggable and measurable.

**Implementation directions**
- Logging:
  - structured fields: `taskType`, `taskId`, `userId`, `filmInternalId`, `tmdbId`, `attempt`, `nextRetryAt`, `errorCode`
- Exceptions:
  - normalize error responses; map invalid params to `400` (not `500`)
- Metrics (Micrometer):
  - timers: ingestion latency, snapshot recompute latency
  - counters: success/failure/retry, TMDB call outcomes, “budget exhausted” events
  - gauges: queue depth for sync tasks and user recompute tasks

**Caution**
- Keep metric tag cardinality bounded (do NOT tag by userId/filmId).
- Avoid logging PII; userId is usually OK, but never log tokens/emails.

## 5) Tests — replace legacy with strict recommendation tests

**Objective**
- Ensure the new pipeline is correct, bounded, and retry-safe; remove tests that only validated the old behavior.

**Implementation directions**
- Ingestion tests:
  - bounded candidate count (top N only)
  - idempotent replace semantics for a source film
  - cutoff-year filtering works the same in ingestion + recompute
  - retry policy: transient TMDB errors schedule retry; permanent errors do not loop
- Snapshot recompute tests:
  - deterministic ordering and tie-break rules
  - atomic swap: API never returns partially written snapshot
  - resumable cursor: budget exhaustion reschedules and continues correctly
  - failure leaves prior snapshot intact
- Observability tests (focused):
  - required meters exist (timers/counters) and are incremented in success/failure paths

**Caution**
- Never hit real TMDB in tests; mock `TmdbClient`.
- Avoid global-count assertions; assert per-user/per-film outputs and invariants.

## Appendix — rollout / ops checklist (minimal)
- Data reset script: delete only derived recommendation data (not users/watchlists/reviews).
- Config knobs: cutoff year, per-tick budgets, max attempts, TMDB concurrency/timeout.
- Feature flags:
  - backend: disable recommendation writes if needed
  - frontend: `VITE_DISABLE_RECOMMENDATIONS=true` during rebuild
- Staging verification:
  - tasks created, bounded progress, stable snapshot served, metrics present.

## Relevant code touch points (current repo paths)
- Backend:
  - `Backend/src/main/java/com/Backend/services/recommendation_service/controller/RecommendationController.java`
  - `Backend/src/main/java/com/Backend/services/recommendation_service/service/RecommendationService.java`
  - `Backend/src/main/java/com/Backend/services/film_service/service/TmdbClient.java`
  - `Backend/src/main/java/com/Backend/services/sync_service/service/FilmSyncTaskService.java`
  - `Backend/src/main/java/com/Backend/services/watchlist_service/service/WatchlistBackgroundSyncListener.java`
  - `Backend/src/main/java/com/Backend/services/watchlist_service/service/WatchlistService.java`
  - `Backend/src/main/java/com/Backend/exception/Handler/GlobalExceptionHandler.java`
  - `Backend/src/main/resources/application.yml`
- Frontend:
  - `Frontend/src/hooks/API/recommendations.js`
