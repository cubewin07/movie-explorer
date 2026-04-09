package com.Backend.services.sync_service.model;

import java.time.Duration;

public record SyncRetryDecision(
        boolean retryable,
        Duration delay,
        String errorCode,
        String errorMessage
) {
}
