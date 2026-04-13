package com.Backend.exception;

public class TmdbClientException extends RuntimeException {

    private final String errorCode;

    public TmdbClientException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public TmdbClientException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
