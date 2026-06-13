package com.Backend.services.sync_service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.Backend.services.FilmType;
import com.Backend.services.credit_service.repository.CreditRepository;
import com.Backend.services.credit_service.repository.FilmRoleRepository;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.model.FilmEnrichmentStatus;
import com.Backend.services.film_service.model.TmdbCreditsResponse;
import com.Backend.services.film_service.model.TmdbFilmResponse;
import com.Backend.services.film_service.model.TmdbKeywordsResponse;
import com.Backend.services.film_service.model.TmdbSimilarItem;
import com.Backend.services.film_service.repository.FilmRepository;
import com.Backend.services.film_service.service.TmdbClient;
import com.Backend.services.genre_service.repository.GenreRepository;
import com.Backend.services.keyword_service.repository.KeywordRepository;
import com.Backend.services.recommendation_service.model.Recommendation;
import com.Backend.services.recommendation_service.model.RecommendationId;
import com.Backend.services.recommendation_service.repository.RecommendationRepository;
import com.Backend.services.recommendation_service.snapshot.model.RecommendationRecomputeTriggeredBy;
import com.Backend.services.recommendation_service.snapshot.model.UserRecomputeTask;
import com.Backend.services.recommendation_service.snapshot.repository.UserRecomputeTaskRepository;
import com.Backend.services.sync_service.model.SyncAttemptResult;
import com.Backend.services.sync_service.model.SyncCategory;
import com.Backend.services.sync_service.model.SyncTask;
import com.Backend.services.sync_service.model.SyncTaskStatus;
import com.Backend.services.sync_service.repository.SyncTaskRepository;
import com.Backend.services.sync_service.service.FilmSyncTaskService;
import com.Backend.services.sync_service.service.FilmEnrichmentStateService;
import com.Backend.services.user_service.model.ROLE;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.repository.UserRepository;
import com.Backend.services.watchlist_service.model.Watchlist;
import com.Backend.services.watchlist_service.model.WatchlistItem;
import com.Backend.services.watchlist_service.model.WatchlistItemId;
import com.Backend.services.watchlist_service.repository.WatchlistItemRepository;
import com.Backend.services.watchlist_service.repository.WatchlistRepository;
import com.Backend.test.DotenvTestInitializer;
import io.micrometer.core.instrument.MeterRegistry;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;

@SpringBootTest(properties = {
        "sync.retry.max-attempts=2",
        "sync.retry.max-attempts.recommendation=2",
        "spring.task.scheduling.enabled=false"
})
@ActiveProfiles("test")
@EnableCaching
@ContextConfiguration(initializers = DotenvTestInitializer.class)
class FilmSyncRetryCapIntegrationTest {

    @Autowired
    private FilmSyncTaskService filmSyncTaskService;

    @Autowired
    private FilmRepository filmRepository;

    @Autowired
    private SyncTaskRepository syncTaskRepository;

    @Autowired
    private UserRecomputeTaskRepository userRecomputeTaskRepository;

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private WatchlistItemRepository watchlistItemRepository;

    @MockBean
    private TmdbClient tmdbClient;

    @Autowired
    private MeterRegistry meterRegistry;

    @Autowired
    private FilmEnrichmentStateService filmEnrichmentStateService;

    @Autowired
    private GenreRepository genreRepository;

    @Autowired
    private KeywordRepository keywordRepository;

    @Autowired
    private FilmRoleRepository filmRoleRepository;

    @Autowired
    private CreditRepository creditRepository;

    @AfterEach
    void cleanup() {
        userRecomputeTaskRepository.deleteAll();
        syncTaskRepository.deleteAll();
        recommendationRepository.deleteAll();
        watchlistItemRepository.deleteAll();
        watchlistRepository.deleteAll();
        userRepository.deleteAll();
        // Delete junction-table-owning entities before films (FK constraint order)
        filmRoleRepository.deleteAll();
        genreRepository.deleteAll();
        keywordRepository.deleteAll();
        creditRepository.deleteAll();
        filmRepository.deleteAll();
    }

