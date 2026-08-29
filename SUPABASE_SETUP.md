# 🎯 Quick Supabase + Vercel Setup

## ⚡ Fast Track (15 minutes)

### Step 1: Supabase Setup (5 min)

1. **Create Project**
   - Go to: https://supabase.com/dashboard
   - Click "New Project"
   - Name: `fitzone-gym`
   - Save the database password!

2. **Run SQL Schema**
   - Click "SQL Editor"
   - Click "New Query"
   - Copy entire contents of `supabase-schema.sql`
   - Paste and click "Run"
   - ✅ Tables created!

3. **Get API Keys**
   - Go to: Settings → API
   - Copy:
     - Project URL
     - anon/public key

### Step 2: Update Code (2 min)

1. **Open `public/supabase-client.js`**
2. **Replace lines 4-5:**
   ```javascript
   const SUPABASE_URL = 'YOUR_ACTUAL_URL_HERE';
   const SUPABASE_ANON_KEY = 'YOUR_ACTUAL_KEY_HERE';
   ```

3. **Add Supabase JS to HTML**
   
   Open `public/index.html` and `public/login.html`
   
   Add BEFORE the closing `</head>` tag:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="supabase-client.js"></script>
   ```

### Step 3: Push to GitHub (1 min)

```bash
git add .
git commit -m "Add Supabase integration"
git push
```

### Step 4: Deploy on Vercel (5 min)

1. **Go to**: https://vercel.com/new
2. **Import** your GitHub repo: `justinnnn-bit/gym-`
3. **Configure**:
   - Framework: Other
   - Root Directory: `./`
   - Build Command: (leave empty)
   - Output Directory: `public`
4. **Add Environment Variables**:
   ```
   VITE_SUPABASE_URL = your-supabase-url
   VITE_SUPABASE_ANON_KEY = your-anon-key
   ```
5. **Click "Deploy"**
6. **Wait 1 minute** ⏱️
7. **✅ Your site is LIVE!**

---

## 🎊 You're Done!

Your gym system is now:
- ✅ Hosted on Vercel (global CDN)
- ✅ Using Supabase database
- ✅ Has built-in authentication
- ✅ Auto-deploys from GitHub
- ✅ Completely FREE!

---

## 📱 Access Your Site

Vercel will give you a URL like:
```
https://gym-xxxxx.vercel.app
```

Share this with your gym members!

---

## 🔐 Default Admin Login

After deployment, create admin in Supabase:

1. Go to Supabase → Authentication → Users
2. Click "Add User"
3. Email: `admin@fitzone.com`
4. Password: `admin123` (change later!)
5. Confirm email manually

Then login with these credentials!

---

## 🚀 Next Steps

1. **Custom Domain**: Add your own domain in Vercel settings
2. **Email Setup**: Configure email templates in Supabase
3. **Backup**: Supabase auto-backs up daily (free tier)
4. **Monitor**: Check Vercel analytics

---

## 💡 Pro Tips

- Every `git push` auto-deploys to Vercel
- Supabase has real-time dashboard for monitoring
- Free tier supports up to 500MB database
- Add custom domain for free

---

**Need help? Check `DEPLOYMENT_GUIDE.md` for detailed steps!**
