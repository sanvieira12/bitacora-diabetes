-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- person table
CREATE TABLE person (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- night_record table
CREATE TABLE night_record (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id               UUID        NOT NULL REFERENCES person(id),
    date                    DATE        NOT NULL,
    glucose_before_sleep    INTEGER     NOT NULL,
    glucose_wakeup          INTEGER,
    had_bedtime_snack       BOOLEAN     NOT NULL DEFAULT FALSE,
    snack_description       TEXT,
    bedtime                 TIME        NOT NULL,
    wake_time               TIME,
    sleep_quality           VARCHAR(10) NOT NULL,
    physical_activity_today BOOLEAN     NOT NULL DEFAULT FALSE,
    stress_level            VARCHAR(10) NOT NULL,
    notes                   TEXT,
    attention_level         VARCHAR(10) NOT NULL,
    attention_reasons       JSONB,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_night_record_date ON night_record(date);
CREATE INDEX idx_night_record_person_id ON night_record(person_id);
CREATE UNIQUE INDEX idx_night_record_person_date ON night_record(person_id, date);

-- episode_record table
CREATE TABLE episode_record (
    id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id                   UUID        NOT NULL REFERENCES person(id),
    night_record_id             UUID        REFERENCES night_record(id),
    episode_date                DATE        NOT NULL,
    episode_time                TIME        NOT NULL,
    symptoms                    JSONB       NOT NULL DEFAULT '[]',
    glucose_at_episode          INTEGER,
    intervention                TEXT        NOT NULL,
    glucose_after_intervention  INTEGER,
    recovery_time_minutes       INTEGER,
    severity                    VARCHAR(10) NOT NULL,
    notes                       TEXT,
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_episode_record_date ON episode_record(episode_date);
CREATE INDEX idx_episode_record_person_id ON episode_record(person_id);
CREATE INDEX idx_episode_record_night_record_id ON episode_record(night_record_id);

-- app_settings table
CREATE TABLE app_settings (
    id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id                   UUID        NOT NULL REFERENCES person(id),
    low_glucose_threshold       INTEGER     NOT NULL DEFAULT 100,
    critical_glucose_threshold  INTEGER     NOT NULL DEFAULT 70,
    bedtime_target_min          INTEGER     NOT NULL DEFAULT 110,
    bedtime_target_max          INTEGER     NOT NULL DEFAULT 180,
    high_glucose_threshold      INTEGER     NOT NULL DEFAULT 270,
    emergency_protocol_text     TEXT        NOT NULL DEFAULT 'Si glucosa < 70 mg/dL: consumir 15g hidratos simples, esperar 15 min, medir nuevamente. Llamar al médico si no mejora.',
    doctor_notes                TEXT,
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);
