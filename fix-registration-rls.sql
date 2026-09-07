-- ============================================
-- FIX: Allow Registration Through RLS
-- ============================================
-- Run this in Supabase SQL Editor to fix the registration error

-- Drop the existing policy
DROP POLICY IF EXISTS "Allow public registration" ON pending_accounts;

-- Recreate with explicit public access
CREATE POLICY "Allow public registration"
ON pending_accounts FOR INSERT
TO public, anon, authenticated
WITH CHECK (true);

-- Verify it works:
-- SELECT * FROM pg_policies WHERE tablename = 'pending_accounts';
