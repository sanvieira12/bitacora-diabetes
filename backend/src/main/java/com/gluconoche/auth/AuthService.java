package com.gluconoche.auth;

import com.gluconoche.auth.dto.AuthStatusResponse;
import com.gluconoche.auth.dto.LoginResponse;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthCredentialRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;

    @PostConstruct
    public void initPinIfNeeded() {
        AuthCredential cred = getCredential();
        if ("MUST_INITIALIZE".equals(cred.getPinHash())) {
            cred.setPinHash(passwordEncoder.encode("0000"));
            repo.save(cred);
            log.warn("Auth: default PIN (0000) initialized. Change it on first login.");
        }
    }

    @Transactional
    public LoginResponse verifyPin(String rawPin) {
        AuthCredential cred = getCredential();

        if (isLockedNow(cred)) {
            throw new AccountLockedException(cred.getLockedUntil());
        }

        if (isLockoutExpired(cred)) {
            cred.setLockedUntil(null);
            cred.setFailedAttempts(0);
        }

        if (!passwordEncoder.matches(rawPin, cred.getPinHash())) {
            int attempts = cred.getFailedAttempts() + 1;
            cred.setFailedAttempts(attempts);
            if (attempts >= MAX_ATTEMPTS) {
                cred.setLockedUntil(OffsetDateTime.now().plusMinutes(LOCKOUT_MINUTES));
                repo.save(cred);
                throw new AccountLockedException(cred.getLockedUntil());
            }
            repo.save(cred);
            throw new BadPinException(MAX_ATTEMPTS - attempts);
        }

        cred.setFailedAttempts(0);
        cred.setLockedUntil(null);
        repo.save(cred);

        return new LoginResponse(jwtUtil.generateToken(), cred.isMustChangePin());
    }

    @Transactional
    public void changePin(String currentPin, String newPin) {
        if (newPin == null || !newPin.matches("\\d{4}")) {
            throw new IllegalArgumentException("El nuevo PIN debe tener exactamente 4 dígitos numéricos.");
        }

        AuthCredential cred = getCredential();

        if (!passwordEncoder.matches(currentPin, cred.getPinHash())) {
            throw new BadPinException(-1);
        }

        cred.setPinHash(passwordEncoder.encode(newPin));
        cred.setMustChangePin(false);
        cred.setFailedAttempts(0);
        cred.setLockedUntil(null);
        repo.save(cred);
    }

    @Transactional(readOnly = true)
    public AuthStatusResponse getStatus() {
        AuthCredential cred = getCredential();
        boolean locked = isLockedNow(cred);
        return new AuthStatusResponse(
                cred.isMustChangePin(),
                locked,
                locked ? cred.getLockedUntil() : null
        );
    }

    private AuthCredential getCredential() {
        List<AuthCredential> all = repo.findAll();
        if (all.isEmpty()) {
            throw new IllegalStateException("No auth_credential found. Run Flyway migrations (V3).");
        }
        return all.get(0);
    }

    private boolean isLockedNow(AuthCredential cred) {
        return cred.getLockedUntil() != null && OffsetDateTime.now().isBefore(cred.getLockedUntil());
    }

    private boolean isLockoutExpired(AuthCredential cred) {
        return cred.getLockedUntil() != null && OffsetDateTime.now().isAfter(cred.getLockedUntil());
    }
}
