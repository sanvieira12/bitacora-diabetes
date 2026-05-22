package com.gluconoche.common;

import com.gluconoche.auth.AccountLockedException;
import com.gluconoche.auth.BadPinException;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AccountLockedException.class)
    public ResponseEntity<Map<String, Object>> handleLocked(AccountLockedException ex) {
        long retryAfterSeconds = java.time.Duration.between(
                java.time.OffsetDateTime.now(), ex.getLockedUntil()).toSeconds();
        return ResponseEntity.status(423)
                .header("Retry-After", String.valueOf(Math.max(retryAfterSeconds, 0)))
                .body(Map.of("error", "locked", "lockedUntil", ex.getLockedUntil().toString()));
    }

    @ExceptionHandler(BadPinException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadPin(BadPinException ex) {
        String msg = ex.getRemainingAttempts() >= 0
                ? "PIN incorrecto. Te quedan " + ex.getRemainingAttempts() + " intento(s)."
                : "PIN actual incorrecto.";
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error(msg));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(EntityNotFoundException ex) {
        log.warn("Entity not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        List<String> details = ex.getBindingResult().getAllErrors().stream()
                .map(error -> {
                    if (error instanceof FieldError fe) {
                        return fe.getField() + ": " + fe.getDefaultMessage();
                    }
                    return error.getDefaultMessage();
                })
                .toList();

        log.warn("Validation error: {}", details);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Error de validación", details));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = "Parámetro inválido: " + ex.getName();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(message));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneral(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error interno del servidor"));
    }
}
