package com.Backend.services.sync_service.model;

import java.time.Duration;

public class LocalBudgetDeferException extends RuntimeException {

    private final String errorCode;
    private final Duration retryDelay;

    public LocalBudgetDeferException(String errorCode, String message, Duration retryDelay) {
        super(message);
        this.errorCode = errorCode;
        this.retryDelay = retryDelay == null ? Duration.ofSeconds(5) : retryDelay;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public Duration getRetryDelay() {
        return retryDelay;
    }
}
