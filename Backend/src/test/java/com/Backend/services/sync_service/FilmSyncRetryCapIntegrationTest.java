package com.Backend.services.sync_service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.repository.FilmRepository;
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

        @MockBean
        private TmdbClient tmdbClient;

    @AfterEach
    void cleanup() {
        syncTaskRepository.deleteAll();
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

        SyncAttemptResult first = filmSyncTaskService.syncNowOrQueue(film, film.getFilmId(), SyncCategory.RECOMMENDATION);
        SyncTask afterFirst = syncTaskRepository
                .findByFilmInternalIdAndSyncCategory(film.getInternalId(), SyncCategory.RECOMMENDATION)
                .orElseThrow();

        assertThat(first.retryScheduled()).isTrue();
        assertThat(first.failedPermanently()).isFalse();
        assertThat(afterFirst.getAttempts()).isEqualTo(1);
        assertThat(afterFirst.getMaxAttempts()).isEqualTo(2);
        assertThat(afterFirst.getStatus()).isIn(SyncTaskStatus.PENDING, SyncTaskStatus.RETRYING);
        assertThat(afterFirst.getLastErrorCode()).isEqualTo("LOCAL_BUDGET_DEFERRED");

        SyncAttemptResult second = filmSyncTaskService.syncNowOrQueue(film, film.getFilmId(), SyncCategory.RECOMMENDATION);
        SyncTask afterSecond = syncTaskRepository
                .findByFilmInternalIdAndSyncCategory(film.getInternalId(), SyncCategory.RECOMMENDATION)
                .orElseThrow();

        assertThat(second.retryScheduled()).isFalse();
        assertThat(second.failedPermanently()).isTrue();
        assertThat(afterSecond.getAttempts()).isEqualTo(2);
        assertThat(afterSecond.getMaxAttempts()).isEqualTo(2);
        assertThat(afterSecond.getStatus()).isEqualTo(SyncTaskStatus.FAILED_PERMANENT);
                assertThat(afterSecond.getLastErrorCode()).isEqualTo("LOCAL_BUDGET_DEFERRED");
    }
}
