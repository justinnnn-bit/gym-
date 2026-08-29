# 🚀 Deploy FitZone Gym to Supabase + Vercel

## 📋 Overview

- **Frontend Hosting**: Vercel (Fast, free, auto-deploys from GitHub)
- **Backend/Database**: Supabase (PostgreSQL, Auth, Real-time)
- **Total Cost**: FREE for small gyms!

---

## Step 1: Setup Supabase (Database & Auth)

### 1.1 Create Supabase Project

1. Go to: https://supabase.com/
2. Click **"Start your project"**
3. Sign up with GitHub
4. Click **"New Project"**
5. Fill in:
   - **Name**: `fitzone-gym`
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
   - Click **"Create new project"**
6. Wait 2 minutes for setup

### 1.2 Get API Keys

1. In Supabase dashboard, click **Settings** (gear icon)
2. Click **API**
3. Copy these (you'll need them):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`

### 1.3 Create Database Tables

1. Click **SQL Editor** in sidebar
2. Click **"New Query"**
3. Copy and paste the SQL from `supabase-schema.sql` (I'll create this)
4. Click **"Run"**

---

## Step 2: Setup Vercel (Frontend Hosting)

### 2.1 Create Vercel Account

1. Go to: https://vercel.com/
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel

### 2.2 Import Your Repository

1. Click **"Add New"** → **"Project"**
2. Find `justinnnn-bit/gym-`
3. Click **"Import"**

### 2.3 Configure Project

**Framework Preset**: Other

**Root Directory**: `./`

**Build Command**: (leave empty)

**Output Directory**: `public`

**Environment Variables** (click "Add"):
```
VITE_SUPABASE_URL = your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
```

4. Click **"Deploy"**
5. Wait 1 minute
6. Your site is LIVE! 🎉

---

## Step 3: Update Your Code

I'll update your code to use Supabase instead of local JSON files.

Changes needed:
- Replace `server.js` with Supabase client
- Update authentication to use Supabase Auth
- Replace file storage with Supabase database
- Add environment variables

---

## 🎯 What You Get

### ✅ Supabase Features:
- PostgreSQL database (scalable)
- Built-in authentication
- Real-time subscriptions
- Row Level Security (RLS)
- Automatic backups
- API auto-generated

### ✅ Vercel Features:
- Auto-deploy from GitHub (push = deploy)
- Global CDN (fast worldwide)
- HTTPS by default
- Custom domain support
- Preview deployments

---

## 💰 Pricing

### Free Tier Includes:
- **Supabase**: 500MB database, 50,000 monthly active users
- **Vercel**: Unlimited projects, 100GB bandwidth

Perfect for small-medium gyms!

---

## 🔒 Security Improvements

With Supabase:
- ✅ Password hashing (built-in)
- ✅ JWT tokens (automatic)
- ✅ Row Level Security
- ✅ HTTPS everywhere
- ✅ Email verification (optional)

---

## 📊 Your Custom Domain

After deployment:

1. In Vercel dashboard → **Settings** → **Domains**
2. Add your domain (e.g., `fitzonegym.com`)
3. Update DNS records (Vercel shows you how)
4. Done! Your gym site is live on your domain

---

**Ready to start? Tell me and I'll create all the files you need!** 🚀
