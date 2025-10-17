package com.Backend.exception.Handler;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

import java.util.List;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.Backend.exception.AuthenticationFailedException;
import com.Backend.exception.ChatNotFoundException;
import com.Backend.exception.DuplicateWatchlistItemException;
import com.Backend.exception.ErrorRes;
import com.Backend.exception.FriendNotFoundException;
import com.Backend.exception.FriendRequestAlreadyExistsException;
import com.Backend.exception.FriendshipNotFoundException;
import com.Backend.exception.MessageNotFoundException;
import com.Backend.exception.NotAuthorizedToModifyFriendshipException;
import com.Backend.exception.UserNotFoundException;
import com.Backend.exception.WatchlistNotFoundException;
import com.Backend.exception.ChatValidationException;
import com.Backend.exception.MessageValidationException;
import com.Backend.exception.ErrorResObject;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ChatValidationException.class)
    public ResponseEntity<ErrorRes> handleChatValidationException(ChatValidationException ex) {
        ErrorRes errorRes = new ErrorRes(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage(),
                "Invalid chat request",
                Instant.now().toString());
        return new ResponseEntity<>(errorRes, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MessageValidationException.class)
    public ResponseEntity<ErrorRes> handleMessageValidationException(MessageValidationException ex) {
        ErrorRes errorRes = new ErrorRes(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage(),
                "Invalid message request",
                Instant.now().toString());
        return new ResponseEntity<>(errorRes, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorRes> handleUsernameNotFoundException(UsernameNotFoundException ex) {
        ErrorRes errorRes = new ErrorRes(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                "User not found",
                Instant.now().toString());
        return new ResponseEntity<>(errorRes, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({AuthenticationFailedException.class, BadCredentialsException.class})
    public ResponseEntity<ErrorRes> handleAuthenticationFailed(Exception ex) {
        ErrorRes errorRes = new ErrorRes(
                HttpStatus.UNAUTHORIZED.value(),
                ex.getMessage(),
                "Authentication failed",
                Instant.now().toString());
        return new ResponseEntity<>(errorRes, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler({
        UserNotFoundException.class, 
        WatchlistNotFoundException.class, 
        FriendshipNotFoundException.class,
        ChatNotFoundException.class,
        MessageNotFoundException.class
    })
    public ResponseEntity<ErrorRes> handleNotFound(RuntimeException ex) {
        String errorType = ex instanceof UserNotFoundException ? "User not found" :
                         ex instanceof WatchlistNotFoundException ? "Watchlist not found" :
                         ex instanceof ChatNotFoundException ? "Chat not found" :
                         ex instanceof MessageNotFoundException ? "Message not found" :
                         "Resource not found";
        ErrorRes errorRes = new ErrorRes(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                errorType,
                Instant.now().toString());
        return new ResponseEntity<>(errorRes, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicateWatchlistItemException.class)
    public ResponseEntity<ErrorRes> handleDuplicateWatchlist(DuplicateWatchlistItemException ex) {
        ErrorRes errorRes = new ErrorRes(
                HttpStatus.CONFLICT.value(),
                ex.getMessage(),
                "Duplicate watchlist item",
                Instant.now().toString());
        return new ResponseEntity<>(errorRes, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(FriendRequestAlreadyExistsException.class)
    public ResponseEntity<ErrorRes> handleFriendRequestAlreadyExists(FriendRequestAlreadyExistsException ex) {
        ErrorRes errorRes = new ErrorRes(
                HttpStatus.CONFLICT.value(),
                ex.getMessage(),
                "Friend request already exists",
                Instant.now().toString());
        return new ResponseEntity<>(errorRes, HttpStatus.CONFLICT);
    }

    @ExceptionHandler({FriendNotFoundException.class, NotAuthorizedToModifyFriendshipException.class})
    public ResponseEntity<ErrorRes> handleFriendErrors(RuntimeException ex) {
        HttpStatus status = ex instanceof FriendNotFoundException ? HttpStatus.NOT_FOUND : HttpStatus.FORBIDDEN;
        String errorType = ex instanceof FriendNotFoundException ? "Friend not found" : "Not authorized to modify friendship";
        ErrorRes errorRes = new ErrorRes(
                status.value(),
                ex.getMessage(),
                errorType,
                Instant.now().toString());
        return new ResponseEntity<>(errorRes, status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorRes> handleException(Exception ex) {
        ErrorRes errorRes = new ErrorRes(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                ex.getMessage(),
                "Internal server error",
                Instant.now().toString());
        return new ResponseEntity<>(errorRes, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResObject> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        List<Map<String, String>> fieldErrors = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(error -> Map.of(
                        error.getField(),
                        error.getDefaultMessage()
                ))
                .collect(Collectors.toList());
        
        ErrorResObject errorResponse = new ErrorResObject(
                HttpStatus.BAD_REQUEST.value(),
                "Validation Failed",
                fieldErrors,
                Instant.now().toString()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorRes> handleEntityNotFound(EntityNotFoundException ex) {
        ErrorRes errorRes = new ErrorRes(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                "Entity not found",
                Instant.now().toString());
        return new ResponseEntity<>(errorRes, HttpStatus.NOT_FOUND);
    }
}
