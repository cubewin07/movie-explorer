package com.Backend.exception;

public class ChatValidationException extends RuntimeException {
    public ChatValidationException(String message) {
        super(message);
    }

    public ChatValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
