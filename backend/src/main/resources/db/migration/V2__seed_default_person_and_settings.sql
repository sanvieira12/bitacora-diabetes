-- Seed default person (Juana)
INSERT INTO person (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Juana');

-- Seed default settings for Juana
INSERT INTO app_settings (
    id,
    person_id,
    low_glucose_threshold,
    critical_glucose_threshold,
    bedtime_target_min,
    bedtime_target_max,
    high_glucose_threshold,
    emergency_protocol_text
)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    100,
    70,
    110,
    180,
    270,
    'Si glucosa < 70 mg/dL: consumir 15g hidratos simples, esperar 15 min, medir nuevamente. Llamar al médico si no mejora.'
);