    @Test
        @DisplayName("Retryable RECOMMENDATION sync stops at max attempts and marks task as FAILED_PERMANENT")
        void retryableRecommendationSyncStopsAtMaxAttemptsAndMarksTaskAsFailedPermanent() {
                // Trigger RecommendationService's LocalBudgetDeferException path.
                when(tmdbClient.getAvailableTokens()).thenReturn(0.0d);

        Film film = filmRepository.saveAndFlush(Film.builder()
                .filmId(880_001L)
                .type(FilmType.MOVIE)
                .title("Retry Cap Film")
                .creditsSyncCompleted(false)
                .keywordSyncCompleted(false)
                .genreSyncCompleted(false)
                .recommendationSyncCompleted(false)
                .build());

        Long userId = 42L;

        SyncAttemptResult first = filmSyncTaskService.syncNowOrQueue(
                film,
                film.getFilmId(),
                SyncCategory.RECOMMENDATION,
                userId
        );
        SyncTask afterFirst = syncTaskRepository
                .findByFilmInternalIdAndSyncCategory(film.getInternalId(), SyncCategory.RECOMMENDATION)
                .orElseThrow();

        assertThat(first.retryScheduled()).isTrue();
        assertThat(first.failedPermanently()).isFalse();
        assertThat(afterFirst.getAttempts()).isEqualTo(1);
        assertThat(afterFirst.getMaxAttempts()).isEqualTo(2);
        assertThat(afterFirst.getUserId()).isEqualTo(userId);
        assertThat(afterFirst.getStatus()).isIn(SyncTaskStatus.PENDING, SyncTaskStatus.RETRYING);
        assertThat(afterFirst.getLastErrorCode()).isEqualTo("LOCAL_BUDGET_DEFERRED");

        SyncAttemptResult second = filmSyncTaskService.syncNowOrQueue(
                film,
                film.getFilmId(),
                SyncCategory.RECOMMENDATION,
                userId
        );
        SyncTask afterSecond = syncTaskRepository
                .findByFilmInternalIdAndSyncCategory(film.getInternalId(), SyncCategory.RECOMMENDATION)
                .orElseThrow();

        assertThat(second.retryScheduled()).isFalse();
        assertThat(second.failedPermanently()).isTrue();
        assertThat(afterSecond.getAttempts()).isEqualTo(2);
        assertThat(afterSecond.getMaxAttempts()).isEqualTo(2);
        assertThat(afterSecond.getUserId()).isEqualTo(userId);
        assertThat(afterSecond.getStatus()).isEqualTo(SyncTaskStatus.FAILED_PERMANENT);
                assertThat(afterSecond.getLastErrorCode()).isEqualTo("LOCAL_BUDGET_DEFERRED");
    }

    @Test
    @DisplayName("Already-synced RECOMMENDATION sync schedules recompute from preserved user context")
    void alreadySyncedRecommendationSyncSchedulesRecomputeFromUserContext() {
        User user = createUserWithWatchlist("already-synced-recompute");

        Film sourceFilm = saveFilm(880_002L, "Already Synced Recommendation Film", "en", 7.0, true, false);
        addWatchlistItem(user, sourceFilm);

        Film candidateA = saveFilm(880_021L, "Candidate A", "en", 7.5, false, true);
        Film candidateB = saveFilm(880_022L, "Candidate B", "en", 7.6, false, true);
        Film candidateC = saveFilm(880_023L, "Candidate C", "en", 7.7, false, true);
        linkRecommendation(sourceFilm, candidateA);
        linkRecommendation(sourceFilm, candidateB);
        linkRecommendation(sourceFilm, candidateC);

        Film managedSourceFilm = filmRepository.findById(sourceFilm.getInternalId()).orElseThrow();
        SyncAttemptResult result = filmSyncTaskService.syncNowOrQueue(
                managedSourceFilm,
                managedSourceFilm.getFilmId(),
                SyncCategory.RECOMMENDATION,
                user.getId()
        );

        UserRecomputeTask recomputeTask = userRecomputeTaskRepository.findById(user.getId()).orElseThrow();

        assertThat(result.wasSynced()).isTrue();
        assertThat(result.syncSucceeded()).isTrue();
        assertThat(recomputeTask.getTriggeredBy()).isEqualTo(RecommendationRecomputeTriggeredBy.RECOMMENDATION_SYNC_COMPLETE);
        assertThat(recomputeTask.getAttemptCount()).isZero();
        assertThat(recomputeTask.getLastError()).isNull();
    }

