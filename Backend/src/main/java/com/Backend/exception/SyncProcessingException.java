package com.Backend.exception;

public class SyncProcessingException extends RuntimeException {

    private final String errorCode;

    public SyncProcessingException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public SyncProcessingException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
