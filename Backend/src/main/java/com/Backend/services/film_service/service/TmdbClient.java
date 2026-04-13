package com.Backend.services.film_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.TmdbCreditsResponse;
import com.Backend.services.film_service.model.TmdbFilmResponse;
import com.Backend.services.film_service.model.TmdbKeywordsResponse;
import com.Backend.services.film_service.model.TmdbMovieSimilarResponse;
import com.Backend.services.film_service.model.TmdbSimilarItem;
import com.Backend.services.film_service.model.TmdbTvSimilarResponse;
import com.Backend.services.sync_service.model.SyncRetryDecision;
import com.Backend.services.sync_service.service.SyncRetryPolicy;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Service
public class TmdbClient {

    private final WebClient webClient;
    private final SyncRetryPolicy syncRetryPolicy;
    private final String apiToken;
    private final int retryAttempts;
    private final long retryBackoffMs;
    private final long rateLimitCapacity;
    private final long rateLimitRefillTokens;
    private final long rateLimitRefillPeriodNanos;
    private final Object rateLimitMonitor = new Object();
    private double availableTokens;
    private long lastRefillNanos;

    public TmdbClient(
            WebClient.Builder builder,
            SyncRetryPolicy syncRetryPolicy,
            @Value("${tmdb.api.base-url}") String baseUrl,
            @Value("${tmdb.api.api-token:}") String apiToken,
            @Value("${tmdb.api.retry.attempts:3}") int retryAttempts,
            @Value("${tmdb.api.retry.backoff-ms:200}") long retryBackoffMs,
            @Value("${tmdb.api.rate-limit.capacity:40}") long rateLimitCapacity,
            @Value("${tmdb.api.rate-limit.refill-tokens:40}") long rateLimitRefillTokens,
            @Value("${tmdb.api.rate-limit.refill-period-seconds:10}") long rateLimitRefillPeriodSeconds) {
        this.syncRetryPolicy = syncRetryPolicy;
        this.apiToken = apiToken;
        this.retryAttempts = Math.max(1, retryAttempts);
        this.retryBackoffMs = Math.max(0L, retryBackoffMs);

        this.rateLimitCapacity = Math.max(1L, rateLimitCapacity);
        this.rateLimitRefillTokens = Math.max(1L, rateLimitRefillTokens);
        long safeRefillSeconds = Math.max(1L, rateLimitRefillPeriodSeconds);
        this.rateLimitRefillPeriodNanos = safeRefillSeconds * 1_000_000_000L;
        this.availableTokens = this.rateLimitCapacity;
        this.lastRefillNanos = System.nanoTime();

        WebClient.Builder webClientBuilder = builder.baseUrl(Objects.requireNonNull(baseUrl, "tmdb.api.base-url"));
        if (StringUtils.hasText(this.apiToken)) {
            webClientBuilder.defaultHeader("Authorization", "Bearer " + this.apiToken);
        }
        this.webClient = webClientBuilder.build();
    }

