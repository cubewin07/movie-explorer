package com.Backend.exception;

public record ErrorResObject(
    int statusCode,
    String error,
    Object message,
    String timestamp
) 
{}
