package com.Backend.services.watchlist_service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.model.TmdbFilmResponse;
import com.Backend.services.film_service.repository.FilmRepository;
import com.Backend.services.film_service.service.TmdbClient;
import com.Backend.services.sync_service.model.SyncAttemptResult;
import com.Backend.services.sync_service.model.SyncCategory;
import com.Backend.services.sync_service.repository.SyncTaskRepository;
import com.Backend.services.sync_service.service.FilmSyncTaskService;
import com.Backend.services.user_service.model.ROLE;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.repository.UserRepository;
import com.Backend.services.watchlist_service.model.Watchlist;
import com.Backend.services.watchlist_service.model.WatchlistPosting;
import com.Backend.services.watchlist_service.repository.WatchlistItemRepository;
import com.Backend.services.watchlist_service.repository.WatchlistRepository;
import com.Backend.services.watchlist_service.service.WatchlistService;
import com.Backend.test.DotenvTestInitializer;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;

@SpringBootTest(properties = {
        "spring.task.scheduling.enabled=false",
        "watchlist.sync.executor.core-pool-size=1",
        "watchlist.sync.executor.max-pool-size=1",
        "watchlist.sync.executor.queue-capacity=32"
})
@ActiveProfiles("test")
@EnableCaching
@ContextConfiguration(initializers = DotenvTestInitializer.class)
class WatchlistAsyncSyncIntegrationTest {

    @Autowired
    private WatchlistService watchlistService;

    @Autowired
    private WatchlistItemRepository watchlistItemRepository;

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private FilmRepository filmRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SyncTaskRepository syncTaskRepository;

    @SpyBean
    private FilmSyncTaskService filmSyncTaskService;

    @MockBean
    private TmdbClient tmdbClient;

    @AfterEach
    void cleanup() {
        reset(filmSyncTaskService, tmdbClient);
        syncTaskRepository.deleteAll();
        watchlistItemRepository.deleteAll();
        watchlistRepository.deleteAll();
        filmRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void addToWatchlistReturnsWithoutBlockingBackgroundSync() {
        User user = createUserWithWatchlist();
        WatchlistPosting posting = new WatchlistPosting(FilmType.MOVIE, 771_009L);

        TmdbFilmResponse details = new TmdbFilmResponse();
        details.setId(posting.id());
        details.setTitle("Async Candidate");
        details.setVoteAverage(7.4d);
        details.setReleaseDate("2025-02-11");
        details.setBackdropPath("/async.jpg");
        details.setOriginalLanguage("en");
        when(tmdbClient.fetchFilmDetails(posting.id(), posting.type())).thenReturn(details);

        CountDownLatch firstSyncInvocation = new CountDownLatch(1);
        CountDownLatch unblockSync = new CountDownLatch(1);
        AtomicInteger syncInvocations = new AtomicInteger(0);

        doAnswer(invocation -> {
            syncInvocations.incrementAndGet();
            firstSyncInvocation.countDown();
            unblockSync.await(5, TimeUnit.SECONDS);
            return SyncAttemptResult.alreadySynced();
        }).when(filmSyncTaskService).syncNowOrQueue(any(Film.class), anyLong(), any(SyncCategory.class));

        CompletableFuture<Void> addFuture = CompletableFuture.runAsync(() -> watchlistService.addToWatchlist(posting, user));

        await()
                .atMost(Duration.ofSeconds(3))
                .until(() -> firstSyncInvocation.getCount() == 0L);

        await()
                .atMost(Duration.ofSeconds(3))
                .until(addFuture::isDone);

        assertThat(watchlistItemRepository.countByWatchlist_UserId(user.getId())).isEqualTo(1L);

        unblockSync.countDown();

        await()
                .atMost(Duration.ofSeconds(5))
                .until(() -> syncInvocations.get() == 4);

        verify(filmSyncTaskService, times(4)).syncNowOrQueue(any(Film.class), eq(posting.id()), any(SyncCategory.class));

        var categoryCaptor = org.mockito.ArgumentCaptor.forClass(SyncCategory.class);
        verify(filmSyncTaskService, times(4)).syncNowOrQueue(any(Film.class), eq(posting.id()), categoryCaptor.capture());
        assertThat(categoryCaptor.getAllValues()).containsExactlyInAnyOrder(
                SyncCategory.CREDITS,
                SyncCategory.KEYWORD,
                SyncCategory.GENRE,
                SyncCategory.RECOMMENDATION
        );
    }

    private User createUserWithWatchlist() {
        String suffix = String.valueOf(System.nanoTime());
        User user = User.builder()
                .username("watchlist-" + suffix)
                .email("watchlist-" + suffix + "@example.com")
                .password("password123")
                .role(ROLE.ROLE_USER)
                .build();

        Watchlist watchlist = new Watchlist();
        user.setWatchlist(watchlist);

        return userRepository.saveAndFlush(user);
    }
}
