-- ================================================
-- FITZONE GYM - SUPABASE DATABASE SCHEMA
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. MEMBERS TABLE
-- ================================================
CREATE TABLE members (
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
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_active ON members(active);

-- ================================================
-- 2. ACCOUNTS TABLE (for authentication)
-- ================================================
CREATE TABLE accounts (
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
CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_accounts_member_id ON accounts(member_id);

-- ================================================
-- 3. PENDING ACCOUNTS TABLE (registration requests)
-- ================================================
CREATE TABLE pending_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for status filtering
CREATE INDEX idx_pending_accounts_status ON pending_accounts(status);

-- ================================================
-- 4. ATTENDANCE TABLE (check-ins and check-outs)
-- ================================================
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    member_name VARCHAR(255) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('checkin', 'checkout')),
    check_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_attendance_member_id ON attendance(member_id);
CREATE INDEX idx_attendance_check_time ON attendance(check_time);
CREATE INDEX idx_attendance_action ON attendance(action);
CREATE INDEX idx_attendance_date ON attendance(DATE(check_time));

-- ================================================
-- 5. SESSIONS TABLE (for tracking gym sessions)
-- ================================================
CREATE TABLE gym_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for member sessions
CREATE INDEX idx_sessions_member_id ON gym_sessions(member_id);
CREATE INDEX idx_sessions_date ON gym_sessions(DATE(check_in_time));

-- ================================================
-- 6. FUNCTIONS & TRIGGERS
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
CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to prevent duplicate check-ins on same day
CREATE OR REPLACE FUNCTION check_duplicate_checkin()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.action = 'checkin' THEN
        IF EXISTS (
            SELECT 1 FROM attendance
            WHERE member_id = NEW.member_id
            AND action = 'checkin'
            AND DATE(check_time) = DATE(NEW.check_time)
        ) THEN
            RAISE EXCEPTION 'Member already checked in today';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for attendance duplicate check
CREATE TRIGGER prevent_duplicate_checkin
    BEFORE INSERT ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION check_duplicate_checkin();

-- ================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_sessions ENABLE ROW LEVEL SECURITY;

-- Members: Allow read for authenticated users
CREATE POLICY "Members are viewable by authenticated users"
    ON members FOR SELECT
    TO authenticated
    USING (true);

-- Members: Only admins can insert/update/delete
CREATE POLICY "Only admins can modify members"
    ON members FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM accounts
            WHERE accounts.id = auth.uid()
            AND accounts.role = 'admin'
        )
    );

-- Attendance: Users can view their own, admins can view all
CREATE POLICY "Users can view own attendance"
    ON attendance FOR SELECT
    TO authenticated
    USING (
        member_id = (
            SELECT member_id FROM accounts WHERE accounts.id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM accounts
            WHERE accounts.id = auth.uid()
            AND accounts.role = 'admin'
        )
    );

-- Attendance: Users can insert their own
CREATE POLICY "Users can insert own attendance"
    ON attendance FOR INSERT
    TO authenticated
    WITH CHECK (
        member_id = (
            SELECT member_id FROM accounts WHERE accounts.id = auth.uid()
        )
    );

-- ================================================
-- 8. VIEWS (for easier queries)
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
-- 9. SAMPLE DATA (for testing)
-- ================================================

-- Insert admin account (password: admin123 - change this!)
INSERT INTO accounts (email, password_hash, role, approved, approved_at)
VALUES ('admin@fitzone.com', '$2b$10$rQ8YvzN5D1xX9K4Z6gE5Lu7YB3xQxKqJ8YkF5nH9mP2wR4tV6uL8e', 'admin', true, NOW());

-- Insert sample member
INSERT INTO members (name, email, phone, membership_type)
VALUES ('John Doe', 'john@example.com', '+1234567890', 'Premium');

-- ================================================
-- SUCCESS! Database schema created
-- ================================================
-- Next steps:
-- 1. Update your app to use Supabase client
-- 2. Configure Row Level Security policies
-- 3. Test authentication flow
-- ================================================