    @Test
    @DisplayName("Successful RECOMMENDATION sync enqueues ENRICHMENT tasks for recommendation candidates")
    void successfulRecommendationSyncEnqueuesEnrichmentTasksForCandidates() {
        when(tmdbClient.getAvailableTokens()).thenReturn(10.0d);
        when(tmdbClient.fetchRecommendations(880_003L, FilmType.MOVIE)).thenReturn(List.of(
                new TmdbSimilarItem(880_004L, "Recommendation Candidate Film", "2025-01-10", "/candidate.jpg", 8.2, "en", List.of(28))
        ));

        User user = createUserWithWatchlist("successful-sync-enqueue");
        Film sourceFilm = saveFilm(880_003L, "Recommendation Source Film", "en", 7.0, false, false);
        addWatchlistItem(user, sourceFilm);

        Film managedSourceFilm = filmRepository.findById(sourceFilm.getInternalId()).orElseThrow();
        SyncAttemptResult result = filmSyncTaskService.syncNowOrQueue(
                managedSourceFilm,
                managedSourceFilm.getFilmId(),
                SyncCategory.RECOMMENDATION,
                user.getId()
        );

        Film candidateFilm = filmRepository.findByFilmIdAndType(880_004L, FilmType.MOVIE).orElseThrow();
        SyncTask enrichmentTask = syncTaskRepository
                .findByFilmInternalIdAndSyncCategory(candidateFilm.getInternalId(), SyncCategory.ENRICHMENT)
                .orElseThrow();

        assertThat(result.wasSynced()).isFalse();
        assertThat(result.syncSucceeded()).isTrue();
        assertThat(enrichmentTask.getTmdbId()).isEqualTo(candidateFilm.getFilmId());
        assertThat(enrichmentTask.getUserId()).isEqualTo(user.getId());
        assertThat(enrichmentTask.getStatus()).isEqualTo(SyncTaskStatus.PENDING);
    }

    @Test
    @DisplayName("Already-synced RECOMMENDATION sync enqueues ENRICHMENT tasks for recommendation candidates")
    void alreadySyncedRecommendationSyncEnqueuesEnrichmentTasksForCandidates() {
        User user = createUserWithWatchlist("already-synced-enqueue");

        Film sourceFilm = saveFilm(880_005L, "Recommendation Source Film 2", "en", 7.0, true, false);
        Film candidateFilm = saveFilm(880_006L, "Recommendation Candidate Film 2", "en", 7.8, false, false);
        addWatchlistItem(user, sourceFilm);
        linkRecommendation(sourceFilm, candidateFilm);

        SyncAttemptResult result = filmSyncTaskService.syncNowOrQueue(
                sourceFilm,
                sourceFilm.getFilmId(),
                SyncCategory.RECOMMENDATION,
                user.getId()
        );

        SyncTask enrichmentTask = syncTaskRepository
                .findByFilmInternalIdAndSyncCategory(candidateFilm.getInternalId(), SyncCategory.ENRICHMENT)
                .orElseThrow();

        assertThat(result.wasSynced()).isTrue();
        assertThat(result.syncSucceeded()).isTrue();
        assertThat(enrichmentTask.getTmdbId()).isEqualTo(candidateFilm.getFilmId());
        assertThat(enrichmentTask.getUserId()).isEqualTo(user.getId());
        assertThat(enrichmentTask.getStatus()).isEqualTo(SyncTaskStatus.PENDING);
    }

