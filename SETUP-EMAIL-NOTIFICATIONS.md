# 📧 Email Notifications Setup Guide

## Quick Start (5 minutes)

### Step 1: Sign up for Resend (Free)

1. Go to https://resend.com/signup
2. Create a free account (3,000 emails/month free)
3. Verify your email
4. Go to **API Keys** → **Create API Key**
5. Copy the API key (starts with `re_...`)

### Step 2: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:

```
RESEND_API_KEY = your_resend_api_key_here
FROM_EMAIL = onboarding@resend.dev
SITE_URL = https://darkknightfitness.vercel.app
```

> **Note:** Use `onboarding@resend.dev` for testing. For production, add and verify your custom domain in Resend.

### Step 3: Add GitHub Secrets (for daily automated emails)

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

```
SUPABASE_URL = your_supabase_url_here
SUPABASE_ANON_KEY = your_supabase_anon_key_here
VERCEL_API_URL = https://darkknightfitness.vercel.app
```

### Step 4: Install Dependencies

Run this command in your project:

```bash
npm install resend
```

### Step 5: Deploy to Vercel

```bash
git add .
git commit -m "Add email notification system"
git push origin main
```

Vercel will auto-deploy with the new API route.

---

## ✅ What Emails Will Be Sent

### 1. **Welcome Email** (Instant)
- Triggered when admin approves account request
- Contains login link and membership details

### 2. **Membership Expiring Soon** (Daily at 9 AM UTC)
- Sent 7 days before expiry
- Automated via GitHub Actions

### 3. **Membership Expired** (Daily at 9 AM UTC)
- Sent when membership expires
- Member account automatically marked as inactive

---

## 🧪 Testing

### Test Manual Trigger (GitHub Actions):

1. Go to your GitHub repo
2. Click **Actions** tab
3. Select **Daily Email Notifications**
4. Click **Run workflow** → **Run workflow**
5. Check your email inbox (members with expiring memberships will receive emails)

### Test Welcome Email:

1. Register a new account via the public website
2. Go to admin dashboard → Account Requests
3. Approve the account
4. Check the registered email inbox for welcome email

---

## 📁 Files Created

```
api/send-email.js                              # Vercel API route for sending emails
public/email-helper.js                         # Frontend helper functions
.github/workflows/daily-email-check.yml        # GitHub Action config
.github/workflows/check-expiring-memberships.js # Cron job script
```

---

## 🎨 Customizing Email Templates

Edit `api/send-email.js` → `generateEmailTemplate()` function to customize:
- Email design/colors
- Text content
- Button links
- Company branding

---

## 📊 Email Logs (Optional)

To track sent emails, run this SQL in Supabase:

```sql
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES members(id),
    email_type VARCHAR(50) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'sent'
);
```

---

## 🚀 Production Tips

1. **Add Custom Domain** (Resend)
   - Go to Resend → Domains
   - Add your domain (e.g., `darkknightfitness.com`)
   - Update DNS records
   - Change `FROM_EMAIL` to `noreply@yourdomain.com`

2. **Monitor Email Delivery**
   - Check Resend dashboard for delivery stats
   - Monitor bounce rates
   - Check spam complaints

3. **Adjust Cron Schedule**
   - Edit `.github/workflows/daily-email-check.yml`
   - Change `cron: '0 9 * * *'` to your preferred time
   - Use https://crontab.guru/ to generate cron expressions

---

## 🔧 Troubleshooting

**Problem:** Emails not sending
- Check Vercel logs: `vercel logs`
- Verify `RESEND_API_KEY` is set correctly
- Check Resend dashboard for errors

**Problem:** GitHub Action not running
- Check Actions tab for errors
- Verify secrets are set correctly
- Make sure workflow file is in `.github/workflows/`

**Problem:** Wrong sender email
- Update `FROM_EMAIL` environment variable in Vercel
- Verify domain in Resend if using custom domain

---

## 📞 Support

- Resend Docs: https://resend.com/docs
- Resend Support: support@resend.com
- GitHub Actions Docs: https://docs.github.com/en/actions

---

**All set! Your gym members will now receive beautiful email notifications! 🎉**
