package com.Backend.exception;

public class DuplicateWatchlistItemException extends RuntimeException {
    public DuplicateWatchlistItemException(String message) {
        super(message);
    }
}
