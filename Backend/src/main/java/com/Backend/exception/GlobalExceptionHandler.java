package com.Backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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
}
