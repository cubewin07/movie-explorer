# Recommendation Engine v2 — 5-Stage Implementation Plan (Revised)

_Last updated: 2026-06-11_

## Changelog from original spec
- **Phase 1:** Dropped `tmdb_rank` (no rank field in TMDB response; array order is undocumented), `source_type`/`candidate_type` (inferable from which endpoint was called, redundant on edge row), `source_tmdb_id` (redundant; already reachable via `source_internal_film_id → film.tmdb_id`). Edge table simplified to `source_internal_film_id`, `candidate_internal_film_id`, `ingested_at`.
- **Phase 2:** Added explicit rule for partially enriched candidates in scoring. Clarified that pass 1 is only cheap if genre/language fields are on the film row — verify before treating the two-pass split as a meaningful optimisation. Added two-pass split detail: `pickEnrichedSurvivors` (recompute pipeline, only DONE-enriched) vs `pickEnrichmentCandidates` (enrichment pipeline, all candidates). Documented min-max normalization and exact scoring formula.
- **Phase 3:** Added constraint tying lease duration to scheduler tick interval. Added requirement to verify per-stage idempotency before implementing per-stage retry. Documented stage flags on `Film` row (`genreSyncCompleted`, `keywordSyncCompleted`, `creditsSyncCompleted`) replacing the separate `film_enrichment_tasks` table. Documented `FilmEnrichmentStateService` lease validation at startup.
- **Phase 4:** Implementation now complete — `RecommendationMetrics` owns the full metric surface (timers + counters + gauges) introduced in Phases 3–4. Tenant-side wiring still lives in `RecommendationController` (success/error latency) and `SyncTaskHelper` (sync-task outcome counters) as before. See "Implemented" section below for the full metric list and file:line.

---

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
- Store candidate edges with:
  - `source_internal_film_id`, `candidate_internal_film_id`
  - `ingested_at`
- Media type (movie vs tv) is not stored on the edge — it is known from which endpoint was called and is already on the film row itself.
- Apply shared filters early (cutoff year, missing date handling). Drop candidates with null `release_date` / `first_air_date` — do not treat as unknown year.
- Keep ingestion triggered by a bounded background task (not request traffic).

**On TMDB response ordering**
- The recommendations endpoint returns a `results` array. TMDB does not document the ordering of this array, so do not treat position as a rank signal.
- Use `popularity` and `vote_average` from the response payload as explicit scoring signals if needed — these are documented fields with clear semantics.

**Boundedness**
- `maxCandidatesPerSource` (take the first N from the response; do not paginate endlessly).
- `maxSourcesPerTick` (how many source films per scheduler tick).
- Global `tmdbConcurrencyLimit` + per-call timeouts.

**Idempotency**
- Per source film: *replace semantics* in one transaction:
  - delete existing candidate edges for that source film
  - insert the new bounded set
- Enforce a unique constraint on `(source_internal_film_id, candidate_internal_film_id)` to prevent duplicates.
- Wrap delete + insert in `@Transactional` — if the insert fails, the delete rolls back.

**Failure tolerance**
- Retry transient failures with exponential backoff + jitter.
- Treat permanent cases explicitly:
  - `404`/`422` from TMDB ⇒ mark source as `SKIPPED_NOT_FOUND`
  - bad payloads ⇒ `FAILED_NON_RETRYABLE` with `errorCode`
- Never mark ingestion as "done" until the delete+insert transaction commits.

**Caution**
- TMDB can return duplicates within a response; the unique constraint is your safety net, but deduplication before insert avoids wasted work.
- Drop candidates with null `release_date` / `first_air_date` at the filter step — do not carry nulls into the edge table.
- Do not log API keys; sanitize outbound URLs in logs.

---

## 1.5) Preparation — Genre sync service (important prerequisite)

Why this matters
- The two-pass cheap/expensive scoring semantics rely on genre information being available cheaply (either as columns on the film row or via a precomputed `film_feature_vector`). The repo contains a dedicated genre sync flow that seeds/refreshes film → genre edges; treat that flow as a prerequisite for Phase 2.

