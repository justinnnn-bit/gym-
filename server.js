const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Data file paths
const MEMBERS_FILE = './data/members.json';
const ATTENDANCE_FILE = './data/attendance.json';
const ACCOUNTS_FILE = './data/accounts.json';
const PENDING_ACCOUNTS_FILE = './data/pending_accounts.json';

// Initialize data files
async function initializeData() {
  try {
    await fs.mkdir('./data', { recursive: true });
    
    try {
      await fs.access(MEMBERS_FILE);
    } catch {
      await fs.writeFile(MEMBERS_FILE, JSON.stringify([]));
    }
    
    try {
      await fs.access(ATTENDANCE_FILE);
    } catch {
      await fs.writeFile(ATTENDANCE_FILE, JSON.stringify([]));
    }
    
    try {
      await fs.access(ACCOUNTS_FILE);
    } catch {
      await fs.writeFile(ACCOUNTS_FILE, JSON.stringify([]));
    }
    
    try {
      await fs.access(PENDING_ACCOUNTS_FILE);
    } catch {
      await fs.writeFile(PENDING_ACCOUNTS_FILE, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// Helper functions
async function readMembers() {
  const data = await fs.readFile(MEMBERS_FILE, 'utf8');
  return JSON.parse(data);
}

async function writeMembers(members) {
  await fs.writeFile(MEMBERS_FILE, JSON.stringify(members, null, 2));
}

async function readAttendance() {
  const data = await fs.readFile(ATTENDANCE_FILE, 'utf8');
  return JSON.parse(data);
}

async function writeAttendance(attendance) {
  await fs.writeFile(ATTENDANCE_FILE, JSON.stringify(attendance, null, 2));
}

async function readAccounts() {
  const data = await fs.readFile(ACCOUNTS_FILE, 'utf8');
  return JSON.parse(data);
}

async function writeAccounts(accounts) {
  await fs.writeFile(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
}

async function readPendingAccounts() {
  const data = await fs.readFile(PENDING_ACCOUNTS_FILE, 'utf8');
  return JSON.parse(data);
}

async function writePendingAccounts(pendingAccounts) {
  await fs.writeFile(PENDING_ACCOUNTS_FILE, JSON.stringify(pendingAccounts, null, 2));
}

// API Routes

// ========== AUTHENTICATION ROUTES ==========

// Member Registration (Creates pending account)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Validate Gmail
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({ error: 'Please use a Gmail address' });
    }
    
    // Check if email already exists
    const accounts = await readAccounts();
    const pendingAccounts = await readPendingAccounts();
    
    const emailExists = accounts.some(acc => acc.email === email) || 
                       pendingAccounts.some(acc => acc.email === email);
    
    if (emailExists) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Create pending account
    const pendingAccount = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      password, // In production, hash this password!
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    pendingAccounts.push(pendingAccount);
    await writePendingAccounts(pendingAccounts);
    
    res.json({ success: true, message: 'Registration submitted for approval' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Member Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const accounts = await readAccounts();
    const account = accounts.find(acc => acc.email === email && acc.password === password);
    
    if (!account) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    if (!account.approved) {
      return res.status(403).json({ error: 'Your account is pending admin approval' });
    }
    
    res.json({ 
      success: true,
      user: {
        id: account.memberId,
        name: account.name,
        email: account.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin Login
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Default admin credentials (change these in production!)
    if (username === 'admin' && password === 'admin123') {
      res.json({ 
        success: true,
        admin: {
          id: 'admin',
          name: 'Administrator',
          role: 'admin'
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Admin login failed' });
  }
});

// Get pending account requests (Admin only)
app.get('/api/auth/pending', async (req, res) => {
  try {
    const pendingAccounts = await readPendingAccounts();
    res.json(pendingAccounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending accounts' });
  }
});

// Approve account (Admin only)
app.post('/api/auth/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { membershipType } = req.body;
    
    const pendingAccounts = await readPendingAccounts();
    const accountIndex = pendingAccounts.findIndex(acc => acc.id === id);
    
    if (accountIndex === -1) {
      return res.status(404).json({ error: 'Account request not found' });
    }
    
    const pendingAccount = pendingAccounts[accountIndex];
    
    // Create member
    const members = await readMembers();
    const newMember = {
      id: Date.now().toString(),
      name: pendingAccount.name,
      email: pendingAccount.email,
      phone: pendingAccount.phone,
      membershipType: membershipType || 'Basic',
      joinDate: new Date().toISOString(),
      active: true
    };
    members.push(newMember);
    await writeMembers(members);
    
    // Create approved account
    const accounts = await readAccounts();
    const approvedAccount = {
      id: pendingAccount.id,
      memberId: newMember.id,
      name: pendingAccount.name,
      email: pendingAccount.email,
      password: pendingAccount.password,
      approved: true,
      approvedAt: new Date().toISOString()
    };
    accounts.push(approvedAccount);
    await writeAccounts(accounts);
    
    // Remove from pending
    pendingAccounts.splice(accountIndex, 1);
    await writePendingAccounts(pendingAccounts);
    
    res.json({ success: true, member: newMember });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve account' });
  }
});

// Reject account (Admin only)
app.delete('/api/auth/reject/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const pendingAccounts = await readPendingAccounts();
    const accountIndex = pendingAccounts.findIndex(acc => acc.id === id);
    
    if (accountIndex === -1) {
      return res.status(404).json({ error: 'Account request not found' });
    }
    
    pendingAccounts.splice(accountIndex, 1);
    await writePendingAccounts(pendingAccounts);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject account' });
  }
});

// ========== MEMBER ROUTES ==========

// API Routes

// Get all members
app.get('/api/members', async (req, res) => {
  try {
    const members = await readMembers();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Add new member
app.post('/api/members', async (req, res) => {
  try {
    const { name, email, phone, membershipType } = req.body;
    const members = await readMembers();
    
    const newMember = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      membershipType,
      joinDate: new Date().toISOString(),
      active: true
    };
    
    members.push(newMember);
    await writeMembers(members);
    
    res.json(newMember);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Get member by ID
app.get('/api/members/:id', async (req, res) => {
  try {
    const members = await readMembers();
    const member = members.find(m => m.id === req.params.id);
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// Record attendance
app.post('/api/attendance', async (req, res) => {
  try {
    const { memberId, action } = req.body; // action can be 'checkin' or 'checkout'
    const members = await readMembers();
    const member = members.find(m => m.id === memberId);
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    if (!member.active) {
      return res.status(403).json({ error: 'Member is not active' });
    }
    
    const attendance = await readAttendance();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // For check-in: Check if already checked in today
    if (action === 'checkin') {
      const alreadyCheckedIn = attendance.some(a => 
        a.memberId === memberId && 
        a.date.startsWith(today) && 
        a.action === 'checkin'
      );
      
      if (alreadyCheckedIn) {
        return res.status(400).json({ error: 'Already checked in today', member });
      }
    }
    
    // For check-out: Check if checked in but not checked out yet
    if (action === 'checkout') {
      const checkedInToday = attendance.some(a => 
        a.memberId === memberId && 
        a.date.startsWith(today) && 
        a.action === 'checkin'
      );
      
      const alreadyCheckedOut = attendance.some(a => 
        a.memberId === memberId && 
        a.date.startsWith(today) && 
        a.action === 'checkout'
      );
      
      if (!checkedInToday) {
        return res.status(400).json({ error: 'You need to check in first', member });
      }
      
      if (alreadyCheckedOut) {
        return res.status(400).json({ error: 'Already checked out today', member });
      }
    }
    
    const newAttendance = {
      id: Date.now().toString(),
      memberId,
      memberName: member.name,
      date: now.toISOString(),
      checkInTime: now.toLocaleTimeString('en-US'),
      action: action || 'checkin' // default to checkin for backward compatibility
    };
    
    attendance.push(newAttendance);
    await writeAttendance(attendance);
    
    res.json({ 
      success: true, 
      attendance: newAttendance,
      member 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

// Get all attendance records
app.get('/api/attendance', async (req, res) => {
  try {
    const attendance = await readAttendance();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Get attendance for a specific member
app.get('/api/attendance/:memberId', async (req, res) => {
  try {
    const attendance = await readAttendance();
    const memberAttendance = attendance.filter(a => a.memberId === req.params.memberId);
    res.json(memberAttendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Get today's attendance
app.get('/api/attendance/today/all', async (req, res) => {
  try {
    const attendance = await readAttendance();
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date.startsWith(today));
    res.json(todayAttendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch today\'s attendance' });
  }
});

// Initialize and start server
initializeData().then(() => {
  app.listen(PORT, () => {
    console.log(`Gym Attendance Server running on http://localhost:${PORT}`);
  });
});
