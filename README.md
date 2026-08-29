# 🏋️ FitZone Gym - Modern Attendance Management System

<div align="center">

![Gym Attendance](https://img.shields.io/badge/Gym-Attendance-blueviolet)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Express](https://img.shields.io/badge/Express-v4.18-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

**A modern, beautiful web-based gym attendance tracking system with QR code scanning, member management, and authentication.**

[Features](#features) • [Demo](#demo) • [Installation](#installation) • [Usage](#usage) • [Screenshots](#screenshots)

</div>

---

## ✨ Features

### 🔐 **Authentication System**
- Member registration with Gmail validation
- Secure login for members and admins
- Admin approval workflow for new accounts
- Role-based access control

### 📱 **QR Code Attendance**
- Dual QR system (Check-In & Check-Out)
- Real-time camera scanning
- Physical presence verification
- Duplicate prevention
- Beautiful member selection interface

### 👥 **Member Management**
- Add and manage gym members
- Multiple membership types (Basic, Premium, VIP)
- Member profiles with contact info
- Attendance history per member

### 📊 **Dashboard & Analytics**
- Real-time attendance statistics
- Today's check-ins and check-outs
- Currently in gym count
- Beautiful data visualization

### 🎨 **Modern UI/UX**
- Clean, professional interface
- Smooth animations and transitions
- Responsive design (mobile, tablet, desktop)
- Dark sidebar navigation
- Gradient color schemes

---

## 🚀 Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **QR Code**: 
  - Generation: qrcode.js
  - Scanning: html5-qrcode
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Inter)
- **Data Storage**: JSON files (easily upgradable to database)

---

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)
- Modern web browser with camera support

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/fitzone-gym-attendance.git
cd fitzone-gym-attendance
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the server**
```bash
npm start
```

4. **Open in browser**
```
http://localhost:3000/login.html
```

---

## 🎯 Usage

### For Members

1. **Register Account**
   - Visit login page
   - Click "Register Now"
   - Fill form with Gmail address
   - Wait for admin approval

2. **Login**
   - Use approved credentials
   - Access attendance page

3. **Mark Attendance**
   - Scan gym QR code with phone camera
   - Select your name from list
   - Confirm check-in/check-out

### For Admins

1. **Login**
   - Username: `admin`
   - Password: `admin123`

2. **Approve Members**
   - Go to "Account Requests"
   - Review pending registrations
   - Approve or reject accounts
   - Assign membership types

3. **Manage System**
   - View dashboard statistics
   - Generate QR codes
   - Access attendance reports
   - Manage all members

---

## 📸 Screenshots

### Login Page
Modern authentication interface with member registration

### Dashboard
Real-time statistics and today's attendance overview

### QR Scanner
Beautiful member selection after QR code scan

### Admin Panel
Manage members and approve account requests

---

## 📁 Project Structure

```
fitzone-gym-attendance/
├── public/
│   ├── index.html              # Main dashboard
│   ├── login.html              # Login & registration page
│   ├── styles.css              # Main styles
│   ├── login-styles.css        # Login page styles
│   ├── app.js                  # Main application logic
│   └── login.js                # Authentication logic
├── data/                       # Auto-generated data storage
│   ├── members.json           # Member records
│   ├── attendance.json        # Attendance logs
│   ├── accounts.json          # Approved accounts
│   └── pending_accounts.json  # Pending approvals
├── server.js                  # Express server
├── package.json               # Dependencies
├── README.md                  # This file
├── AUTH_GUIDE.md             # Authentication documentation
└── QUICKSTART.md             # Quick start guide
```

---

## 🔧 Configuration

### Default Admin Credentials
```
Username: admin
Password: admin123
```
⚠️ **Change these before production deployment!**

### Server Port
Default: `3000`

To change, edit `server.js`:
```javascript
const PORT = 3000; // Change this
```

---

## 🎨 Customization

### Colors
Edit CSS variables in `public/styles.css`:
```css
:root {
    --primary: #4F46E5;
    --secondary: #10B981;
    --danger: #EF4444;
    /* ... */
}
```

### Gym Name
Edit in:
- `public/index.html` - Dashboard header
- `public/login.html` - Login page logo

### QR Code Content
Edit in `public/app.js`:
```javascript
const CHECKIN_QR_TEXT = "GYM_CHECKIN_2024";
const CHECKOUT_QR_TEXT = "GYM_CHECKOUT_2024";
```

---

## 🔒 Security Notes

**Current Implementation (Development)**
- Plain text passwords ❌
- localStorage sessions ❌
- No HTTPS ❌

