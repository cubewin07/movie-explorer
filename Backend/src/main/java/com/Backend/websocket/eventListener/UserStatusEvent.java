package com.Backend.websocket.eventListener;

public record UserStatusEvent(
        String email,
        Boolean isOnline
)
{}