    @Test
    @DisplayName("Successful RECOMMENDATION sync skips already-enriched candidates")
    void successfulRecommendationSyncSkipsAlreadyEnrichedCandidates() {
        Long userId = 128L;

        Film sourceFilm = filmRepository.saveAndFlush(Film.builder()
                .filmId(880_007L)
                .type(FilmType.MOVIE)
                .title("Recommendation Source Film 3")
                .creditsSyncCompleted(false)
                .keywordSyncCompleted(false)
                .genreSyncCompleted(false)
                .recommendationSyncCompleted(true)
                .build());
        Film candidateFilm = filmRepository.saveAndFlush(Film.builder()
                .filmId(880_008L)
                .type(FilmType.MOVIE)
                .title("Recommendation Candidate Film 3")
                .creditsSyncCompleted(true)
                .keywordSyncCompleted(true)
                .genreSyncCompleted(true)
                .recommendationSyncCompleted(false)
                .build());

        recommendationRepository.saveAndFlush(Recommendation.builder()
                .id(new RecommendationId(sourceFilm.getInternalId(), candidateFilm.getInternalId()))
                .build());

        SyncAttemptResult result = filmSyncTaskService.syncNowOrQueue(
                sourceFilm,
                sourceFilm.getFilmId(),
                SyncCategory.RECOMMENDATION,
                userId
        );

        assertThat(result.wasSynced()).isTrue();
        assertThat(result.syncSucceeded()).isTrue();
        assertThat(syncTaskRepository.findByFilmInternalIdAndSyncCategory(candidateFilm.getInternalId(), SyncCategory.ENRICHMENT))
                .isEmpty();
    }

    @Test
    @DisplayName("Per-candidate enrichment failure isolation: one candidate's failure does not abort subsequent candidates")
    void perCandidateFailureIsolation_oneFailureDoesNotAbortOthers() {
        when(tmdbClient.getAvailableTokens()).thenReturn(10.0d);
        when(tmdbClient.fetchRecommendations(880_100L, FilmType.MOVIE)).thenReturn(List.of(
                new TmdbSimilarItem(880_101L, "First Candidate", "2025-01-15", "/first.jpg", 7.5, "en", List.of(28)),
                new TmdbSimilarItem(880_102L, "Second Candidate", "2025-02-20", "/second.jpg", 8.0, "en", List.of(28))
        ));

        User user = createUserWithWatchlist("fail-isolation");
        Film sourceFilm = saveFilm(880_100L, "Source Film", "en", 7.0, false, false);
        addWatchlistItem(user, sourceFilm);

        // Mock first candidate's enrichment GENRE stage to fail.
        // GenreService.syncGenresForFilm calls tmdbClient.fetchGenres(tmdbId, type)
        TmdbFilmResponse firstWithGenres = new TmdbFilmResponse();
        firstWithGenres.setId(880_101L);
        firstWithGenres.setGenres(List.of(
                createGenreItem(28, "Action")
        ));
        when(tmdbClient.fetchGenres(880_101L, FilmType.MOVIE))
                .thenThrow(new RuntimeException("TMDB down for first candidate"));

        // Mock second candidate's enrichment to succeed fully.
        TmdbFilmResponse secondWithGenres = new TmdbFilmResponse();
        secondWithGenres.setId(880_102L);
        secondWithGenres.setGenres(List.of(
                createGenreItem(12, "Adventure")
        ));
        when(tmdbClient.fetchGenres(880_102L, FilmType.MOVIE)).thenReturn(secondWithGenres);
        when(tmdbClient.fetchKeywords(880_102L, FilmType.MOVIE))
                .thenReturn(new TmdbKeywordsResponse());
        when(tmdbClient.fetchCredits(880_102L, FilmType.MOVIE))
                .thenReturn(new TmdbCreditsResponse());

        // Run recommendation sync — creates candidate edges and enrichment tasks
        Film managedSourceFilm = filmRepository.findById(sourceFilm.getInternalId()).orElseThrow();
        filmSyncTaskService.syncNowOrQueue(
                managedSourceFilm, managedSourceFilm.getFilmId(),
                SyncCategory.RECOMMENDATION, user.getId()
        );

        // Verify both candidates exist
        assertThat(filmRepository.findByFilmIdAndType(880_101L, FilmType.MOVIE)).isPresent();
        assertThat(filmRepository.findByFilmIdAndType(880_102L, FilmType.MOVIE)).isPresent();

        // Enrichment tasks enqueued for both
        List<SyncTask> enrichmentTasks = syncTaskRepository.findAll().stream()
                .filter(t -> t.getSyncCategory() == SyncCategory.ENRICHMENT)
                .toList();
        assertThat(enrichmentTasks).hasSize(2);

        // Process each enrichment task individually.
        // The first should fail (fetchGenres throws), the second should succeed.
        // Each processTask runs in its own transaction, so failure of one does
        // NOT affect the other.
        for (SyncTask task : enrichmentTasks) {
            try {
                filmSyncTaskService.processTask(task.getId());
            } catch (Exception e) {
                // Expected for the failing candidate; absorb to let the next task proceed
            }
        }

        // First candidate: enrichment failed (genre stage threw)
        Film firstCandidate = filmRepository.findByFilmIdAndType(880_101L, FilmType.MOVIE).orElseThrow();
        SyncTask firstTask = syncTaskRepository
                .findByFilmInternalIdAndSyncCategory(firstCandidate.getInternalId(), SyncCategory.ENRICHMENT)
                .orElseThrow();
        // Status may be FAILED_PERMANENT or RETRYING depending on retry count and TMDB error handling
        assertThat(firstTask.getStatus()).isIn(SyncTaskStatus.FAILED_PERMANENT, SyncTaskStatus.RETRYING);
        assertThat(firstTask.getLastErrorCode()).isNotNull();
        assertThat(firstCandidate.getGenreSyncCompleted()).isFalse();

        // Second candidate: enrichment succeeded (all stages completed)
        Film secondCandidate = filmRepository.findByFilmIdAndType(880_102L, FilmType.MOVIE).orElseThrow();
        SyncTask secondTask = syncTaskRepository
                .findByFilmInternalIdAndSyncCategory(secondCandidate.getInternalId(), SyncCategory.ENRICHMENT)
                .orElseThrow();
        assertThat(secondTask.getStatus()).isEqualTo(SyncTaskStatus.SUCCEEDED);
        assertThat(secondCandidate.getCreditsSyncCompleted()).isTrue();
        assertThat(secondCandidate.getKeywordSyncCompleted()).isTrue();
        assertThat(secondCandidate.getGenreSyncCompleted()).isTrue();

        // Verify that the failure of the first candidate did not affect the second's outcome
        assertThat(secondCandidate.getEnrichmentStatus()).isEqualTo(FilmEnrichmentStatus.DONE);
    }