**For Production (Recommended)**
- ✅ Hash passwords with bcrypt
- ✅ Use JWT tokens
- ✅ Implement HTTPS
- ✅ Add rate limiting
- ✅ Environment variables for secrets
- ✅ Database instead of JSON files

---

## 🗄️ Database Migration

To upgrade from JSON to MongoDB:

1. Install Mongoose:
```bash
npm install mongoose
```

2. Create models for:
   - Members
   - Attendance
   - Accounts

3. Update server.js to use database queries

(Detailed guide in `DATABASE_MIGRATION.md`)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- html5-qrcode library for camera integration
- qrcode.js for QR generation

---

## 📧 Contact

**Project Maintainer**: Your Name
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- Email: your.email@example.com

**Project Link**: [https://github.com/YOUR_USERNAME/fitzone-gym-attendance](https://github.com/YOUR_USERNAME/fitzone-gym-attendance)

---

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

<div align="center">

**Made with ❤️ for fitness enthusiasts**

</div>

## Installation

1. Install Node.js (if not already installed)

2. Install dependencies:
```bash
npm install
```

## Running the Application

Start the server:
```bash
npm start
```

The application will be available at: `http://localhost:3000`

## 🚀 How to Use

### 1. Admin Setup
- Navigate to the "Admin" tab
- You'll see **TWO QR codes**:
  - **Check-In QR Code** (Green) - Place at gym entrance
  - **Check-Out QR Code** (Orange) - Place at gym exit
- Print both QR codes using the print buttons
- Add members by filling in their details

### 2. Member Check-In Process
**Members arrive at the gym:**
1. Scan the **Check-In QR code** (green) at entrance
2. System displays list of all members
3. Member searches for and clicks their name
4. Confirms check-in
5. Attendance recorded! ✅

### 3. Member Check-Out Process
**Members leave the gym:**
1. Scan the **Check-Out QR code** (orange) at exit
2. System displays member list again
3. Member selects their name
4. Confirms check-out
5. Check-out recorded! 👋

### 4. Search Feature
- Use the search box to quickly find members by typing their name
- The list filters in real-time as you type

### 5. View Reports
- Navigate to the "Reports" tab
- See separate counts for check-ins and check-outs
- View all attendance history with action type
- Check individual member statistics

## 🎯 Validation Rules

- ✅ Members can only check in once per day
- ✅ Members must check in before they can check out
- ✅ Members can only check out once per day
- ✅ Physical QR scan required - no remote check-in possible

## 🎨 UI Features

- **Animated Background**: Dynamic floating gradients
- **Smooth Transitions**: Professional animations throughout
- **Icon Integration**: Font Awesome icons for visual clarity
- **Color-Coded Actions**: Green for check-in, Orange for check-out
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Cards**: Beautiful stat cards with hover effects
- **Modal Confirmations**: Elegant confirmation dialogs
- **Real-time Feedback**: Instant visual feedback for all actions

## 🔧 Technology Stack

- **Backend**: Node.js + Express
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **QR Generation**: qrcode.js (dual QR system)
- **QR Scanning**: html5-qrcode
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Poppins)
- **Data Storage**: JSON files (can be upgraded to database)

## File Structure

```
gym-attendance-system/
├── server.js           # Express server with API endpoints
├── package.json        # Dependencies
├── data/              # Data storage (created automatically)
│   ├── members.json   # Member information
│   └── attendance.json # Attendance records
└── public/            # Frontend files
    ├── index.html     # Main HTML structure
    ├── styles.css     # Styling
    └── app.js         # Frontend logic
```

## API Endpoints

- `GET /api/members` - Get all members
- `POST /api/members` - Add new member
- `GET /api/members/:id` - Get specific member
- `POST /api/attendance` - Record attendance
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/:memberId` - Get member attendance history
- `GET /api/attendance/today/all` - Get today's attendance

## 🌟 Future Enhancements

- Database integration (MongoDB, PostgreSQL)
- User authentication and admin roles
- Email/SMS notifications for check-ins
- Member photo uploads
- Session duration tracking (time between check-in and check-out)
- Membership expiration tracking
- Payment integration
- Mobile app version (React Native/Flutter)
- Advanced analytics and insights
- Export reports to PDF/Excel
- Gym capacity tracking (current members inside)
- Personal training session scheduling
- Equipment usage tracking

## Notes

- Camera access is required for QR code scanning
- Works best on HTTPS in production (camera access requirement)
- Data is stored in JSON files - suitable for small gyms
- For production use, consider upgrading to a proper database

## Support

For issues or questions, please check the documentation or contact support.
