package com.Backend.services.sync_service.model;

public record SyncAttemptResult(
        boolean wasSynced,
        boolean syncSucceeded,
        boolean retryScheduled,
        boolean failedPermanently,
        String errorCode,
        String errorMessage
) {

    public static SyncAttemptResult invalidInput(String message) {
        return new SyncAttemptResult(false, false, false, true, "INVALID_INPUT", message);
    }

    public static SyncAttemptResult unsupportedCategory(String message) {
        return new SyncAttemptResult(false, false, false, true, "SYNC_CATEGORY_UNSUPPORTED", message);
    }

    public static SyncAttemptResult alreadySynced() {
        return new SyncAttemptResult(true, true, false, false, null, null);
    }

    public static SyncAttemptResult synced(boolean wasSynced) {
        return new SyncAttemptResult(wasSynced, true, false, false, null, null);
    }

    public static SyncAttemptResult retryScheduled(boolean wasSynced, String errorCode, String errorMessage) {
        return new SyncAttemptResult(wasSynced, false, true, false, errorCode, errorMessage);
    }

    public static SyncAttemptResult failedPermanently(boolean wasSynced, String errorCode, String errorMessage) {
        return new SyncAttemptResult(wasSynced, false, false, true, errorCode, errorMessage);
    }

    public static SyncAttemptResult failedWithoutRetry(boolean wasSynced, String errorCode, String errorMessage) {
        return new SyncAttemptResult(wasSynced, false, false, false, errorCode, errorMessage);
    }
}