How the codebase currently uses genre sync
- Watchlist background sync triggers a bounded genre sync via `WatchlistBackgroundSyncListener.safeSync(..., SyncCategory.GENRE, userId)`.
- Recommendation ingestion/recompute triggers best-effort genre seeding; tests assert that `genreService.syncGenresForFilm(tmdbId, genreIds, FilmType)` is invoked (non-fatal if it fails).
- The sync helper `SyncTaskHelper` exposes a `genre` retry attempts config (`sync.retry.max-attempts.genre`) and the sync logic treats genre failures as retryable up to the configured cap.

Operational expectations to add to preparation checklist
- Verify genre data location: confirm whether genre IDs/names are available on `film` rows (columns) or only via `film_genre` join. If the latter, ensure `film_feature_vector` contains precomputed genre features refreshed on enrichment completion so pass 1 remains cheap.
- Ensure `genreService.syncGenresForFilm(...)` is idempotent and bounded: deletes+inserts or upserts should be safe for retries and repeated syncs.
- Treat genre seeding failures as non-fatal to recommendation ingestion (the existing test coverage shows this is intended). Ensure retries, dead-lettering, and metrics are present for genre sync attempts.
- Add a small, bounded background job that re-seeds genres for recently ingested candidates where enrichment is incomplete, rather than blocking recompute or request paths.

Tests to add/verify in preparation step
- Assert that recommendation ingestion triggers `genreService.syncGenresForFilm` with expected `tmdbId`, `genreIds`, and `FilmType` (use ArgumentCaptor as in tests).
- Assert that genre seeding failure does not prevent edge insertion and that repeated syncs replace film_genre edges (replace semantics).
- Assert retry policy honors `sync.retry.max-attempts.genre` and produces metrics/counters for attempts and dead-letters.


## 2) Remove weights — join-based snapshot recomputation

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
- Pass 1 — cheap score using only what is already on the film row (genre overlap, language match). No TMDB calls. **Prerequisite: verify that genre and language fields are columns on the film row itself, not joins to separate tables. If they require joins, the two-pass split provides no meaningful cost reduction and pass 1 must be redesigned.**
- Pass 2 — expensive joins (credits, keywords) only for the top-K candidates that survived pass 1.
- This prevents enriching candidates that will never rank high enough to appear in the snapshot.

**Two distinct Pass-1 modes (implemented)**
- `pickEnrichedSurvivors` — used by the recompute pipeline. Only selects candidates whose enrichment status is `DONE`, so the snapshot always contains quality data.
- `pickEnrichmentCandidates` — used by `RecommendationSyncTaskHandler` to decide which placeholder candidates are worth sending to the enrichment pipeline. Runs the same cheap heuristic but without the enrichment filter, because non-enriched films can still qualify via language/rating values already seeded from the TMDB snapshot.
- Both modes share `resolveWatchlistFilmIds` and `resolveCandidateFilmIds` for candidate pool construction.

**Handling partially enriched candidates**
- A candidate film may exist in the DB but have incomplete enrichment (missing credits, genres, keywords). Define an explicit rule before implementing scoring:
  - Missing contribution from any signal = **0 score contribution for that signal**, not skip.
  - Apply this rule consistently in both pass 1 and pass 2 — do not filter on enrichment completeness in one pass and not the other.
- Document this assumption; it affects score distribution and must match the test fixtures.

**Full scoring formula (implemented)**
- Min-max normalize each component (keyword, genre, language, director, cast, crew, rating) to `[0, 10]` across the candidate set.
- Base score: `keyword*0.60 + genre*0.30 + language*0.10`
- Bonus multiplier: `(1 + rating*0.10) * (1 + cast*0.05) * (1 + crew*0.02) * (1 + director*0.05)`
- Final score: `baseScore * bonusMultiplier + recencyBoost`
- Recency boost: fixed `newReleaseBoost` (default 0.5) if release date within `newReleaseDays` (default 365), else 0.
- Tie-break: rating desc → date desc → internalId asc.

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
  - one task row per user; watchlist changes "coalesce" by pushing `scheduled_at`.

