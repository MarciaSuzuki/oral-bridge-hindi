# Hindi Bible TTS Pipeline - Setup Guide

This guide walks you through deploying the app. No coding required.  
Estimated time: 25-35 minutes.

---

## Overview

You will:
1. Create a Supabase account (free) — handles user logins
2. Get your Anthropic API key — powers the AI agents
3. Create a Vercel account (free) — hosts your app
4. Upload these files to GitHub
5. Connect Vercel to GitHub
6. Add your secret keys to Vercel

After setup, your app will be live at a URL like `hindi-tts.vercel.app`.

---

## Step 1: Create a Supabase Project

Supabase manages user accounts. It's free for small projects.

### 1.1 Sign up
- Go to [supabase.com](https://supabase.com)
- Click **Start your project**
- Sign up with your GitHub account (easiest) or email

### 1.2 Create a new project
- Click **New Project**
- Fill in:
  - **Name:** `hindi-tts` (or any name you like)
  - **Database Password:** Create a strong password (save it somewhere safe)
  - **Region:** Choose one close to your team
- Click **Create new project**
- Wait 2-3 minutes while it sets up

### 1.3 Get your API keys
- Once ready, go to **Settings** (gear icon in left sidebar)
- Click **API** in the submenu
- You'll see a section called **Project URL** and **Project API keys**
- Copy these two values and save them in a text file:

```
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

Keep this file open. You'll need these values in Step 5.

---

## Step 2: Get Your Anthropic API Key

The pipeline uses Claude to power the 5 translation agents.

### 2.1 Go to Anthropic Console
- Go to [console.anthropic.com](https://console.anthropic.com)
- Sign in or create an account

### 2.2 Create an API Key
- Click **API Keys** in the left sidebar
- Click **Create Key**
- Give it a name like "Hindi TTS Pipeline"
- Copy the key immediately (it won't be shown again)
- Add it to your text file:

```
ANTHROPIC_API_KEY = sk-ant-xxxxx
```

**Note:** This key is billed based on usage. Each full pipeline run costs roughly $0.05-0.15 depending on passage length.

---

## Step 3: Upload Files to GitHub

### 3.1 Create a new repository
- Go to [github.com](https://github.com)
- Click the **+** button (top right) → **New repository**
- Fill in:
  - **Repository name:** `hindi-tts-pipeline`
  - **Description:** (optional) "Hindi Bible TTS preparation tool"
  - **Public** or **Private:** Your choice (Private recommended)
- Click **Create repository**

### 3.2 Upload the project files
- On your new repository page, click **uploading an existing file**
- Drag and drop ALL the files and folders from this project:
  - `api/` folder
  - `src/` folder
  - `index.html`
  - `package.json`
  - `vercel.json`
  - `vite.config.js`
  - `.gitignore`
- Scroll down and click **Commit changes**

**Important:** Make sure the folder structure is preserved. You should see `api/`, `src/`, etc. at the root level of your repository.

---

## Step 4: Connect Vercel to GitHub

Vercel will automatically build and host your app.

### 4.1 Sign up for Vercel
- Go to [vercel.com](https://vercel.com)
- Click **Sign Up**
- Choose **Continue with GitHub**
- Authorize Vercel to access your GitHub

### 4.2 Import your repository
- On the Vercel dashboard, click **Add New** → **Project**
- You'll see a list of your GitHub repositories
- Find `hindi-tts-pipeline` and click **Import**

### 4.3 Configure the project
- Vercel will auto-detect the settings. Verify:
  - **Framework Preset:** Vite
  - **Root Directory:** `./` (leave as is)
- **Don't click Deploy yet!** First, add environment variables.

---

## Step 5: Add Environment Variables

This is where you paste all the keys you collected earlier.

### 5.1 Open Environment Variables section
- On the same page (before deploying), find **Environment Variables**
- Click to expand it

### 5.2 Add all four variables
Add each of these one at a time:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Your Supabase URL (starts with `https://`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key (starts with `eyJ`) |
| `ANTHROPIC_API_KEY` | Your Anthropic key (starts with `sk-ant-`) |

Click **Add** after each one.

### 5.3 Deploy
- Click **Deploy**
- Wait 1-2 minutes while Vercel builds your app
- When finished, you'll see **Congratulations!** and a preview of your app

---

## Step 6: Test Your App

### 6.1 Open your app
- Click the preview image or the URL shown (like `hindi-tts-pipeline.vercel.app`)
- You should see the login page

### 6.2 Create your first account
- Click **Sign up**
- Enter your email and a password (6+ characters)
- Click **Create Account**
- Check your email for a confirmation link
- Click the link to verify your account

### 6.3 Sign in and test the pipeline
- Go back to your app
- Enter your email and password
- Click **Sign In**
- You should see the Dashboard with the pipeline interface
- Try entering a passage like "John 1:1-3" and click **Start Pipeline**

---

## Troubleshooting

### "Missing Supabase environment variables" error
- Go to Vercel → Your project → **Settings** → **Environment Variables**
- Check that both variables are spelled exactly:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- After fixing, go to **Deployments** → click the three dots → **Redeploy**

### "ANTHROPIC_API_KEY not configured" error
- Go to Vercel → Your project → **Settings** → **Environment Variables**
- Add `ANTHROPIC_API_KEY` with your Anthropic API key
- Redeploy the project

### "Invalid login credentials" error
- Make sure you confirmed your email (check spam folder)
- Try the "Sign up" flow again if needed

### Page shows "Loading..." forever
- Check browser console for errors (press F12)
- Verify environment variables are set in Vercel
- Redeploy the project

### Confirmation email never arrives
- Check your spam folder
- In Supabase: **Authentication** → **Email Templates** → make sure emails are enabled
- You can also disable email confirmation temporarily:  
  Supabase → **Authentication** → **Providers** → **Email** → turn off "Confirm email"

---

## How the Pipeline Works

| Agent | What It Does |
|-------|--------------|
| **1. Exegesis** | Analyzes the source text structure, terms, and cultural context |
| **2. Translator** | Produces natural spoken Hindi with the Subtraction Rule |
| **3. Style Review** | Checks oral naturalness and boundary compliance |
| **4. Theology** | Verifies meaning is preserved, no content added |
| **5. TTS Prep** | Formats for ElevenLabs with segments and timestamps |

Each agent's output feeds into the next. You can run them one at a time or all at once.

---

## Quick Reference

| Service | URL | What it does |
|---------|-----|--------------|
| Supabase | supabase.com | User accounts |
| Anthropic | console.anthropic.com | AI agents (Claude) |
| Vercel | vercel.com | Hosts your app |
| GitHub | github.com | Stores your code |

| Environment Variable | Where to find it |
|---------------------|------------------|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
| `ANTHROPIC_API_KEY` | Anthropic Console → API Keys |
