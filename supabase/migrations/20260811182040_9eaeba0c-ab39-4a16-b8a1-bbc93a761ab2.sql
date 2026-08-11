UPDATE projects 
SET content_sections = (
    SELECT jsonb_agg(
        CASE 
            WHEN section->>'heading' = 'About Suncrisp Studio Rooms' 
            THEN section || '{"heading": "About Suncrisp Studio Room"}'::jsonb
            ELSE section 
        END
    )
    FROM jsonb_array_elements(content_sections) AS section
)
WHERE id = '369e928f-5d49-42fd-aca0-9f7e0570a9d4';