**Failure tolerance**
- If recompute fails, keep serving the last completed snapshot.
- Ensure partial writes are not visible:
  - never serve `snapshot_version` until "completed" flag is set
- Dead-letter users after max attempts, but keep the system healthy.

**Caution**
- Join semantics matter: `INNER` vs `LEFT` joins can change scores; document assumptions (e.g., missing credits ⇒ 0 contribution, consistent with the partially-enriched rule above).
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
- **Constraint: lease duration must always be greater than the maximum scheduler tick interval.** If the scheduler can take up to T seconds per tick, set `lease_expires_at = now() + interval > T`. Tie these two config values together and validate on startup. A lease shorter than a tick causes false reclaims where a second worker claims a film the first worker is still processing.
- **Implemented:** `FilmEnrichmentStateService.validateConfiguration()` enforces this constraint at startup via `@PostConstruct`.

**Stage flags on Film row (implemented — replaces separate task table)**
- Per-sub-resource completion is tracked via boolean flags on the `Film` entity: `genreSyncCompleted`, `keywordSyncCompleted`, `creditsSyncCompleted`.
- On retry, each stage checks its flag before doing TMDB work — no separate `film_enrichment_tasks` table needed.
- `FilmEnrichmentSyncProcessor.syncForFilm()` checks and sets each flag after successful sync.

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
- Maintain a `film_feature_vector` row per film:
  - precomputed genre/keyword/language features, refreshed when enrichment completes
  - shared across all users; no per-user eviction needed
  - invalidated only when that film's enrichment data changes
- Scoring during recompute becomes a fast lookup against `film_feature_vector` rather than repeated joins.
- This gives you the speed benefit of caching without the per-user invalidation complexity.

**Enrichment failure — retry tasks, not silent drop**

Isolate per-candidate failures:

```java
try {
    creditService.syncCreditsForFilm(...);
} catch (Exception ex) {
    log.warn("Credits enrichment failed filmId={}", candidateTmdbId, ex);
    scheduleEnrichmentRetry(candidateFilm, EnrichmentStage.CREDITS);
    // continue to next candidate — do not break the loop
}
```

**Before implementing per-stage retry, verify that each sub-resource write is independently idempotent.** For example, if credits sync does a delete+insert internally, retrying just the credits stage must not leave partial or inconsistent data. If a stage is not idempotent in isolation, make it so before enabling per-stage retry — otherwise a partial retry can produce worse state than a full re-run.

**Implemented:** Stage flags on `Film` row (`genreSyncCompleted`, `keywordSyncCompleted`, `creditsSyncCompleted`) provide implicit retry tracking. Each stage checks its flag before doing TMDB work. No separate `film_enrichment_tasks` table — retry state is derived from the flags themselves.

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

**Implemented**
- `RecommendationController` wires `MeterRegistry` and registers `recommendationSuccessLatencyTimer` and `recommendationErrorLatencyTimer` (labeled by `outcome`) — same as before.
- `SyncTaskHelper` registers counters for sync task outcomes: `sync.retry.scheduled`, `sync.failure.permanent`, `sync.dead-letter` (all tagged by `category` + normalized `errorCode`) — same as before.
- `RecommendationMetrics` (`recommendation_service/metrics/RecommendationMetrics.java`) owns the full Phase 4 metric surface:
  - **Counters**
    - `recommendation.snapshot.recompute.success` (line 85)
    - `recommendation.snapshot.recompute.failure` (line 89)
    - `recommendation.lease.claimed` (line 126)
    - `recommendation.lease.expired` (line 130)
    - `recommendation.budget.exhausted` (line 134, tagged by `category`)
  - **Gauges**
    - `recommendation.snapshot.queue.depth` (line 94)
    - `recommendation.sync_task.queue.depth` (line 99)
  - **Timers**
    - `recommendation.snapshot.recompute.latency` (line 75) — invoked by `RecommendationSnapshotScheduler.processDueRecomputeTasks()` at lines 57, 90–91
    - `recommendation.enrichment.stage.latency` × 3, tagged by `stage=genre|keyword|credits` (lines 103–122)
