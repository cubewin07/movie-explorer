package com.Backend.services.sync_service.model;

public enum SyncTaskStatus {
    PENDING,
    RETRYING,
    SUCCEEDED,
    FAILED_PERMANENT
}
