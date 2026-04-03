package com.Backend.services.sync_service.model;

public record SyncAttemptResult(
        boolean wasSynced,
        boolean syncSucceeded
) {
}