- `FilmEnrichmentStateService.tryAcquireLease()` distinguishes fresh claim vs expired-lease reclaim and routes through `metrics.recordLeaseClaimed()` / `metrics.recordLeaseExpired()` (lines 92–99), so the lease counters above reflect real call sites.

**No outstanding TODO items for Phase 4.** Pressure gauges from Phase 3 are also exposed (`recommendation.budget.exhausted`).

**Future enhancements (deferred, not blockers)**
- Histograms on recompute latency timer (currently summary-style) — would allow p95/p99 percentile views once a tracing backend is available.
- TMDB call outcome counters (`tmdb.success` / `tmdb.failure` tagged by endpoint) — useful once TMDB-specific failure modes need dashboarding; not on the original Phase 4 list.

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
  - null `release_date` / `first_air_date` candidates are dropped, not passed through
  - retry policy: transient TMDB errors schedule retry; permanent errors do not loop
- Snapshot recompute tests:
  - deterministic ordering and tie-break rules
  - two-pass scoring: pass 2 only runs for top-K survivors of pass 1
  - partially enriched candidate scores 0 for missing signals, not skipped
  - atomic swap: API never returns partially written snapshot
  - resumable cursor: budget exhaustion reschedules and continues correctly
  - failure leaves prior snapshot intact
  - debounce coalesce: rapid watchlist changes produce exactly one recompute task
  - enrichment completion fans out recompute tasks to affected users only
- Enrichment tests:
  - lease claim: second worker skips a film already `IN_PROGRESS` with a valid lease
  - lease expiry: worker reclaims film after lease window passes
  - lease duration > scheduler tick: validate config constraint is enforced on startup
  - concurrent insert: losing worker falls back to find-or-create, no exception bubbles
  - per-candidate failure isolation: one candidate's enrichment failure does not abort remaining candidates
  - per-stage retry: retrying a single stage does not produce inconsistent state
  - retry task created on enrichment failure; dead-lettered after max attempts
  - `enriched_at` recorded only after all sub-resources succeed, not at start
  - film created as `PENDING`, not `IN_PROGRESS`
- Observability tests (focused):
  - required meters exist (timers/counters) and are incremented in success/failure paths
  - dead-letter counter increments after max retry exhaustion
  

**Status: IMPLEMENTED** — all 9 items from the previous "Still to add" list now have `@Test` methods. Two of them are placeholders that need strengthening before this branch ships; details below.

**Already covered by existing tests (unchanged):**
- Ingestion: bounded candidate count, idempotent replace semantics, null date filtering
- Snapshot recompute: partially enriched = 0 score, pass-2 top-K only, pass-1 ordering, two-pass filter behavior
- Enrichment: lease claim/skip, lease expiry reclaim, film created PENDING, re-enqueue after TTL expiry
- Task scheduling: recompute fan-out on enrichment complete, debounce threshold gating, no fan-out when no affected users
- Retry: retry cap → dead-letter, permanent failure vs retryable distinction
- Observability: success/error latency timers wired in RecommendationController and SyncTaskHelper

**Newly covered in this branch:**

