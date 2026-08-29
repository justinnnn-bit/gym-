-- Clean up pending_accounts table
-- This removes all approved/rejected entries that are blocking re-registration

-- Delete all entries that have status='approved' (they should have been deleted)
DELETE FROM pending_accounts WHERE status = 'approved';

-- Delete all entries that have status='rejected' (they should have been deleted)
DELETE FROM pending_accounts WHERE status = 'rejected';

-- Optional: If you want to see what emails exist in pending_accounts before cleanup, run this first:
-- SELECT email, status, created_at FROM pending_accounts ORDER BY created_at DESC;
