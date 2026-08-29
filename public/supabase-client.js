// Supabase Client Configuration
// Replace with your actual Supabase credentials

const SUPABASE_URL = 'https://mmtwgjrmiaedwlpsynl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tdHdnanJtaWFlZHdscHN5bG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5OTk5OTIsImV4cCI6MjEwMzU3NTk5Mn0.nwAf2LtgxgQUU22g8e5s-0Wwrko1KgLJkd7Ll0F8X-M';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== AUTHENTICATION ==========

async function registerMember(name, email, phone, password) {
    try {
        // 1. Create auth user in Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                    phone: phone
                }
            }
        });

        if (authError) throw authError;

        // 2. Create pending account request
        const { data, error } = await supabase
            .from('pending_accounts')
            .insert([{
                name: name,
                email: email,
                phone: phone,
                password_hash: 'handled_by_supabase',
                status: 'pending'
            }])
            .select();

        if (error) throw error;

        return { success: true, message: 'Registration submitted for approval' };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

async function loginMember(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        // Check if account is approved
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('*, members(*)')
            .eq('email', email)
            .single();

        if (accountError || !account.approved) {
            await supabase.auth.signOut();
            return { success: false, error: 'Account pending approval' };
        }

        return {
            success: true,
            user: {
                id: account.member_id,
                name: account.members.name,
                email: account.email,
                role: account.role
            }
        };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

async function loginAdmin(username, password) {
    try {
        // For admin, use email format
        const adminEmail = username.includes('@') ? username : `${username}@fitzone.com`;
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: adminEmail,
            password: password
        });

        if (error) throw error;

        // Verify admin role
        const { data: account } = await supabase
            .from('accounts')
            .select('role')
            .eq('email', adminEmail)
            .single();

        if (!account || account.role !== 'admin') {
            await supabase.auth.signOut();
            return { success: false, error: 'Not authorized as admin' };
        }

        return {
            success: true,
            admin: {
                id: 'admin',
                name: 'Administrator',
                role: 'admin'
            }
        };
    } catch (error) {
        console.error('Admin login error:', error);
        return { success: false, error: error.message };
    }
}

async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error);
}

// ========== MEMBERS ==========

async function getAllMembers() {
    try {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('active', true)
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching members:', error);
        return [];
    }
}

async function addMember(memberData) {
    try {
        const { data, error } = await supabase
            .from('members')
            .insert([{
                name: memberData.name,
                email: memberData.email,
                phone: memberData.phone,
                membership_type: memberData.membershipType
            }])
            .select();

        if (error) throw error;
        return { success: true, member: data[0] };
    } catch (error) {
        console.error('Error adding member:', error);
        return { success: false, error: error.message };
    }
}

// ========== ATTENDANCE ==========

async function recordAttendance(memberId, action) {
    try {
        // Get member name
        const { data: member } = await supabase
            .from('members')
            .select('name')
            .eq('id', memberId)
            .single();

        const { data, error } = await supabase
            .from('attendance')
            .insert([{
                member_id: memberId,
                member_name: member.name,
                action: action
            }])
            .select();

        if (error) throw error;
        return { success: true, attendance: data[0], member: member };
    } catch (error) {
        console.error('Error recording attendance:', error);
        return { success: false, error: error.message };
    }
}

async function getTodayAttendance() {
    try {
        const { data, error } = await supabase
            .from('todays_attendance')
            .select('*')
            .order('check_time', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return [];
    }
}

async function getAllAttendance() {
    try {
        const { data, error } = await supabase
            .from('attendance')
            .select('*, members(name)')
            .order('check_time', { ascending: false })
            .limit(100);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching all attendance:', error);
        return [];
    }
}

async function getMemberAttendance(memberId) {
    try {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('member_id', memberId)
            .order('check_time', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching member attendance:', error);
        return [];
    }
}

// ========== PENDING ACCOUNTS ==========

async function getPendingAccounts() {
    try {
        const { data, error } = await supabase
            .from('pending_accounts')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching pending accounts:', error);
        return [];
    }
}

async function approveAccount(accountId, membershipType) {
    try {
        // Get pending account details
        const { data: pendingAccount } = await supabase
            .from('pending_accounts')
            .select('*')
            .eq('id', accountId)
            .single();

        if (!pendingAccount) throw new Error('Account not found');

        // Create member
        const { data: newMember, error: memberError } = await supabase
            .from('members')
            .insert([{
                name: pendingAccount.name,
                email: pendingAccount.email,
                phone: pendingAccount.phone,
                membership_type: membershipType || 'Basic'
            }])
            .select()
            .single();

        if (memberError) throw memberError;

        // Create approved account
        const { error: accountError } = await supabase
            .from('accounts')
            .insert([{
                member_id: newMember.id,
                email: pendingAccount.email,
                password_hash: pendingAccount.password_hash,
                role: 'member',
                approved: true,
                approved_at: new Date().toISOString()
            }]);

        if (accountError) throw accountError;

        // Update pending account status
        await supabase
            .from('pending_accounts')
            .update({ status: 'approved' })
            .eq('id', accountId);

        return { success: true, member: newMember };
    } catch (error) {
        console.error('Error approving account:', error);
        return { success: false, error: error.message };
    }
}

async function rejectAccount(accountId) {
    try {
        const { error } = await supabase
            .from('pending_accounts')
            .update({ status: 'rejected' })
            .eq('id', accountId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error rejecting account:', error);
        return { success: false, error: error.message };
    }
}

// ========== DASHBOARD STATS ==========

async function getDashboardStats() {
    try {
        // Get total members
        const { count: totalMembers } = await supabase
            .from('members')
            .select('*', { count: 'exact', head: true })
            .eq('active', true);

        // Get today's check-ins
        const { count: todayCheckins } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('action', 'checkin')
            .gte('check_time', new Date().toISOString().split('T')[0]);

        // Get today's check-outs
        const { count: todayCheckouts } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('action', 'checkout')
            .gte('check_time', new Date().toISOString().split('T')[0]);

        // Get currently in gym
        const { data: currentlyInGym } = await supabase
            .from('currently_in_gym')
            .select('*');

        return {
            totalMembers: totalMembers || 0,
            todayCheckins: todayCheckins || 0,
            todayCheckouts: todayCheckouts || 0,
            currentlyInGym: currentlyInGym?.length || 0
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            totalMembers: 0,
            todayCheckins: 0,
            todayCheckouts: 0,
            currentlyInGym: 0
        };
    }
}

// Export functions for use in other files
window.supabaseClient = {
    registerMember,
    loginMember,
    loginAdmin,
    logout,
    getAllMembers,
    addMember,
    recordAttendance,
    getTodayAttendance,
    getAllAttendance,
    getMemberAttendance,
    getPendingAccounts,
    approveAccount,
    rejectAccount,
    getDashboardStats
};
