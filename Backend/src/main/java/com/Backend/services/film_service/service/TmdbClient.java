package com.Backend.services.film_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.TmdbCreditsResponse;
import com.Backend.services.film_service.model.TmdbFilmResponse;
import com.Backend.services.film_service.model.TmdbKeywordsResponse;
import java.util.Objects;
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
    private final String apiKey;
    private final boolean useAuthToken;
    private final int retryAttempts;
    private final long retryBackoffMs;

    public TmdbClient(
            WebClient.Builder builder,
            @Value("${tmdb.api.base-url}") String baseUrl,
            @Value("${tmdb.api.api-key:}") String apiKey,
            @Value("${tmdb.api.auth-token:}") String authToken,
            @Value("${tmdb.api.retry.attempts:3}") int retryAttempts,
            @Value("${tmdb.api.retry.backoff-ms:200}") long retryBackoffMs) {
        this.apiKey = apiKey;
        this.useAuthToken = StringUtils.hasText(authToken);
        this.retryAttempts = Math.max(1, retryAttempts);
        this.retryBackoffMs = Math.max(0L, retryBackoffMs);
        WebClient.Builder webClientBuilder = builder.baseUrl(Objects.requireNonNull(baseUrl, "tmdb.api.base-url"));
        if (this.useAuthToken) {
            webClientBuilder.defaultHeader("Authorization", "Bearer " + authToken);
        }
        this.webClient = webClientBuilder.build();
    }

    public TmdbFilmResponse fetchFilmDetails(Long tmdbId, FilmType type) {
        if (!useAuthToken && !StringUtils.hasText(apiKey)) {
            throw new IllegalStateException("TMDB API key or auth token is missing");
        }
        String path = type == FilmType.MOVIE ? "/movie/{id}" : "/tv/{id}";
        return executeWithRetry(() -> webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path(path);
                    if (!useAuthToken && StringUtils.hasText(apiKey)) {
                        uriBuilder.queryParam("api_key", apiKey);
                    }
                    return uriBuilder.build(tmdbId);
                })
                .retrieve()
                .bodyToMono(TmdbFilmResponse.class)
                .block(), "film-details");
    }

    @Cacheable(value = "tmdbCredits", key = "{#tmdbId, #type.name()}")
    public TmdbCreditsResponse fetchCredits(Long tmdbId, FilmType type) {
        if (!useAuthToken && !StringUtils.hasText(apiKey)) {
            throw new IllegalStateException("TMDB API key or auth token is missing");
        }
        String path = type == FilmType.MOVIE ? "/movie/{id}/credits" : "/tv/{id}/credits";
        return executeWithRetry(() -> webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path(path);
                    if (!useAuthToken && StringUtils.hasText(apiKey)) {
                        uriBuilder.queryParam("api_key", apiKey);
                    }
                    return uriBuilder.build(tmdbId);
                })
                .retrieve()
                .bodyToMono(TmdbCreditsResponse.class)
                .block(), "credits");
    }

    @Cacheable(value = "tmdbKeywords", key = "{#tmdbId, #type.name()}")
    public TmdbKeywordsResponse fetchKeywords(Long tmdbId, FilmType type) {
        if (!useAuthToken && !StringUtils.hasText(apiKey)) {
            throw new IllegalStateException("TMDB API key or auth token is missing");
        }
        String path = type == FilmType.MOVIE ? "/movie/{id}/keywords" : "/tv/{id}/keywords";
        return executeWithRetry(() -> webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path(path);
                    if (!useAuthToken && StringUtils.hasText(apiKey)) {
                        uriBuilder.queryParam("api_key", apiKey);
                    }
                    return uriBuilder.build(tmdbId);
                })
                .retrieve()
                .bodyToMono(TmdbKeywordsResponse.class)
                .block(), "keywords");
    }

    @Cacheable(value = "tmdbGenres", key = "{#tmdbId, #type.name()}")
    public TmdbFilmResponse fetchGenres(Long tmdbId, FilmType type) {
        if (!useAuthToken && !StringUtils.hasText(apiKey)) {
            throw new IllegalStateException("TMDB API key or auth token is missing");
        }
        String path = type == FilmType.MOVIE ? "/movie/{id}" : "/tv/{id}";
        return executeWithRetry(() -> webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path(path);
                    if (!useAuthToken && StringUtils.hasText(apiKey)) {
                        uriBuilder.queryParam("api_key", apiKey);
                    }
                    return uriBuilder.build(tmdbId);
                })
                .retrieve()
                .bodyToMono(TmdbFilmResponse.class)
                .block(), "genres");
    }

    private <T> T executeWithRetry(Supplier<T> call, String operation) {
        RuntimeException lastError = null;
        for (int attempt = 1; attempt <= retryAttempts; attempt++) {
            try {
                return call.get();
            } catch (RuntimeException ex) {
                lastError = ex;
                if (attempt >= retryAttempts) {
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
                log.warn("TMDB {} attempt {}/{} failed, retrying", operation, attempt, retryAttempts);
            }
        }
        if (lastError == null) {
            throw new IllegalStateException("TMDB " + operation + " failed without an exception");
        }
        throw lastError;
    }
}
