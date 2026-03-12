package com.Backend.services.film_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.TmdbFilmResponse;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class TmdbClient {

    private final WebClient webClient;
    private final String apiKey;
    private final boolean useAuthToken;

    public TmdbClient(
            WebClient.Builder builder,
            @Value("${tmdb.api.base-url}") String baseUrl,
            @Value("${tmdb.api.api-key:}") String apiKey,
            @Value("${tmdb.api.auth-token:}") String authToken) {
        this.apiKey = apiKey;
        this.useAuthToken = StringUtils.hasText(authToken);
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
        return webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path(path);
                    if (!useAuthToken && StringUtils.hasText(apiKey)) {
                        uriBuilder.queryParam("api_key", apiKey);
                    }
                    return uriBuilder.build(tmdbId);
                })
                .retrieve()
                .bodyToMono(TmdbFilmResponse.class)
                .block();
    }
}
