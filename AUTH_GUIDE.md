# 🔐 Authentication System Guide

## Overview

The FitZone Gym system now includes a complete authentication system with member registration, admin approval, and role-based access.

## 🌟 Features

### For Members:
- ✅ Create account with Gmail
- ✅ Secure login system
- ✅ Password protected accounts
- ✅ Access to attendance marking only
- ✅ View personal attendance history

### For Admins:
- ✅ Review new account requests
- ✅ Approve/Reject member registrations
- ✅ Assign membership types
- ✅ Full system access
- ✅ Manage all members

## 🚀 How to Use

### Member Registration Flow:

1. **Visit Login Page**: Open `http://localhost:3000/login.html`
2. **Click "Register Now"**
3. **Fill Registration Form**:
   - Full Name
   - Email (must be Gmail)
   - Phone Number
   - Password (min 6 characters)
   - Confirm Password
   - Accept Terms & Conditions
4. **Submit Request**
5. **Wait for Admin Approval** (email notification when approved)
6. **Login with Approved Credentials**

### Admin Login:

1. **Visit Login Page**
2. **Click "Admin Login"**
3. **Enter Credentials**:
   - Username: `admin`
   - Password: `admin123`
4. **Access Full Dashboard**

### Admin Approval Process:

1. **Login as Admin**
2. **Go to "Account Requests" in Sidebar**
3. **Review Pending Requests**:
   - View member details
   - Email and phone number
   - Request date/time
4. **Approve Account**:
   - Click "Approve" button
   - Select membership type (Basic/Premium/VIP)
   - Member can now login
5. **Or Reject Account**:
   - Click "Reject" button
   - Confirm rejection

## 📁 Data Storage

### New Files Created:
- `data/accounts.json` - Approved member accounts
- `data/pending_accounts.json` - Pending approval requests

### Account Structure:
```json
{
  "id": "1234567890",
  "name": "John Doe",
  "email": "john@gmail.com",
  "phone": "+1234567890",
  "password": "hashed_password",
  "status": "pending",
  "createdAt": "2024-08-29T10:00:00.000Z"
}
```

## 🔒 Security Features

### Current Implementation:
- ✅ Gmail validation
- ✅ Password length requirement (6 chars)
- ✅ Password confirmation
- ✅ Admin approval required
- ✅ Session storage (localStorage)
- ✅ Role-based access control

### ⚠️ For Production (TODO):
- 🔴 Hash passwords (use bcrypt)
- 🔴 Use secure session tokens (JWT)
- 🔴 Add HTTPS
- 🔴 Implement rate limiting
- 🔴 Add email verification
- 🔴 Add password reset flow
- 🔴 Use environment variables for secrets

## 🎭 User Roles

### Member Role:
- Can access: Attendance page only
- Can mark: Own attendance
- Cannot access: Dashboard, Members, Reports, QR Codes, Settings

### Admin Role:
- Can access: All pages
- Can approve: New member requests
- Can manage: All members
- Can view: All reports and statistics

## 🔑 Default Credentials

### Admin Account:
```
Username: admin
Password: admin123
```

**⚠️ IMPORTANT**: Change these credentials before deploying to production!

## 📊 Member vs Admin View

### Member View:
```
├── Attendance (Mark attendance via QR scan)
└── Logout
```

### Admin View:
```
├── Dashboard (Statistics & Overview)
├── Attendance (QR Scanner)
├── Members (Manage all members)
├── Account Requests (Approve/Reject new accounts)
├── QR Code (Generate & Print QR codes)
├── Reports (Attendance reports)
├── Settings
└── Logout
```

## 🎯 Workflow Example

### New Member Joins:

1. **Member**: Registers on website
   ```
   Name: John Doe
   Email: john@gmail.com
   Phone: +1234567890
   Password: ******
   ```

2. **System**: Creates pending account request

3. **Admin**: Receives notification (in Account Requests page)
   - Reviews John's details
   - Clicks "Approve"
   - Selects "Premium" membership

4. **System**: 
   - Creates member record
   - Creates approved account
   - Links account to member

5. **Member**: 
   - Receives approval notification
   - Logs in with credentials
   - Can now mark attendance at gym

## 🛠️ API Endpoints

### Authentication:
- `POST /api/auth/register` - Create new account request
- `POST /api/auth/login` - Member login
- `POST /api/auth/admin-login` - Admin login

### Admin Operations:
- `GET /api/auth/pending` - Get pending account requests
- `POST /api/auth/approve/:id` - Approve account request
- `DELETE /api/auth/reject/:id` - Reject account request

## 💡 Tips

1. **First Time Setup**:
   - Login as admin first
   - Create some test accounts
   - Approve them to test member flow

2. **Testing Registration**:
   - Use Gmail addresses for testing
   - Remember passwords (no reset flow yet!)
   - Test both approval and rejection

3. **Member Experience**:
   - Members only see attendance page
   - They must scan QR at gym
   - No remote attendance possible

## 🐛 Troubleshooting

### "Email already registered"
- Email is already in system
- Check pending requests first
- Or try different email

### "Account pending approval"
- Admin hasn't approved yet
- Ask admin to check requests page

### "Invalid admin credentials"
- Double-check username/password
- Default is admin/admin123

### Session Issues
- Clear browser localStorage
- Re-login
- Check browser console for errors

## 📝 Notes

- Gmail validation ensures valid email addresses
- Passwords are stored in plain text (DEMO ONLY)
- Admin approval required for all new members
- Members created via "Add Member" button don't need approval
- Session persists in localStorage (not secure for production)

## 🚀 Next Steps

For production deployment:
1. Implement proper password hashing
2. Add JWT authentication
3. Set up HTTPS
4. Add email verification system
5. Implement password reset
6. Add 2FA for admin accounts
7. Use secure session management
8. Add audit logging

---

**Happy Gym Management! 💪🏋️‍♂️**
