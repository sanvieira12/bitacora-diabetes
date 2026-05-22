CREATE TABLE auth_credential (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    pin_hash        VARCHAR(255) NOT NULL,
    must_change_pin BOOLEAN     NOT NULL DEFAULT TRUE,
    failed_attempts INTEGER     NOT NULL DEFAULT 0,
    locked_until    TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- pin_hash is initialized to BCrypt("0000") by AuthService on first startup
INSERT INTO auth_credential (id, pin_hash, must_change_pin)
VALUES ('00000000-0000-0000-0000-000000000003', 'MUST_INITIALIZE', TRUE);