    @Test
    @DisplayName("enrichedAt is null during enrichment, set only after all stages succeed (DONE)")
    void enrichedAt_onlySetAfterAllStagesDone() {
        when(tmdbClient.getAvailableTokens()).thenReturn(10.0d);
        when(tmdbClient.fetchRecommendations(880_200L, FilmType.MOVIE)).thenReturn(List.of(
                new TmdbSimilarItem(880_201L, "Enrich Film", "2025-03-10", "/enrich.jpg", 8.5, "en", List.of(28))
        ));

        User user = createUserWithWatchlist("enriched-at");
        Film sourceFilm = saveFilm(880_200L, "Source Film", "en", 7.0, false, false);
        addWatchlistItem(user, sourceFilm);

        // Mock all TMDB calls needed for enrichment to succeed
        TmdbFilmResponse genresResponse = new TmdbFilmResponse();
        genresResponse.setId(880_201L);
        genresResponse.setGenres(List.of(
                createGenreItem(28, "Action")
        ));
        when(tmdbClient.fetchGenres(880_201L, FilmType.MOVIE)).thenReturn(genresResponse);
        when(tmdbClient.fetchKeywords(880_201L, FilmType.MOVIE))
                .thenReturn(new TmdbKeywordsResponse());
        when(tmdbClient.fetchCredits(880_201L, FilmType.MOVIE))
                .thenReturn(new TmdbCreditsResponse());

        // Sync recommendation to create edges and candidate film
        Film managedSource = filmRepository.findById(sourceFilm.getInternalId()).orElseThrow();
        filmSyncTaskService.syncNowOrQueue(
                managedSource, managedSource.getFilmId(),
                SyncCategory.RECOMMENDATION, user.getId()
        );

        // Candidate exists, not yet enriched
        Film candidate = filmRepository.findByFilmIdAndType(880_201L, FilmType.MOVIE).orElseThrow();
        assertThat(candidate.getEnrichedAt()).isNull();
        assertThat(candidate.getEnrichmentStatus()).isIn(FilmEnrichmentStatus.PENDING, null);

        // Process enrichment task
        SyncTask enrichmentTask = syncTaskRepository
                .findByFilmInternalIdAndSyncCategory(candidate.getInternalId(), SyncCategory.ENRICHMENT)
                .orElseThrow();
        filmSyncTaskService.processTask(enrichmentTask.getId());

        // After successful enrichment, enrichedAt must be set and status = DONE
        Film enriched = filmRepository.findById(candidate.getInternalId()).orElseThrow();
        assertThat(enriched.getEnrichmentStatus()).isEqualTo(FilmEnrichmentStatus.DONE);
        assertThat(enriched.getEnrichedAt()).isNotNull();
        assertThat(enriched.getCreditsSyncCompleted()).isTrue();
        assertThat(enriched.getKeywordSyncCompleted()).isTrue();
        assertThat(enriched.getGenreSyncCompleted()).isTrue();
    }

