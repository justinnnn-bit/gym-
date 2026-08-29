# 🚀 Quick Git Commands Reference

## 📝 First Time Setup (Do Once)

```bash
# Navigate to project
cd "c:\Users\user\OneDrive\Desktop\gym webi"

# Initialize Git
git init

# Configure your identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Add all files
git add .

# First commit
git commit -m "Initial commit: FitZone Gym Attendance System"

# Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/fitzone-gym-attendance.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🔄 Daily Workflow

### When you make changes:

```bash
# 1. Check what changed
git status

# 2. Add all changes
git add .

# 3. Commit with descriptive message
git commit -m "Add feature: member photo upload"

# 4. Push to GitHub
git push
```

---

## 📋 Common Commands

### Check status
```bash
git status
```

### View commit history
```bash
git log --oneline
```

### Create new branch
```bash
git checkout -b feature-name
```

### Switch branch
```bash
git checkout main
```

### Pull latest changes
```bash
git pull
```

### View remote URL
```bash
git remote -v
```

### Undo last commit (keep changes)
```bash
git reset --soft HEAD~1
```

### Discard all local changes
```bash
git reset --hard
```

---

## 🛠️ Fix Common Issues

### Remove file from Git (but keep locally)
```bash
git rm --cached filename
```

### Change last commit message
```bash
git commit --amend -m "New message"
```

### Update remote URL
```bash
git remote set-url origin https://github.com/NEW_USERNAME/repo.git
```

### Force push (use carefully!)
```bash
git push --force
```

---

## 📦 Using the Batch Script

Double-click: `push-to-github.bat`

The script will:
1. ✅ Check Git installation
2. ✅ Show current status
3. ✅ Add all files
4. ✅ Ask for commit message
5. ✅ Commit changes
6. ✅ Push to GitHub

---

## 🆘 Need Help?

- Git Documentation: https://git-scm.com/doc
- GitHub Guide: https://guides.github.com/
- Interactive Tutorial: https://learngitbranching.js.org/

---

## 🎯 Best Practices

✅ **DO:**
- Commit often with clear messages
- Pull before pushing
- Use branches for new features
- Write descriptive commit messages

❌ **DON'T:**
- Commit sensitive data (passwords, API keys)
- Force push to main branch
- Make huge commits with many changes
- Use vague commit messages like "fix" or "update"

---

## 📝 Good Commit Message Examples

```bash
✅ "Add user authentication system"
✅ "Fix QR scanner camera permissions"
✅ "Update dashboard statistics display"
✅ "Improve member search performance"

❌ "updates"
❌ "fix"
❌ "changes"
❌ "asdf"
```

---

**Happy Coding! 🚀**
