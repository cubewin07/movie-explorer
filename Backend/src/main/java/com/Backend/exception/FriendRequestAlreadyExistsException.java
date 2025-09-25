package com.Backend.exception;

public class FriendRequestAlreadyExistsException extends RuntimeException {
    public FriendRequestAlreadyExistsException(String message) {
        super(message);
    }
}


