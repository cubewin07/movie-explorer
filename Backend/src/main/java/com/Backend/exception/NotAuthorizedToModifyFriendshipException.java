package com.Backend.exception;

public class NotAuthorizedToModifyFriendshipException extends RuntimeException {
    public NotAuthorizedToModifyFriendshipException(String message) {
        super(message);
    }
}


