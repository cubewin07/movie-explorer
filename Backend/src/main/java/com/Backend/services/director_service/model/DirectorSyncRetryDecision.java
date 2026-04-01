package com.Backend.services.director_service.model;

import java.time.Duration;

public record DirectorSyncRetryDecision(
        boolean retryable,
        Duration delay,
        String errorCode,
        String errorMessage
) {
}
