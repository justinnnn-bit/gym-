# Email Notification Setup Guide

## Overview
This guide will help you set up automated email notifications for gym members using Resend (free tier: 3,000 emails/month).

## What notifications will be sent:
1. **Welcome Email** - When account is approved
2. **Membership Expiring Soon** - 7 days before expiry
3. **Membership Expired** - When membership expires

---

## Step 1: Sign up for Resend

1. Go to https://resend.com/signup
2. Sign up with your email (free account)
3. Verify your email
4. Go to **API Keys** section
5. Click **Create API Key**
6. Copy the API key (starts with `re_...`)

---

## Step 2: Add Verified Domain (Optional)

For production use:
1. In Resend dashboard, go to **Domains**
2. Add your domain (e.g., `darkknightfitness.com`)
3. Follow DNS verification steps
4. For testing, you can use `onboarding@resend.dev` as sender

---

## Step 3: Set up Supabase Edge Function

### Option A: Using Supabase Edge Functions (Recommended)

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

4. Deploy the email function (I'll create this for you):
```bash
supabase functions deploy send-email
```

5. Set environment secrets:
```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

### Option B: Using Vercel Serverless Functions (Easier)

Since your site is on Vercel, I'll create an API route for you.

---

## Step 4: Database Setup

Run this SQL in Supabase SQL Editor to create notification logs:

```sql
-- Create email_logs table to track sent emails
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES members(id),
    email_type VARCHAR(50) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'sent'
);

-- Create index for faster queries
CREATE INDEX idx_email_logs_member ON email_logs(member_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);
```

---

## Step 5: Schedule Daily Email Checks

You'll need a cron job to check for expiring memberships daily. Options:

1. **Supabase Edge Functions + pg_cron** (Best)
2. **GitHub Actions** (Free, runs daily)
3. **Vercel Cron Jobs** (Pro plan required)

I'll set up GitHub Actions for you (free).

---

## Files I'll Create:

1. `api/send-email.js` - Vercel serverless function to send emails
2. `.github/workflows/daily-email-check.yml` - GitHub Action for daily checks
3. `email-templates/` - HTML email templates
4. Updated `app.js` - To trigger emails on approval/check-in

---

## Environment Variables Needed:

Add these to your Vercel project:
- `RESEND_API_KEY` - Your Resend API key
- `SUPABASE_URL` - Your Supabase URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key
- `FROM_EMAIL` - Sender email (e.g., `noreply@darkknightfitness.com` or `onboarding@resend.dev`)

---

Ready to proceed? I'll create all the necessary files!
