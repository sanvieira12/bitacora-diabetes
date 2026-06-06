ALTER TABLE night_record
    ADD COLUMN IF NOT EXISTS measurement_time TIME;

DROP INDEX IF EXISTS idx_night_record_person_date;

CREATE INDEX IF NOT EXISTS idx_night_record_person_date
    ON night_record(person_id, date);

CREATE UNIQUE INDEX IF NOT EXISTS idx_night_record_measurement_unique
    ON night_record(person_id, date, measurement_time, glucose_before_sleep)
    WHERE measurement_time IS NOT NULL;
