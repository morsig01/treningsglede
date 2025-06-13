-- Create audit_logs table for tracking deletions
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to only allow admins to view audit logs
CREATE POLICY "Only admins can view audit logs" ON audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Function to delete past sessions and log the deletion
CREATE OR REPLACE FUNCTION delete_past_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete sessions older than 1 day and get count
    WITH deleted AS (
        DELETE FROM sessions
        WHERE start_time < NOW() - INTERVAL '1 day'
        RETURNING id, title, start_time
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;

    -- Log the deletion if any sessions were deleted
    IF deleted_count > 0 THEN
        INSERT INTO audit_logs (action, table_name, details)
        VALUES (
            'DELETE',
            'sessions',
            jsonb_build_object(
                'count', deleted_count,
                'timestamp', NOW()
            )
        );
    END IF;
END;
$$;

-- Create a trigger to run cleanup after each session insert
CREATE OR REPLACE TRIGGER cleanup_after_session_insert
    AFTER INSERT ON sessions
    FOR EACH STATEMENT
    EXECUTE FUNCTION delete_past_sessions();

-- Schedule daily cleanup at midnight
SELECT cron.schedule(
    'daily-session-cleanup',  -- job name
    '0 0 * * *',             -- cron schedule (midnight every day)
    $$SELECT delete_past_sessions()$$
); 