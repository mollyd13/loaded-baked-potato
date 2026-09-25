package com.matador.app.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;


@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse.builder(ex, HttpStatus.BAD_REQUEST, "Validation failed: " + errors)
                .property("timestamp", LocalDateTime.now())
                .property("path", request.getRequestURI())
                .build());
    }

    @ExceptionHandler(NoSuchElementException.class)
    ResponseEntity<ErrorResponse> handleNotFound(NoSuchElementException ex, HttpServletRequest request) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse.builder(ex, HttpStatus.NOT_FOUND, "Resource not found")
                .property("timestamp", LocalDateTime.now())
                .property("path", request.getRequestURI())
                .build());
    }

    @ExceptionHandler(OrderRejectedException.class)
    ResponseEntity<ErrorResponse> handleRejected(OrderRejectedException ex, HttpServletRequest request) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse.builder(ex, HttpStatus.BAD_REQUEST, ex.getMessage())
                .property("timestamp", LocalDateTime.now())
                .property("path", request.getRequestURI())
                .build());
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorResponse> handleUnexpected(Exception ex, HttpServletRequest request) {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse.builder(ex, HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred")
                .property("timestamp", LocalDateTime.now())
                .property("path", request.getRequestURI())
                .build());
    }
}
