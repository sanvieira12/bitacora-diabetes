package com.gluconoche.auth;

import java.time.OffsetDateTime;

public class AccountLockedException extends RuntimeException {

    private final OffsetDateTime lockedUntil;

    public AccountLockedException(OffsetDateTime lockedUntil) {
        super("Account locked until " + lockedUntil);
        this.lockedUntil = lockedUntil;
    }

    public OffsetDateTime getLockedUntil() {
        return lockedUntil;
    }
}
