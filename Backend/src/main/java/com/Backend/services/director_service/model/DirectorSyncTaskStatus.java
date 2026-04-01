package com.Backend.services.director_service.model;

public enum DirectorSyncTaskStatus {
    PENDING,
    RETRYING,
    SUCCEEDED,
    FAILED_PERMANENT
}
