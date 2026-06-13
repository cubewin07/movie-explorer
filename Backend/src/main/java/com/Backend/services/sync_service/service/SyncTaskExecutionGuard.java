package com.Backend.services.sync_service.service;

import com.Backend.services.film_service.model.Film;
import java.time.Instant;

public record SyncTaskExecutionGuard(
        boolean canRun,
        Film film,
        String errorCode,
        String errorMessage,
        Instant nextRetryAt
) {

    public static SyncTaskExecutionGuard proceed(Film film) {
        return new SyncTaskExecutionGuard(true, film, null, null, null);
    }

    public static SyncTaskExecutionGuard defer(String errorCode, String errorMessage, Instant nextRetryAt) {
        return new SyncTaskExecutionGuard(false, null, errorCode, errorMessage, nextRetryAt);
    }
}