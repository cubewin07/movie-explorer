package com.Backend.exception.Handler;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.support.MethodArgumentNotValidException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.Backend.exception.AuthenticationFailedException;
import com.Backend.exception.DuplicateWatchlistItemException;
import com.Backend.exception.ErrorRes;
import com.Backend.exception.FriendNotFoundException;
import com.Backend.exception.FriendRequestAlreadyExistsException;
import com.Backend.exception.FriendshipNotFoundException;
import com.Backend.exception.NotAuthorizedToModifyFriendshipException;
import com.Backend.exception.UserNotFoundException;
import com.Backend.exception.WatchlistNotFoundException;
import com.Backend.exception.ErrorResObject;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorRes> handleUsernameNotFoundException(UsernameNotFoundException ex) {
        ErrorRes errorRes = new ErrorRes(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                System.currentTimeMillis());
        return new ResponseEntity<>(errorRes, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({AuthenticationFailedException.class, BadCredentialsException.class})
    public ResponseEntity<ErrorRes> handleAuthenticationFailed(Exception ex) {
        ErrorRes errorRes = new ErrorRes(
                HttpStatus.UNAUTHORIZED.value(),
                ex.getMessage(),
                System.currentTimeMillis());
        return new ResponseEntity<>(errorRes, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler({UserNotFoundException.class, WatchlistNotFoundException.class, FriendshipNotFoundException.class})
    public ResponseEntity<ErrorRes> handleNotFound(RuntimeException ex) {
        ErrorRes errorRes = new ErrorRes(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                System.currentTimeMillis());
        return new ResponseEntity<>(errorRes, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicateWatchlistItemException.class)
    public ResponseEntity<ErrorRes> handleDuplicateWatchlist(DuplicateWatchlistItemException ex) {
        ErrorRes errorRes = new ErrorRes(
                HttpStatus.CONFLICT.value(),
                ex.getMessage(),
                System.currentTimeMillis());
        return new ResponseEntity<>(errorRes, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(FriendRequestAlreadyExistsException.class)
    public ResponseEntity<ErrorRes> handleFriendRequestAlreadyExists(FriendRequestAlreadyExistsException ex) {
        ErrorRes errorRes = new ErrorRes(
                HttpStatus.CONFLICT.value(),
                ex.getMessage(),
                System.currentTimeMillis());
        return new ResponseEntity<>(errorRes, HttpStatus.CONFLICT);
    }

    @ExceptionHandler({FriendNotFoundException.class, NotAuthorizedToModifyFriendshipException.class})
    public ResponseEntity<ErrorRes> handleFriendErrors(RuntimeException ex) {
        HttpStatus status = ex instanceof FriendNotFoundException ? HttpStatus.NOT_FOUND : HttpStatus.FORBIDDEN;
        ErrorRes errorRes = new ErrorRes(
                status.value(),
                ex.getMessage(),
                System.currentTimeMillis());
        return new ResponseEntity<>(errorRes, status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorRes> handleException(Exception ex) {
        ErrorRes errorRes = new ErrorRes(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                ex.getMessage(),
                System.currentTimeMillis());
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
}
