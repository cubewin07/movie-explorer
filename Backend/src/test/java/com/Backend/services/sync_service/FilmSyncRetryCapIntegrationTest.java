package com.Backend.services.sync_service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.repository.FilmRepository;
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
import com.Backend.test.DotenvTestInitializer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import com.Backend.services.film_service.service.TmdbClient;

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

        @MockBean
        private TmdbClient tmdbClient;

    @AfterEach
    void cleanup() {
                userRecomputeTaskRepository.deleteAll();
        syncTaskRepository.deleteAll();
                recommendationRepository.deleteAll();
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
                Long userId = 84L;

                Film film = filmRepository.saveAndFlush(Film.builder()
                                .filmId(880_002L)
                                .type(FilmType.MOVIE)
                                .title("Already Synced Recommendation Film")
                                .creditsSyncCompleted(false)
                                .keywordSyncCompleted(false)
                                .genreSyncCompleted(false)
                                .recommendationSyncCompleted(true)
                                .build());

                SyncAttemptResult result = filmSyncTaskService.syncNowOrQueue(
                                film,
                                film.getFilmId(),
                                SyncCategory.RECOMMENDATION,
                                userId
                );

                UserRecomputeTask recomputeTask = userRecomputeTaskRepository.findById(userId).orElseThrow();

                assertThat(result.wasSynced()).isTrue();
                assertThat(result.syncSucceeded()).isTrue();
                assertThat(recomputeTask.getTriggeredBy()).isEqualTo(RecommendationRecomputeTriggeredBy.RECOMMENDATION_SYNC_COMPLETE);
                assertThat(recomputeTask.getAttemptCount()).isZero();
                assertThat(recomputeTask.getLastError()).isNull();
        }

            @Test
            @DisplayName("Successful RECOMMENDATION sync enqueues ENRICHMENT tasks for recommendation candidates")
            void successfulRecommendationSyncEnqueuesEnrichmentTasksForCandidates() {
                Long userId = 126L;

                Film sourceFilm = filmRepository.saveAndFlush(Film.builder()
                        .filmId(880_003L)
                        .type(FilmType.MOVIE)
                        .title("Recommendation Source Film")
                        .creditsSyncCompleted(false)
                        .keywordSyncCompleted(false)
                        .genreSyncCompleted(false)
                        .recommendationSyncCompleted(true)
                        .build());
                Film candidateFilm = filmRepository.saveAndFlush(Film.builder()
                        .filmId(880_004L)
                        .type(FilmType.MOVIE)
                        .title("Recommendation Candidate Film")
                        .creditsSyncCompleted(false)
                        .keywordSyncCompleted(false)
                        .genreSyncCompleted(false)
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

                SyncTask enrichmentTask = syncTaskRepository
                        .findByFilmInternalIdAndSyncCategory(candidateFilm.getInternalId(), SyncCategory.ENRICHMENT)
                        .orElseThrow();

                assertThat(result.wasSynced()).isTrue();
                assertThat(result.syncSucceeded()).isTrue();
                assertThat(enrichmentTask.getTmdbId()).isEqualTo(candidateFilm.getFilmId());
                assertThat(enrichmentTask.getUserId()).isEqualTo(userId);
                assertThat(enrichmentTask.getStatus()).isEqualTo(SyncTaskStatus.PENDING);
            }

            @Test
            @DisplayName("Already-synced RECOMMENDATION sync enqueues ENRICHMENT tasks for recommendation candidates")
            void alreadySyncedRecommendationSyncEnqueuesEnrichmentTasksForCandidates() {
                Long userId = 127L;

                Film sourceFilm = filmRepository.saveAndFlush(Film.builder()
                        .filmId(880_005L)
                        .type(FilmType.MOVIE)
                        .title("Recommendation Source Film 2")
                        .creditsSyncCompleted(false)
                        .keywordSyncCompleted(false)
                        .genreSyncCompleted(false)
                        .recommendationSyncCompleted(true)
                        .build());
                Film candidateFilm = filmRepository.saveAndFlush(Film.builder()
                        .filmId(880_006L)
                        .type(FilmType.MOVIE)
                        .title("Recommendation Candidate Film 2")
                        .creditsSyncCompleted(false)
                        .keywordSyncCompleted(false)
                        .genreSyncCompleted(false)
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

                SyncTask enrichmentTask = syncTaskRepository
                        .findByFilmInternalIdAndSyncCategory(candidateFilm.getInternalId(), SyncCategory.ENRICHMENT)
                        .orElseThrow();

                assertThat(result.wasSynced()).isTrue();
                assertThat(result.syncSucceeded()).isTrue();
                assertThat(enrichmentTask.getTmdbId()).isEqualTo(candidateFilm.getFilmId());
                assertThat(enrichmentTask.getUserId()).isEqualTo(userId);
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
}
