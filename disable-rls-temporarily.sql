-- ============================================
-- TEMPORARY FIX: Disable RLS on pending_accounts
-- ============================================
-- This will allow registration to work while we fix the policies
-- Run this in Supabase SQL Editor

-- Option 1: Disable RLS completely on pending_accounts (TEMPORARY)
ALTER TABLE pending_accounts DISABLE ROW LEVEL SECURITY;

-- Option 2: Drop ALL policies and recreate
DROP POLICY IF EXISTS "Allow public registration" ON pending_accounts;
DROP POLICY IF EXISTS "Prevent public read of pending accounts" ON pending_accounts;
DROP POLICY IF EXISTS "Prevent public updates to pending accounts" ON pending_accounts;
DROP POLICY IF EXISTS "Prevent public deletion of pending accounts" ON pending_accounts;

-- Re-enable RLS with correct policy
ALTER TABLE pending_accounts ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy for INSERT
CREATE POLICY "allow_insert_pending_accounts"
ON pending_accounts
FOR INSERT
WITH CHECK (true);

-- Restrict other operations
CREATE POLICY "restrict_select_pending_accounts"
ON pending_accounts
FOR SELECT
USING (false);

CREATE POLICY "restrict_update_pending_accounts"
ON pending_accounts
FOR UPDATE
USING (false);

CREATE POLICY "restrict_delete_pending_accounts"
ON pending_accounts
FOR DELETE
USING (false);

-- Verify
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'pending_accounts';