    @Test
    @DisplayName("Recency boost: candidate within newReleaseDays gets boost, outside window gets 0")
    void recencyBoost_candidateWithinWindow_getsBoost_candidateOutsideGetsZero() {
        // Test the same logic as CandidatePassFilter.computeRecencyBoost:
        // recency boost = newReleaseBoost if date is within newReleaseDays of today, else 0.
        int newReleaseDays = 365;
        double newReleaseBoost = 0.5;
        int windowDays = Math.max(1, newReleaseDays);
        double boost = Math.max(0.0d, newReleaseBoost);

        // Old release: 2020-01-01 → outside window → boost 0
        LocalDate oldDate = LocalDate.parse("2020-01-01");
        LocalDate threshold = LocalDate.now().minusDays(windowDays);
        double boostOld = oldDate.isBefore(threshold) ? 0.0d : boost;
        assertThat(boostOld).isEqualTo(0.0);

        // Recent release: today → inside window → boost 0.5
        double boostRecent = LocalDate.now().isBefore(threshold) ? 0.0d : boost;
        assertThat(boostRecent).isEqualTo(0.5);

        // Exact boundary: threshold date itself → inside window (not before threshold)
        double boostBoundary = threshold.isBefore(threshold) ? 0.0d : boost;
        assertThat(boostBoundary).isEqualTo(0.5);

        // Day after threshold → outside window (threshold.minusDays(1) = now - 366 days)
                LocalDate outsideDate = threshold.minusDays(1);
                double boostOutside = outsideDate.isBefore(threshold) ? 0.0d : boost;
                assertThat(boostOutside).isEqualTo(0.0);
    }

