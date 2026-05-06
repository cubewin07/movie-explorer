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
- "Exact same data" across recomputes requires **one canonical filter + join path** (avoid duplicating filtering rules in multiple places).

---

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
- Never mark ingestion as "done" until the delete+insert transaction commits.

**Caution**
- TMDB can return duplicates across pages or null `release_date/first_air_date`; handle nulls deterministically (either drop or treat as "unknown year" and skip).
- Do not log API keys; sanitize outbound URLs in logs.

---

## 2) Remove weights — join-based snapshot recomputation (same data)

**Objective**
- Stop maintaining weight tables and recompute the user snapshot using joins so the snapshot reflects the same canonical film/enrichment tables.

**Implementation directions**
- Define a single canonical "candidate set" query:
  - watchlist items → join candidate edges → candidate films (dedupe)
- Define a single canonical "feature/scoring" query:
  - join candidate film → genres/keywords/credits/language/watchlist signals
- Build a new snapshot version, then atomically swap:
  - write rows with `snapshot_version = newVersion`
  - on success, flip "active" version (or delete old version) in one transaction
- If you need parity with v1:
  - keep the old weight-based scorer temporarily behind a debug flag and compare score components for a small fixture dataset until they match.

**Two-pass scoring (required)**
- Pass 1 — cheap score using only what is already in the DB (genre overlap, language match). No TMDB calls.
- Pass 2 — expensive joins (credits, keywords) only for the top-K candidates that survived pass 1.
- This prevents enriching candidates that will never rank high enough to appear in the snapshot.

**Snapshot recompute trigger — event-driven with debounce/coalesce**

Use a `user_recompute_tasks` table instead of a fixed schedule:

```sql
user_recompute_tasks (
  user_id        PRIMARY KEY,
  scheduled_at   timestamp,
  triggered_by   varchar   -- 'WATCHLIST_ADD', 'WATCHLIST_REMOVE', 'ENRICHMENT_COMPLETE'
)
```

- Watchlist add/remove → upsert a task row with `scheduled_at = now + debounce_window` (e.g. 30s).
- `ON CONFLICT (user_id) DO UPDATE SET scheduled_at = ...` is the coalesce — rapid watchlist changes produce only one recompute.
- Cap sliding debounce to prevent indefinite deferral:

```sql
ON CONFLICT (user_id) DO UPDATE
  SET scheduled_at = LEAST(
    now() + interval '30 seconds',
    user_recompute_tasks.scheduled_at + interval '5 minutes'
  )
```

- Scheduler polls `WHERE scheduled_at <= now() LIMIT 10 FOR UPDATE SKIP LOCKED`.
- `FOR UPDATE SKIP LOCKED` prevents two scheduler instances picking the same user.
- On success: delete the task row. On failure: leave or reschedule forward.

**Enrichment completion → recompute trigger**

When a film finishes enrichment:
- Find all users who have that film as a candidate (join `candidate_edges` → watchlist items → users).
- Batch-insert recompute task rows for affected users (same debounce upsert).
- Keep fan-out bounded — if a film is a candidate for many users, insert task rows in batches, not synchronously.

**Boundedness**
- `maxCandidatesPerUser` (cap the candidate set before expensive joins).
- `maxJoinWorkPerRun` (budget join work by page size / cursor).

**Idempotency**
- Snapshot recompute is idempotent by versioning:
  - reruns overwrite the same `snapshot_version` rows or discard and rebuild
- Task de-dupe:
  - one task row per user; watchlist changes "coalesce" by pushing `nextRunAt`.

**Failure tolerance**
- If recompute fails, keep serving the last completed snapshot.
- Ensure partial writes are not visible:
  - never serve `snapshot_version` until "completed" flag is set
- Dead-letter users after max attempts, but keep the system healthy.

**Caution**
- Join semantics matter: `INNER` vs `LEFT` joins can change scores; document assumptions (e.g., missing credits ⇒ 0 contribution).
- Indexes are not optional (watchlist_items, candidate edges, film_id/type, snapshot `(user_id, version)`).

---

## 3) Enrichment — lease-based, prioritized, failure-tolerant

**Objective**
- Enrich films reliably without redundant cross-worker work, wasted TMDB calls on low-rank candidates, or silent failures.

**Film-level enrichment status (lease model)**

Add the following columns to the film table (or a companion `film_enrichment_state` table):

```
enrichment_status   PENDING | IN_PROGRESS | DONE
lease_expires_at    timestamp
enriched_at         timestamp
```

Claim logic (atomic):
```sql
UPDATE film
SET status = IN_PROGRESS, lease_expires_at = now() + interval '60 seconds'
WHERE (status = PENDING)
   OR (status = IN_PROGRESS AND lease_expires_at < now())
```
- If 0 rows updated → another worker holds the lease; skip this film.
- Record `enriched_at` and set `status = DONE` only after all sub-resources succeed.
- Expired leases are reclaimed automatically by the next worker — no film gets stuck permanently.

**Set status on creation**
- Insert new films with `enrichment_status = PENDING`, `lease_expires_at = null`.
- The creating worker does not hold an implicit lease; it competes like any other worker.
- This is safer: a crash immediately after insert leaves the film as `PENDING`, claimable by any worker on the next poll cycle. Creating with `IN_PROGRESS` would lock the film for a full lease window on crash.

**Handling concurrent film creation**
- Enforce a unique constraint on `(tmdb_id, type)` on the film table.
- If two workers race to insert the same film, one gets a `DataIntegrityViolationException`.
- The losing worker must catch this and fall back to `findByTmdbIdAndType` — do not let the exception bubble unhandled.
- Your `getOrCreateFilm` method must implement this find-or-create pattern explicitly; Spring does not retry automatically.