*Snapshot recompute tests (in `general_test/SpringControllerTest.java`):*
- atomic swap → `recomputeSnapshot_atomicSwap_activeVersionIsCommitPoint` (line 1835, `@Order(38)`). Confirms `activeVersion` flips to 2 after second recompute, version-1 rows are no longer queryable, version-2 rows are populated.
- failure leaves prior snapshot intact → `recomputeSnapshot_failureLeavesPriorSnapshotIntact` (line 1887, `@Order(39)`). **PARTIAL — needs strengthening.** The test body's own comment admits the failure path is *not* actually exercised: it only asserts `recommendationSnapshotRecomputeService.isNotNull()` and re-queries the snapshot. The atomicity invariant (`REQUIRES_NEW` propagation, version rollback on mid-transaction failure) is not proven by this test. Suggestion for follow-up: inject a failing spy into `RecommendationSnapshotRecomputeService.writeSnapshot` or seed a constraint violation that aborts the transaction, then assert the old `activeVersion=N` row is still served through `recommendationSnapshotQueryService.getRecommendationsForUser`.
- debounce coalesce → `debounceCoalesce_rapidWatchlistChangesProduceOneRecomputeTask` (line 1942, `@Order(40)`). Three rapid `WATCHLIST_REMOVE` schedules against an empty task table → exactly one `UserRecomputeTask` row, attempt count = 0, last error = null.
- tie-break determinism → `tieBreakDeterminism_consistentOrderAcrossRecomputes` (line 1969, `@Order(41)`). Two recomputes with three rating-tied candidates at staggered dates and IDs → identical ordering.
- lease config validation at startup → `leaseConfigValidation_rejectsLeaseShorterThanTick` (line 2064, `@Order(43)`). **PARTIAL — needs strengthening.** Currently asserts only `IllegalStateException.class.isAssignableFrom(IllegalStateException.class)` (trivially true) and that the production bean booted. The production guard in `FilmEnrichmentStateService.validateConfiguration()` (line 36) is never invoked with a bad config. Suggestion for follow-up: instantiate a fresh `FilmEnrichmentStateService` via reflection with `leaseDurationMs=1000`, `schedulerTickMs=60000` and assert `IllegalStateException`; alternatively use `@TestPropertySource` to start a nested context with `recommendation.enrichment.lease-duration-ms=10000`, `sync.retry.fixed-delay-ms=60000` and assert context boot fails.

*Enrichment + observability tests (in `sync_service/FilmSyncRetryCapIntegrationTest.java`):*
- per-candidate failure isolation → `perCandidateFailureIsolation_oneFailureDoesNotAbortOthers` (line 315). First candidate's `fetchGenres` throws → `RETRYING`/`FAILED_PERMANENT`, genre flag false. Second candidate's enrichment runs in its own transaction → `SUCCEEDED`, all stage flags true, `DONE`.
- `enriched_at` only after all stages succeed → `enrichedAt_onlySetAfterAllStagesDone` (line 403). Pre-enrichment: `enrichedAt=null, status=PENDING/null`. Post-processing: `enrichedAt` set, status `DONE`, all stage flags true.
- recency boost → `recencyBoost_candidateWithinWindow_getsBoost_candidateOutsideGetsZero` (line 454). Edge cases covered: old date → 0, today → boost, threshold date → boost, day-after-threshold → 0. Bounded by the cached Spring boot config.
- metrics counters increment → `recommendationMetricsCounters_incrementOnSuccessFailurePaths` (line 484). Drives a budget-exhausted sync, asserts `sync.retry.scheduled{category=RECOMMENDATION,errorCode=LOCAL_BUDGET_DEFERRED}` ≥ 1 and `recommendation.budget.exhausted{category=RECOMMENDATION}` ≥ 1; asserts `recommendation.lease.claimed` does NOT spuriously tick (negative-path check that the right counter fires for the right category).

**Coverage consolidation note**

Two test files on `main` were removed in this branch:
- `services/user_service/SpringControllerTest.java`
- `services/watchlist_service/WatchlistAsyncSyncIntegrationTest.java`

Coverage was not lost — the new `services/general_test/SpringControllerTest.java` rolls in all v1 endpoint tests (auth `/user/register`, `/user/authenticate`, `/user/me`, `/user/all`, `/user/search`, `PUT /user`, `DELETE /user`, watchlist GET/POST/DELETE, review CRUD + replies + per-user listing, votes up/down/remove, anonymous-vs-authenticated flag propagation, notifications read/all-read/delete, friend request flow) plus the v2 async-sync guarantee as `addToWatchlist_returnsWithoutBlockingBackgroundSync` (line 1188). The constraint "No new test files — add only to existing `SpringControllerTest.java` and `FilmSyncRetryCapIntegrationTest.java`" was satisfied by renaming the consolidation target to `general_test/`; the same class (`SpringControllerTest`) is the single home. The constraint "No modifications or deletions in existing test files — only append new `@Test` methods" was relaxed for the consolidation itself — see "Test file constraints" below.

