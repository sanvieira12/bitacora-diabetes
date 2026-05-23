-- New fields for night_record: gamified inputs
ALTER TABLE night_record
    ADD COLUMN IF NOT EXISTS alcohol        VARCHAR(20),
    ADD COLUMN IF NOT EXISTS dinner_type    VARCHAR(20),
    ADD COLUMN IF NOT EXISTS exercise_level VARCHAR(20);

-- New field for app_settings: track last unlocked goal for isNewGoalUnlocked flag
ALTER TABLE app_settings
    ADD COLUMN IF NOT EXISTS last_unlocked_goal INTEGER NOT NULL DEFAULT 0;
