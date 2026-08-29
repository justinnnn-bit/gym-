-- ================================================
-- CREATE ADMIN ACCOUNT
-- Run this ONCE in Supabase SQL Editor
-- ================================================

-- Step 1: Create admin in accounts table
-- Password: admin123 (hashed with bcrypt)
INSERT INTO accounts (
    email, 
    password_hash, 
    role, 
    approved, 
    approved_at
)
VALUES (
    'admin@gym.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'admin',
    true,
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- ================================================
-- SUCCESS! Admin account created
-- ================================================
-- Login with:
-- Username: admin@gym.com
-- Password: admin123
-- 
-- IMPORTANT: Change this password after first login!
-- ================================================
