# 🚀 Quick Start Guide

## Installation (One-Time Setup)

### 1. Install Node.js
Download and install from: https://nodejs.org/ (Choose LTS version)

### 2. Install Dependencies
Open terminal/command prompt in the project folder and run:
```bash
cd "c:\Users\user\OneDrive\Desktop\gym webi"
npm install
```

### 3. Start the Server
```bash
npm start
```

### 4. Open Browser
Go to: http://localhost:3000

---

## 📋 First Time Setup Checklist

### Admin Setup (Do this first!)

1. **Go to Admin Tab**
   - Click the "Admin" button in the navigation

2. **Print QR Codes**
   - You'll see TWO QR codes:
     - 🟢 **Green Check-In QR** - for entrance
     - 🟠 **Orange Check-Out QR** - for exit
   - Click print buttons for each
   - Laminate and post at gym entrance/exit

3. **Add Your First Members**
   - Fill in the form:
     - Full Name
     - Email
     - Phone
     - Membership Type (Basic/Premium/VIP)
   - Click "Add Member"
   - Repeat for all your gym members

---

## 👥 Daily Usage

### For Members - Check-In

1. **Arrive at gym**
2. **Scan GREEN QR code** at entrance with phone camera
3. **Find your name** in the list (or search)
4. **Click your name**
5. **Confirm** ✅
6. Done! Start your workout! 💪

### For Members - Check-Out

1. **Leaving gym**
2. **Scan ORANGE QR code** at exit
3. **Find your name** in the list
4. **Click your name**
5. **Confirm** 👋
6. See you next time!

### For Admin - View Reports

1. **Go to Reports Tab**
2. See:
   - Today's check-ins
   - Today's check-outs
   - Total members
   - Complete attendance history

---

## 💡 Pro Tips

✅ **Search Feature**: Type name instead of scrolling
✅ **Member Stats**: Click "View Stats" on any member to see their history
✅ **Print QR Codes**: Laminate them for durability
✅ **Tablet at Entrance**: Keep a tablet with the scanner page open for easy access
✅ **Weekly Reports**: Check reports tab weekly to track gym usage trends

---

## 🆘 Troubleshooting

### Camera Not Working
- Allow camera permissions in browser
- Try HTTPS instead of HTTP (required by some browsers)
- Check if another app is using the camera

### QR Code Not Scanning
- Ensure good lighting
- Hold phone steady and close to QR code
- Make sure you're scanning the correct QR (green for check-in, orange for check-out)

### Member Can't Check Out
- They need to check in first before checking out
- They might have already checked out today

### Server Won't Start
- Make sure Node.js is installed
- Run `npm install` first
- Check if port 3000 is available

---

## 📞 Need Help?

Check the main README.md file for detailed documentation.

Happy Tracking! 💪🏋️‍♂️
