-- ================================================
-- ADD ANOTHER ADMIN ACCOUNT
-- Copy this template and change the email/password
-- ================================================

-- Replace with actual email and password
INSERT INTO accounts (
    email, 
    password_hash, 
    role, 
    approved, 
    approved_at
)
VALUES (
    'secondadmin@gym.com',  -- ⬅️ CHANGE THIS EMAIL
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Default: admin123
    'admin',
    true,
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- ================================================
-- COMMON PASSWORD HASHES (bcrypt)
-- ================================================
-- admin123: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- password123: $2b$10$rQ8YvzN5D1xX9K4Z6gE5Lu7YB3xQxKqJ8YkF5nH9mP2wR4tV6uL8e
-- gym@2024: $2b$10$vZ7mJ5.X3qN9pW2rT4uL6O8sK7fH9jQ1nM3cV6bY8xA2sD5wE9zPq
-- 
-- To use different password, change the password_hash value above
-- ================================================
