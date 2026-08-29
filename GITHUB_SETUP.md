# 🚀 Push to GitHub Guide

## Step 1: Install Git (if not already installed)

Download and install Git from: https://git-scm.com/downloads

After installation, verify by opening PowerShell/CMD:
```bash
git --version
```

## Step 2: Configure Git (First Time Only)

Set your name and email:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Initialize Git Repository

Open PowerShell/Terminal in your project folder:
```bash
cd "c:\Users\user\OneDrive\Desktop\gym webi"
```

Initialize git:
```bash
git init
```

## Step 4: Add All Files

Add all files to staging:
```bash
git add .
```

Check what will be committed:
```bash
git status
```

## Step 5: Create First Commit

```bash
git commit -m "Initial commit: FitZone Gym Attendance System"
```

## Step 6: Create GitHub Repository

1. Go to https://github.com/
2. Click the **"+"** icon (top right)
3. Select **"New repository"**
4. Fill in:
   - **Repository name**: `fitzone-gym-attendance`
   - **Description**: "Modern gym attendance tracking system with QR code scanning"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README (we already have files)
5. Click **"Create repository"**

## Step 7: Connect Local to GitHub

GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/fitzone-gym-attendance.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username!

## Step 8: Push Your Code

```bash
git push -u origin main
```

Enter your GitHub credentials if asked.

## 🎉 Done! Your code is now on GitHub!

---

## 📝 Making Changes Later

When you make changes:

```bash
# 1. Check what changed
git status

# 2. Add changed files
git add .

# 3. Commit with message
git commit -m "Description of changes"

# 4. Push to GitHub
git push
```

---

## 🔒 Important: Secure Your Data

Before pushing, make sure sensitive files are in `.gitignore`:
- ✅ `node_modules/` (already ignored)
- ✅ `data/` (already ignored)
- ✅ `.env` files (if you add any)

---

## 🆘 Common Issues

### "git is not recognized"
- Git not installed or not in PATH
- Restart terminal after installing Git

### "Permission denied"
- Use HTTPS instead of SSH
- Or set up SSH keys: https://docs.github.com/en/authentication

### "Failed to push"
- Check internet connection
- Verify repository URL: `git remote -v`
- Try: `git pull origin main` then `git push`

---

## 📦 Alternative: GitHub Desktop (Easier)

Don't like command line? Use GitHub Desktop:

1. Download: https://desktop.github.com/
2. Install and sign in
3. Click "Add" → "Add Existing Repository"
4. Select your project folder
5. Click "Publish repository"
6. Done! ✅

---

## 🌟 Bonus: Add README Badge

After pushing, add this to your README.md:

```markdown
![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/fitzone-gym-attendance)
![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/fitzone-gym-attendance)
![License](https://img.shields.io/badge/license-MIT-blue)
```

---

**Need help?** Check: https://docs.github.com/en/get-started
