package com.gluconoche.auth;

public class BadPinException extends RuntimeException {

    private final int remainingAttempts;

    public BadPinException(int remainingAttempts) {
        super("Invalid PIN");
        this.remainingAttempts = remainingAttempts;
    }

    public int getRemainingAttempts() {
        return remainingAttempts;
    }
}
