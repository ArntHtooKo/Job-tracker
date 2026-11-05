package com.jobtracker.backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleAllExceptions(Exception ex, WebRequest request) {
        System.out.println("!!! EXCEPTION CAUGHT !!!");
        System.out.println("URL: " + request.getDescription(false));
        System.out.println("Message: " + ex.getMessage());
        ex.printStackTrace();
        return ResponseEntity.status(500).body("Internal Error: " + ex.getMessage());
    }
}