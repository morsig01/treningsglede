-- Add location columns to sessions table
ALTER TABLE sessions 
ADD COLUMN location TEXT,
ADD COLUMN latitude NUMERIC(10, 8),
ADD COLUMN longitude NUMERIC(11, 8);
