package com.Backend.services.sync_service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.model.FilmEnrichmentStatus;
import com.Backend.services.film_service.model.TmdbSimilarItem;
import com.Backend.services.film_service.repository.FilmRepository;
import com.Backend.services.film_service.service.TmdbClient;
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
import com.Backend.services.user_service.model.ROLE;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.repository.UserRepository;
import com.Backend.services.watchlist_service.model.Watchlist;
import com.Backend.services.watchlist_service.model.WatchlistItem;
import com.Backend.services.watchlist_service.model.WatchlistItemId;
import com.Backend.services.watchlist_service.repository.WatchlistItemRepository;
import com.Backend.services.watchlist_service.repository.WatchlistRepository;
import com.Backend.test.DotenvTestInitializer;
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

    @AfterEach
    void cleanup() {
        userRecomputeTaskRepository.deleteAll();
        syncTaskRepository.deleteAll();
        recommendationRepository.deleteAll();
        watchlistItemRepository.deleteAll();
        watchlistRepository.deleteAll();
        userRepository.deleteAll();
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
