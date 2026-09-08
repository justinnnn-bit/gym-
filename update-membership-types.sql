-- Update membership type constraint to use duration-based types
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the old constraint FIRST (so we can update existing data)
ALTER TABLE members 
DROP CONSTRAINT IF EXISTS members_membership_type_check;

-- Step 2: Now update ALL existing members to new types
UPDATE members SET membership_type = '1 Month' WHERE membership_type = 'Basic';
UPDATE members SET membership_type = '6 Months' WHERE membership_type = 'Premium';
UPDATE members SET membership_type = '1 Year' WHERE membership_type = 'VIP';

-- Step 3: Add new constraint with duration-based types
ALTER TABLE members 
ADD CONSTRAINT members_membership_type_check 
CHECK (membership_type IN ('1 Month', '3 Months', '6 Months', '1 Year'));

-- Step 4: Verify the change
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'members' AND column_name = 'membership_type';

-- Step 5: Check updated members
SELECT id, name, membership_type FROM members LIMIT 10;
