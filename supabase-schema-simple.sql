-- ================================================
-- FITZONE GYM - SUPABASE DATABASE SCHEMA (SIMPLE)
-- Copy all of this and paste in Supabase SQL Editor
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. MEMBERS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    membership_type VARCHAR(50) NOT NULL CHECK (membership_type IN ('Basic', 'Premium', 'VIP')),
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_active ON members(active);

-- ================================================
-- 2. ACCOUNTS TABLE (for authentication)
-- ================================================
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    approved BOOLEAN DEFAULT false,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_member_id ON accounts(member_id);

-- ================================================
-- 3. PENDING ACCOUNTS TABLE (registration requests)
-- ================================================
CREATE TABLE IF NOT EXISTS pending_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_pending_accounts_status ON pending_accounts(status);

-- ================================================
-- 4. ATTENDANCE TABLE (check-ins and check-outs)
-- ================================================
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    member_name VARCHAR(255) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('checkin', 'checkout')),
    check_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_check_time ON attendance(check_time);
CREATE INDEX IF NOT EXISTS idx_attendance_action ON attendance(action);

-- ================================================
-- 5. FUNCTIONS & TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for members table
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 6. ROW LEVEL SECURITY (DISABLED FOR EASY SETUP)
-- ================================================

ALTER TABLE IF EXISTS members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pending_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance DISABLE ROW LEVEL SECURITY;

-- ================================================
-- 7. VIEWS (for easier queries)
-- ================================================

-- View: Today's attendance summary
CREATE OR REPLACE VIEW todays_attendance AS
SELECT
    m.name,
    m.email,
    m.membership_type,
    a.action,
    a.check_time
FROM attendance a
JOIN members m ON a.member_id = m.id
WHERE DATE(a.check_time) = CURRENT_DATE
ORDER BY a.check_time DESC;

-- View: Member statistics
CREATE OR REPLACE VIEW member_stats AS
SELECT
    m.id,
    m.name,
    m.email,
    m.membership_type,
    COUNT(CASE WHEN a.action = 'checkin' THEN 1 END) as total_checkins,
    COUNT(CASE WHEN a.action = 'checkout' THEN 1 END) as total_checkouts,
    MAX(CASE WHEN a.action = 'checkin' THEN a.check_time END) as last_checkin
FROM members m
LEFT JOIN attendance a ON m.id = a.member_id
GROUP BY m.id, m.name, m.email, m.membership_type;

-- View: Currently in gym (checked in but not checked out today)
CREATE OR REPLACE VIEW currently_in_gym AS
SELECT
    m.id,
    m.name,
    m.membership_type,
    MAX(a.check_time) as check_in_time
FROM members m
JOIN attendance a ON m.id = a.member_id
WHERE DATE(a.check_time) = CURRENT_DATE
    AND a.action = 'checkin'
    AND NOT EXISTS (
        SELECT 1 FROM attendance a2
        WHERE a2.member_id = m.id
        AND a2.action = 'checkout'
        AND DATE(a2.check_time) = CURRENT_DATE
    )
GROUP BY m.id, m.name, m.membership_type;

-- ================================================
-- 8. SAMPLE DATA (for testing)
-- ================================================

-- Insert sample member for testing
INSERT INTO members (name, email, phone, membership_type)
VALUES ('John Doe', 'john@example.com', '+1234567890', 'Premium')
ON CONFLICT (email) DO NOTHING;

-- ================================================
-- SUCCESS! Database schema created
-- Copy this entire file and run it in Supabase SQL Editor
-- ================================================
