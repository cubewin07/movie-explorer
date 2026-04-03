package com.Backend.services.keyword_service.model;

import java.time.Duration;

public record KeywordSyncRetryDecision(
        boolean retryable,
        Duration delay,
        String errorCode,
        String errorMessage
) {
}
