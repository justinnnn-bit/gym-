-- Clean up orphaned accounts for deleted members
-- This prevents deleted members from logging in with their old accounts

-- Delete accounts where the member_id no longer exists or is inactive
DELETE FROM accounts 
WHERE member_id IN (
    SELECT id FROM members WHERE active = false
);

-- Optional: Check orphaned accounts before cleanup
-- SELECT a.id, a.email, m.name, m.active 
-- FROM accounts a
-- LEFT JOIN members m ON a.member_id = m.id
-- WHERE m.active = false OR m.id IS NULL;
