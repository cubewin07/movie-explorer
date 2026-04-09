package com.Backend.services.sync_service.service;

import com.Backend.services.sync_service.model.SyncRetryDecision;
import java.time.Duration;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
public class SyncRetryPolicy {

    public SyncRetryDecision decide(Throwable error, int nextAttempt) {
        Throwable root = rootCause(error);
        String message = buildMessage(root);

        if (root instanceof WebClientResponseException responseEx) {
            HttpStatus status = HttpStatus.resolve(responseEx.getStatusCode().value());
            if (status == HttpStatus.TOO_MANY_REQUESTS) {
                Duration fromHeader = retryAfterDuration(responseEx.getHeaders().getFirst("Retry-After"));
                Duration delay = fromHeader != null
                        ? fromHeader
                        : cappedBackoff(Duration.ofMinutes(1), nextAttempt, Duration.ofMinutes(15));
                return new SyncRetryDecision(true, addJitter(delay), "TMDB_429", message);
            }
            if (status != null && status.is5xxServerError()) {
                Duration delay = cappedBackoff(Duration.ofSeconds(30), nextAttempt, Duration.ofMinutes(15));
                return new SyncRetryDecision(true, addJitter(delay), "TMDB_5XX", message);
            }
            if (status == HttpStatus.UNAUTHORIZED || status == HttpStatus.FORBIDDEN) {
                return new SyncRetryDecision(false, Duration.ZERO, "TMDB_AUTH", message);
            }
            if (status == HttpStatus.NOT_FOUND) {
                return new SyncRetryDecision(false, Duration.ZERO, "TMDB_NOT_FOUND", message);
            }
            return new SyncRetryDecision(false, Duration.ZERO,
                    "TMDB_CLIENT_" + responseEx.getStatusCode().value(), message);
        }

        if (root instanceof WebClientRequestException) {
            Duration delay = cappedBackoff(Duration.ofSeconds(30), nextAttempt, Duration.ofMinutes(10));
            return new SyncRetryDecision(true, addJitter(delay), "TMDB_NETWORK", message);
        }

        if (isTransientDatabaseError(root)) {
            Duration delay = cappedBackoff(Duration.ofSeconds(5), nextAttempt, Duration.ofMinutes(5));
            return new SyncRetryDecision(true, addJitter(delay), "DB_TRANSIENT", message);
        }

        return new SyncRetryDecision(false, Duration.ZERO, "UNKNOWN", message);
    }

    private Duration retryAfterDuration(String retryAfter) {
        if (retryAfter == null || retryAfter.isBlank()) {
            return null;
        }
        try {
            long seconds = Long.parseLong(retryAfter.trim());
            if (seconds <= 0) {
                return Duration.ofSeconds(60);
            }
            return Duration.ofSeconds(seconds);
        } catch (NumberFormatException ex) {
            return Duration.ofSeconds(60);
        }
    }

    private Duration cappedBackoff(Duration base, int attempt, Duration max) {
        int exponent = Math.max(0, attempt - 1);
        long multiplier = 1L << Math.min(exponent, 20);
        Duration next = base.multipliedBy(multiplier);
        return next.compareTo(max) > 0 ? max : next;
    }

    private Duration addJitter(Duration base) {
        long millis = Math.max(1000L, base.toMillis());
        long jitter = ThreadLocalRandom.current().nextLong(0L, Math.max(1L, millis / 5L));
        return Duration.ofMillis(millis + jitter);
    }

    private Throwable rootCause(Throwable error) {
        Throwable current = error;
        while (current != null && current.getCause() != null && current.getCause() != current) {
            current = current.getCause();
        }
        return current == null ? error : current;
    }

    private boolean isTransientDatabaseError(Throwable error) {
        if (error == null) {
            return false;
        }
        String className = error.getClass().getName();
        return className.contains("Transient")
                || className.contains("LockTimeout")
                || className.contains("Deadlock")
                || className.contains("CannotAcquireLock");
    }

    private String buildMessage(Throwable error) {
        if (error == null) {
            return null;
        }
        String text = error.getMessage();
        if (text == null) {
            text = error.getClass().getSimpleName();
        }
        if (text.length() <= 1000) {
            return text;
        }
        return text.substring(0, 1000);
    }
}