**TTL / re-enrichment**
- `DONE` does not mean "done forever." Re-enrich when `enriched_at < now() - TTL` (e.g. 7 days).
- On TTL expiry, reset `enrichment_status = PENDING` so the film re-enters the queue.
- Lifecycle: `PENDING → IN_PROGRESS → DONE → (TTL expires) → PENDING`

**Prioritization (enrich what matters)**
- Enrich source watchlist films first (always highest priority).
- For candidate films: run pass 1 cheap scoring first, then enrich only top-K survivors before pass 2.
- Do not enrich candidates that cheap scoring would eliminate — this is the primary TMDB call reduction.
- Per tick: respect `maxFilmsToEnrich` and `maxTmdbCallsPerTick` budgets.

**Film feature vector (replaces cached weights)**
- Instead of per-user cached weights (which have the same staleness problem as the weight tables you dropped), maintain a `film_feature_vector` row per film:
  - precomputed genre/keyword/language features, refreshed when enrichment completes
  - shared across all users; no per-user eviction needed
  - invalidated only when that film's enrichment data changes
- Scoring during recompute becomes a fast lookup against `film_feature_vector` rather than repeated joins.
- This gives you the speed benefit of caching without the per-user invalidation complexity.

**Enrichment failure — retry tasks, not silent drop**

Current behavior: if any sub-resource sync throws (credits, keywords, genres), the exception bubbles and the entire candidate sync for that source film fails. This is wrong.

Required change — isolate per-candidate failures:

```java
try {
    creditService.syncCreditsForFilm(...);
} catch (Exception ex) {
    log.warn("Credits enrichment failed filmId={}", candidateTmdbId, ex);
    scheduleEnrichmentRetry(candidateFilm, EnrichmentStage.CREDITS);
    // continue to next candidate — do not break the loop
}
```

Retry task table:

```sql
film_enrichment_tasks (
  film_internal_id   PRIMARY KEY,
  stage              varchar,      -- CREDITS, KEYWORDS, GENRES
  attempt_count      int,
  next_retry_at      timestamp,
  last_error         varchar
)
```

- Same upsert/coalesce pattern as `user_recompute_tasks`.
- Apply exponential backoff to `next_retry_at`.
- After max attempts: mark dead-letter, stop retrying, alert via metrics.
- One candidate failing enrichment must never abort enrichment of subsequent candidates in the same sync run.

**Concurrency control**
- DB lease (above) prevents two workers enriching the same film simultaneously.
- Use `enrichment_stage` on the film row to track which sub-resources have succeeded; retry only remaining stages on the next attempt.

**Caution**
- Do not record `lastSuccessAt` / `enriched_at` at the start of a run; record only after all sub-resources succeed.
- Circuit-breaker on sustained TMDB failures (prevent tight retry loops against a down API).

---

## 4) Observability upgrade

**Objective**
- Make bounded queues + retries debuggable and measurable.

**Implementation directions**
- Logging:
  - structured fields: `taskType`, `taskId`, `userId`, `filmInternalId`, `tmdbId`, `attempt`, `nextRetryAt`, `errorCode`
- Exceptions:
  - normalize error responses; map invalid params to `400` (not `500`)
- Metrics (Micrometer):
  - timers: ingestion latency, snapshot recompute latency, enrichment latency per stage
  - counters: success/failure/retry per stage, TMDB call outcomes, "budget exhausted" events, lease claims/expirations, dead-letter events
  - gauges: queue depth for `user_recompute_tasks`, `film_enrichment_tasks`, sync tasks

**Caution**
- Keep metric tag cardinality bounded (do NOT tag by userId/filmId).
- Avoid logging PII; userId is usually OK, but never log tokens/emails.

---

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
  - two-pass scoring: pass 2 only runs for top-K survivors of pass 1
  - atomic swap: API never returns partially written snapshot
  - resumable cursor: budget exhaustion reschedules and continues correctly
  - failure leaves prior snapshot intact
  - debounce coalesce: rapid watchlist changes produce exactly one recompute task
  - enrichment completion fans out recompute tasks to affected users only
- Enrichment tests:
  - lease claim: second worker skips a film already `IN_PROGRESS` with a valid lease
  - lease expiry: worker reclaims film after lease window passes
  - concurrent insert: losing worker falls back to find-or-create, no exception bubbles
  - per-candidate failure isolation: one candidate's enrichment failure does not abort remaining candidates
  - retry task created on enrichment failure; dead-lettered after max attempts
  - `enriched_at` recorded only after all sub-resources succeed, not at start
  - film created as `PENDING`, not `IN_PROGRESS`
- Observability tests (focused):
  - required meters exist (timers/counters) and are incremented in success/failure paths
  - dead-letter counter increments after max retry exhaustion

**Caution**
- Never hit real TMDB in tests; mock `TmdbClient`.
- Avoid global-count assertions; assert per-user/per-film outputs and invariants.

---

## Appendix — rollout / ops checklist (minimal)
- Data reset script: delete only derived recommendation data (not users/watchlists/reviews).
- Config knobs: cutoff year, per-tick budgets, max attempts, TMDB concurrency/timeout, debounce window, lease duration, enrichment TTL.
- Feature flags:
  - backend: disable recommendation writes if needed
  - frontend: `VITE_DISABLE_RECOMMENDATIONS=true` during rebuild
- Staging verification:
  - tasks created, bounded progress, stable snapshot served, metrics present, lease expiry reclaim observed.

---

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
- New tables / migrations:
  - `film.enrichment_status`, `film.lease_expires_at`, `film.enriched_at`
  - `film_feature_vector`
  - `user_recompute_tasks`
  - `film_enrichment_tasks`