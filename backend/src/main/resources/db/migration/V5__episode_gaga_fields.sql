-- New structured fields for episode_record
ALTER TABLE episode_record
    ADD COLUMN IF NOT EXISTS intervention_type VARCHAR(20),
    ADD COLUMN IF NOT EXISTS intervention_note TEXT,
    ADD COLUMN IF NOT EXISTS symptoms_note     TEXT,
    ADD COLUMN IF NOT EXISTS recovery_time     VARCHAR(20);

-- Allow intervention text to be null (new saves use intervention_type instead)
ALTER TABLE episode_record ALTER COLUMN intervention DROP NOT NULL;
