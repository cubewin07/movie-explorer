package com.Backend.services.recommendation_service.metrics;

import com.Backend.services.sync_service.model.SyncCategory;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicLong;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Centralized observability for the recommendation v2 pipeline.
 *
 * <p>Registers all timers, counters, and gauges described in Phase 4 of the
 * recommendation v2 plan. Tag cardinality is intentionally bounded — no
 * per-user or per-film tags.
 *
 * <p>Metrics registered:
 * <ul>
 *   <li>{@code recommendation.snapshot.recompute.latency} — timer for full snapshot recompute</li>
 *   <li>{@code recommendation.snapshot.recompute.success} / {@code .failure} — counters</li>
 *   <li>{@code recommendation.snapshot.queue.depth} — gauge of pending {@code user_recompute_tasks} rows</li>
 *   <li>{@code recommendation.sync_task.queue.depth} — gauge of pending {@code sync_task} rows by category</li>
 *   <li>{@code recommendation.enrichment.stage.latency} — per-stage (genre/keyword/credits) timers</li>
 *   <li>{@code recommendation.lease.claimed} / {@code .expired} — lease lifecycle counters</li>
 *   <li>{@code recommendation.budget.exhausted} — counter for budget-limit events</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RecommendationMetrics {

    private static final String PREFIX = "recommendation";

    private final MeterRegistry meterRegistry;

    // -------------------------------------------------------------------------
    // Snapshot recompute
    // -------------------------------------------------------------------------
    private Timer snapshotRecomputeLatencyTimer;
    private Counter snapshotRecomputeSuccessCounter;
    private Counter snapshotRecomputeFailureCounter;

    // -------------------------------------------------------------------------
    // Queue depth gauges (backed by atomic longs updated by scheduled sampling)
    // -------------------------------------------------------------------------
    private final AtomicLong recomputeQueueDepth = new AtomicLong(0);
    private final AtomicLong syncTaskQueueDepth = new AtomicLong(0);

    // -------------------------------------------------------------------------
    // Enrichment stage latency timers
    // -------------------------------------------------------------------------
    private Timer enrichmentGenreLatencyTimer;
    private Timer enrichmentKeywordLatencyTimer;
    private Timer enrichmentCreditsLatencyTimer;

    // -------------------------------------------------------------------------
    // Lease lifecycle
    // -------------------------------------------------------------------------
    private Counter leaseClaimedCounter;
    private Counter leaseExpiredCounter;

    // -------------------------------------------------------------------------
    // Budget events
    // -------------------------------------------------------------------------
    private Counter budgetExhaustedCounter;

    @PostConstruct
    void init() {
        // Snapshot recompute timer
        snapshotRecomputeLatencyTimer = Timer.builder(PREFIX + ".snapshot.recompute.latency")
                .description("Latency for full user recommendation snapshot recompute")
                .publishPercentileHistogram()
                .serviceLevelObjectives(
                        Duration.ofMillis(100),
                        Duration.ofMillis(500),
                        Duration.ofSeconds(2),
                        Duration.ofSeconds(5))
                .register(meterRegistry);

        snapshotRecomputeSuccessCounter = Counter.builder(PREFIX + ".snapshot.recompute.success")
                .description("Count of successful snapshot recompute runs")
                .register(meterRegistry);

        snapshotRecomputeFailureCounter = Counter.builder(PREFIX + ".snapshot.recompute.failure")
                .description("Count of failed snapshot recompute runs")
                .register(meterRegistry);

        // Queue depth gauges
        Gauge.builder(PREFIX + ".snapshot.queue.depth", recomputeQueueDepth, AtomicLong::get)
                .description("Number of pending user recompute tasks")
                .register(meterRegistry);

        Gauge.builder(PREFIX + ".sync_task.queue.depth", syncTaskQueueDepth, AtomicLong::get)
                .description("Number of pending sync tasks")
                .register(meterRegistry);

        // Per-stage enrichment timers
        enrichmentGenreLatencyTimer = Timer.builder(PREFIX + ".enrichment.stage.latency")
                .description("Latency for genre enrichment stage")
                .tag("stage", "genre")
                .publishPercentileHistogram()
                .serviceLevelObjectives(Duration.ofSeconds(1), Duration.ofSeconds(5))
                .register(meterRegistry);

        enrichmentKeywordLatencyTimer = Timer.builder(PREFIX + ".enrichment.stage.latency")
                .description("Latency for keyword enrichment stage")
                .tag("stage", "keyword")
                .publishPercentileHistogram()
                .serviceLevelObjectives(Duration.ofSeconds(1), Duration.ofSeconds(5))
                .register(meterRegistry);

        enrichmentCreditsLatencyTimer = Timer.builder(PREFIX + ".enrichment.stage.latency")
                .description("Latency for credits enrichment stage")
                .tag("stage", "credits")
                .publishPercentileHistogram()
                .serviceLevelObjectives(Duration.ofSeconds(1), Duration.ofSeconds(5))
                .register(meterRegistry);

        // Lease lifecycle
        leaseClaimedCounter = Counter.builder(PREFIX + ".lease.claimed")
                .description("Count of enrichment leases successfully claimed")
                .register(meterRegistry);

        leaseExpiredCounter = Counter.builder(PREFIX + ".lease.expired")
                .description("Count of enrichment leases that expired and were reclaimed")
                .register(meterRegistry);

        // Budget events
        budgetExhaustedCounter = Counter.builder(PREFIX + ".budget.exhausted")
                .description("Count of budget-exhausted events that deferred work")
                .register(meterRegistry);
    }

    // -------------------------------------------------------------------------
    // Snapshot recompute
    // -------------------------------------------------------------------------

    public Timer.Sample startSnapshotRecomputeTimer() {
        return Timer.start(meterRegistry);
    }

    public void stopSnapshotRecomputeTimer(Timer.Sample sample, boolean success) {
        sample.stop(snapshotRecomputeLatencyTimer);
        if (success) {
            snapshotRecomputeSuccessCounter.increment();
        } else {
            snapshotRecomputeFailureCounter.increment();
        }
    }

    public void recordSnapshotRecomputeSuccess() {
        snapshotRecomputeSuccessCounter.increment();
    }

    public void recordSnapshotRecomputeFailure() {
        snapshotRecomputeFailureCounter.increment();
    }

    // -------------------------------------------------------------------------
    // Queue depth (called by scheduled sampling jobs)
    // -------------------------------------------------------------------------

    public void setRecomputeQueueDepth(long depth) {
        recomputeQueueDepth.set(Math.max(0, depth));
    }

    public void setSyncTaskQueueDepth(long depth) {
        syncTaskQueueDepth.set(Math.max(0, depth));
    }

    // -------------------------------------------------------------------------
    // Enrichment stage timers
    // -------------------------------------------------------------------------

    public Timer.Sample startEnrichmentStageTimer() {
        return Timer.start(meterRegistry);
    }

    public void stopEnrichmentGenreTimer(Timer.Sample sample) {
        sample.stop(enrichmentGenreLatencyTimer);
    }

    public void stopEnrichmentKeywordTimer(Timer.Sample sample) {
        sample.stop(enrichmentKeywordLatencyTimer);
    }

    public void stopEnrichmentCreditsTimer(Timer.Sample sample) {
        sample.stop(enrichmentCreditsLatencyTimer);
    }

    // -------------------------------------------------------------------------
    // Lease lifecycle
    // -------------------------------------------------------------------------

    public void recordLeaseClaimed() {
        leaseClaimedCounter.increment();
    }

    public void recordLeaseExpired() {
        leaseExpiredCounter.increment();
    }

    // -------------------------------------------------------------------------
    // Budget events
    // -------------------------------------------------------------------------

    public void recordBudgetExhausted() {
        budgetExhaustedCounter.increment();
    }

    public void recordBudgetExhausted(SyncCategory category) {
        meterRegistry.counter(
                PREFIX + ".budget.exhausted",
                "category", category == null ? "unknown" : category.name()
        ).increment();
    }
}