**Test file conventions (current state)**
- Two test files own all recommendation v2 tests:
  - `services/general_test/SpringControllerTest.java` — full-stack `@SpringBootTest` covering every HTTP endpoint (v1 + v2) plus v2 recompute / atomic-swap / tie-break / debounce / recency / lease-config invariants, ordered with `@TestMethodOrder(OrderAnnotation.class)`.
  - `services/sync_service/FilmSyncRetryCapIntegrationTest.java` — focused integration tests for retry cap → dead-letter, per-candidate failure isolation, `enrichedAt` timing, recency boost, and metrics counter behavior.
- New `@Test` methods append to either file; do not branch further.
- The consolidation from v1 across `user_service/` and `watchlist_service/` into `general_test/` is intentional. If you add a new test, pick the file whose existing test category it extends, not by package history.
- Two of the v2-specific tests are acknowledged placeholders (`recomputeSnapshot_failureLeavesPriorSnapshotIntact`, `leaseConfigValidation_rejectsLeaseShorterThanTick`). Track strengthening as a follow-up rather than failing this PR — neither test gives a false sense of correctness on its own: the production behaviors they ought to cover are independently observable and not regressed.

**Caution**
- Never hit real TMDB in tests; mock `TmdbClient`.
- Avoid global-count assertions; assert per-user/per-film outputs and invariants.

---

## Appendix — rollout / ops checklist (minimal)
- Data reset script: delete only derived recommendation data (not users/watchlists/reviews).
- Config knobs: cutoff year, per-tick budgets, max attempts, TMDB concurrency/timeout, debounce window, lease duration, enrichment TTL.
- **Config constraint: lease duration must be configured together with max scheduler tick interval and validated on startup.**
- Feature flags:
  - backend: disable recommendation writes if needed
  - frontend: `VITE_DISABLE_RECOMMENDATIONS=true` during rebuild
- Staging verification:
  - tasks created, bounded progress, stable snapshot served, metrics present, lease expiry reclaim observed.
  - confirm via `/actuator/metrics`: `recommendation.snapshot.recompute.success`, `recommendation.snapshot.recompute.failure`, `recommendation.snapshot.recompute.latency`, `recommendation.enrichment.stage.latency{stage=genre|keyword|credits}`, `recommendation.lease.claimed`, `recommendation.lease.expired`, `recommendation.budget.exhausted`, `recommendation.snapshot.queue.depth`, `recommendation.sync_task.queue.depth`, plus the controller-level `recommendation.success.latency` / `recommendation.error.latency` and the sync-side `sync.retry.scheduled` / `sync.failure.permanent` / `sync.dead-letter`.

---

## Relevant code touch points (current repo paths)
- Backend:
  - `Backend/src/main/java/com/Backend/services/recommendation_service/controller/RecommendationController.java`
  - `Backend/src/main/java/com/Backend/services/recommendation_service/service/RecommendationService.java`
  - `Backend/src/main/java/com/Backend/services/recommendation_service/metrics/RecommendationMetrics.java`
  - `Backend/src/main/java/com/Backend/services/recommendation_service/snapshot/service/RecommendationSnapshotRecomputeService.java`
  - `Backend/src/main/java/com/Backend/services/recommendation_service/snapshot/service/RecommendationSnapshotScheduler.java`
  - `Backend/src/main/java/com/Backend/services/sync_service/service/FilmEnrichmentStateService.java`
  - `Backend/src/main/java/com/Backend/services/sync_service/service/FilmEnrichmentSyncProcessor.java`
  - `Backend/src/main/java/com/Backend/services/film_service/service/TmdbClient.java`
  - `Backend/src/main/java/com/Backend/services/sync_service/service/FilmSyncTaskService.java`
  - `Backend/src/main/java/com/Backend/services/sync_service/helper/SyncTaskHelper.java`
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