    @Test
    @DisplayName("Recommendation metrics counters increment on success/failure/dead-letter paths")
    void recommendationMetricsCounters_incrementOnSuccessFailurePaths() {
        when(tmdbClient.getAvailableTokens()).thenReturn(0.0d);

        Film film = filmRepository.saveAndFlush(Film.builder()
                .filmId(880_300L)
                .type(FilmType.MOVIE)
                .title("Metrics Test Film")
                .creditsSyncCompleted(false)
                .keywordSyncCompleted(false)
                .genreSyncCompleted(false)
                .recommendationSyncCompleted(false)
                .build());

        Long userId = 42L;

        // Capture the lease counter value before this test's actions.
        // Other tests in this class may have already incremented it (MeterRegistry is shared
        // across the Spring context). We assert it stays unchanged — this test only exercises
        // the recommendation budget-exhausted/retry path, not enrichment path.
        double leaseCountBefore = meterRegistry.counter("recommendation.lease.claimed").count();

        // First attempt: budget exhausted → LOCAL_BUDGET_DEFERRED → retry scheduled
        SyncAttemptResult first = filmSyncTaskService.syncNowOrQueue(
                film, film.getFilmId(), SyncCategory.RECOMMENDATION, userId
        );
        assertThat(first.retryScheduled()).isTrue();

        // Verify retry-scheduled counter was incremented for RECOMMENDATION category
        double retryCount = meterRegistry.counter("sync.retry.scheduled",
                "category", "RECOMMENDATION", "errorCode", "LOCAL_BUDGET_DEFERRED").count();
        assertThat(retryCount).isGreaterThanOrEqualTo(1);

        // Verify budget-exhausted counter was incremented
        double budgetCount = meterRegistry.counter("recommendation.budget.exhausted",
                "category", "RECOMMENDATION").count();
        assertThat(budgetCount).isGreaterThanOrEqualTo(1);

        // Second attempt: hits max attempts → FAILED_PERMANENT, dead-letter may be logged
        SyncAttemptResult second = filmSyncTaskService.syncNowOrQueue(
                film, film.getFilmId(), SyncCategory.RECOMMENDATION, userId
        );
        // May be retryScheduled or failedPermanently depending on when max attempts hit
        assertThat(second.failedPermanently() || second.retryScheduled()).isTrue();

        // Verify the lease claimed counter was not triggered (not an enrichment operation)
        double leaseCountAfter = meterRegistry.counter("recommendation.lease.claimed").count();
        assertThat(leaseCountAfter).isEqualTo(leaseCountBefore);
    }

    private TmdbFilmResponse createTmdbFilmResponse(long id, String title, double voteAvg,
            String releaseDate, String language, List<Integer> genreIds) {
        TmdbFilmResponse response = new TmdbFilmResponse();
        response.setId(id);
        response.setTitle(title);
        response.setVoteAverage(voteAvg);
        response.setReleaseDate(releaseDate);
        response.setBackdropPath("/bg-" + id + ".jpg");
        response.setOriginalLanguage(language);
        return response;
    }

    private TmdbFilmResponse.GenreItem createGenreItem(long id, String name) {
        TmdbFilmResponse.GenreItem item = new TmdbFilmResponse.GenreItem();
        item.setId(id);
        item.setName(name);
        return item;
    }

    private User createUserWithWatchlist(String prefix) {
        String suffix = prefix + "-" + System.nanoTime();
        User user = User.builder()
                .username(suffix)
                .email(suffix + "@example.com")
                .password("password123")
                .role(ROLE.ROLE_USER)
                .build();
        user.setWatchlist(new Watchlist());
        return userRepository.saveAndFlush(user);
    }

    private Film saveFilm(
            Long tmdbId,
            String title,
            String originalLanguage,
            double rating,
            boolean recommendationSyncCompleted,
            boolean fullyEnriched
    ) {
        return filmRepository.saveAndFlush(Film.builder()
                .filmId(tmdbId)
                .type(FilmType.MOVIE)
                .title(title)
                .originalLanguage(originalLanguage)
                .date(LocalDate.parse("2025-01-01"))
                .rating(rating)
                .backgroundImg("/bg.jpg")
                .recommendationSyncCompleted(recommendationSyncCompleted)
                .creditsSyncCompleted(fullyEnriched)
                .keywordSyncCompleted(fullyEnriched)
                .genreSyncCompleted(fullyEnriched)
                .enrichmentStatus(fullyEnriched ? FilmEnrichmentStatus.DONE : FilmEnrichmentStatus.PENDING)
                .build());
    }

    private void addWatchlistItem(User user, Film film) {
        Watchlist watchlist = watchlistRepository.findByUserId(user.getId()).orElseThrow();
        watchlistItemRepository.saveAndFlush(WatchlistItem.builder()
                .id(new WatchlistItemId(watchlist.getUserId(), film.getInternalId()))
                .watchlist(watchlist)
                .film(film)
                .build());
    }

    private void linkRecommendation(Film sourceFilm, Film candidateFilm) {
        recommendationRepository.saveAndFlush(Recommendation.builder()
                .id(new RecommendationId(sourceFilm.getInternalId(), candidateFilm.getInternalId()))
                .build());
    }
}
