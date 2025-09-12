package com.Backend.exception;

public record ErrorRes(
        int statusCode,
        String message,
        Long timestamp
)
{}
