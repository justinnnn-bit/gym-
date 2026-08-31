-- Add membership_expiry column to members table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS membership_expiry DATE;

-- Add a comment to the column
COMMENT ON COLUMN members.membership_expiry IS 'Date when the membership expires';

-- Optionally set default expiry dates for existing members (1 year from join date)
UPDATE members 
SET membership_expiry = join_date + INTERVAL '1 year'
WHERE membership_expiry IS NULL AND join_date IS NOT NULL;

-- For members without join_date, set expiry to 1 year from now
UPDATE members 
SET membership_expiry = CURRENT_DATE + INTERVAL '1 year'
WHERE membership_expiry IS NULL;