    public TmdbFilmResponse fetchFilmDetails(Long tmdbId, FilmType type) {
        if (!StringUtils.hasText(apiToken)) {
            throw new IllegalStateException("TMDB API token is missing");
        }
        String path = type == FilmType.MOVIE ? "/movie/{id}" : "/tv/{id}";
        return executeWithRetry(() -> webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path(path);
                    return uriBuilder.build(tmdbId);
                })
                .retrieve()
                .bodyToMono(TmdbFilmResponse.class)
                .block(), "film-details");
    }

    @Cacheable(value = "tmdbCredits", key = "{#tmdbId, #type.name()}")
    public TmdbCreditsResponse fetchCredits(Long tmdbId, FilmType type) {
        if (!StringUtils.hasText(apiToken)) {
            throw new IllegalStateException("TMDB API token is missing");
        }
        String path = type == FilmType.MOVIE ? "/movie/{id}/credits" : "/tv/{id}/credits";
        return executeWithRetry(() -> webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path(path);
                    return uriBuilder.build(tmdbId);
                })
                .retrieve()
                .bodyToMono(TmdbCreditsResponse.class)
                .block(), "credits");
    }

    @Cacheable(value = "tmdbKeywords", key = "{#tmdbId, #type.name()}")
    public TmdbKeywordsResponse fetchKeywords(Long tmdbId, FilmType type) {
        if (!StringUtils.hasText(apiToken)) {
            throw new IllegalStateException("TMDB API token is missing");
        }
        String path = type == FilmType.MOVIE ? "/movie/{id}/keywords" : "/tv/{id}/keywords";
        return executeWithRetry(() -> webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path(path);
                    return uriBuilder.build(tmdbId);
                })
                .retrieve()
                .bodyToMono(TmdbKeywordsResponse.class)
                .block(), "keywords");
    }

    @Cacheable(value = "tmdbGenres", key = "{#tmdbId, #type.name()}")
    public TmdbFilmResponse fetchGenres(Long tmdbId, FilmType type) {
        if (!StringUtils.hasText(apiToken)) {
            throw new IllegalStateException("TMDB API token is missing");
        }
        String path = type == FilmType.MOVIE ? "/movie/{id}" : "/tv/{id}";
        return executeWithRetry(() -> webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path(path);
                    return uriBuilder.build(tmdbId);
                })
                .retrieve()
                .bodyToMono(TmdbFilmResponse.class)
                .block(), "genres");
    }

    @Cacheable(value = "tmdbSimilar", key = "{#tmdbId, #type.name()}")
    public java.util.List<TmdbSimilarItem> fetchSimilar(Long tmdbId, FilmType type) {
        if (!StringUtils.hasText(apiToken)) {
            throw new IllegalStateException("TMDB API token is missing");
        }

        if (type == FilmType.MOVIE) {
            TmdbMovieSimilarResponse response = executeWithRetry(() -> webClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder.path("/movie/{id}/similar");
                        return uriBuilder.build(tmdbId);
                    })
                    .retrieve()
                    .bodyToMono(TmdbMovieSimilarResponse.class)
                    .block(), "similar-movie");

            if (response == null || response.getResults() == null) {
                return java.util.List.of();
            }
            return response.getResults().stream()
                    .filter(item -> item != null && item.getId() != null)
                    .map(item -> new TmdbSimilarItem(
                            item.getId(),
                            item.getTitle(),
                            item.getReleaseDate(),
                            item.getBackdropPath()
                    ))
                    .collect(Collectors.toList());
        }

        TmdbTvSimilarResponse response = executeWithRetry(() -> webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/tv/{id}/similar");
                    return uriBuilder.build(tmdbId);
                })
                .retrieve()
                .bodyToMono(TmdbTvSimilarResponse.class)
                .block(), "similar-tv");

        if (response == null || response.getResults() == null) {
            return java.util.List.of();
        }
        return response.getResults().stream()
                .filter(item -> item != null && item.getId() != null)
                .map(item -> new TmdbSimilarItem(
                        item.getId(),
                        item.getName(),
                        item.getFirstAirDate(),
                        item.getBackdropPath()
                ))
                .collect(Collectors.toList());
    }

    public double getAvailableTokens() {
        synchronized (rateLimitMonitor) {
            refillTokensLocked();
            return availableTokens;
        }
    }

    private <T> T executeWithRetry(Supplier<T> call, String operation) {
        RuntimeException lastError = null;
        for (int attempt = 1; attempt <= retryAttempts; attempt++) {
            try {
                consumeRateLimitToken();
                return call.get();
            } catch (RuntimeException ex) {
                lastError = ex;
                if (attempt >= retryAttempts) {
                    break;
                }

                SyncRetryDecision decision = syncRetryPolicy.decide(ex, attempt + 1);
                if (!decision.retryable()) {
                    log.warn("TMDB {} attempt {}/{} failed and is non-retryable (code={}): {}",
                            operation,
                            attempt,
                            retryAttempts,
                            decision.errorCode(),
                            decision.errorMessage());
                    break;
                }

                long backoff = retryBackoffMs * (1L << Math.max(0, attempt - 1));
                if (backoff > 0L) {
                    try {
                        Thread.sleep(backoff);
                    } catch (InterruptedException interrupted) {
                        Thread.currentThread().interrupt();
                        throw new IllegalStateException("TMDB retry interrupted", interrupted);
                    }
                }
                log.warn("TMDB {} attempt {}/{} failed with code={}, retrying", operation, attempt, retryAttempts, decision.errorCode());
            }
        }
        if (lastError == null) {
            throw new IllegalStateException("TMDB " + operation + " failed without an exception");
        }
        throw lastError;
    }

    private void consumeRateLimitToken() {
        while (true) {
            long waitMillis;
            synchronized (rateLimitMonitor) {
                refillTokensLocked();
                if (availableTokens >= 1.0d) {
                    availableTokens -= 1.0d;
                    return;
                }

                double missingTokens = 1.0d - availableTokens;
                double nanosPerToken = (double) rateLimitRefillPeriodNanos / (double) rateLimitRefillTokens;
                waitMillis = Math.max(1L, (long) Math.ceil((missingTokens * nanosPerToken) / 1_000_000.0d));
            }

            try {
                Thread.sleep(Math.min(250L, waitMillis));
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("TMDB rate limiter wait interrupted", interrupted);
            }
        }
    }

    private void refillTokensLocked() {
        long nowNanos = System.nanoTime();
        long elapsedNanos = nowNanos - lastRefillNanos;
        if (elapsedNanos <= 0L) {
            return;
        }

        double replenished = ((double) elapsedNanos * (double) rateLimitRefillTokens)
                / (double) rateLimitRefillPeriodNanos;
        if (replenished <= 0.0d) {
            return;
        }

        availableTokens = Math.min((double) rateLimitCapacity, availableTokens + replenished);
        lastRefillNanos = nowNanos;
    }
}
