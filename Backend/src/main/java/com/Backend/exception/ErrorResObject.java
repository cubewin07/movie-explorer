package com.Backend.exception;

public record ErrorResObject(
    int statusCode,
    Object message,
    Long timestamp
) 
{}
