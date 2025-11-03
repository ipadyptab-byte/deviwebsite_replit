# Vercel Deployment Instructions

## What Was Fixed

I've updated the Vercel API endpoints to work correctly with your Neon PostgreSQL database:

### Files Updated:
1. **src/api/rates/save.js** - Fixed to fetch directly from BusinessMantra API (not circular reference)
2. **src/api/rates/sync.js** - Fixed to fetch directly from BusinessMantra API (not circular reference)

Both now:
- Fetch directly from: `https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php`
- Store in the `rates` table (not `gold_rates`)
- Use proper upsert logic (update existing or insert new)

## Deployment Steps

### Step 1: Set Environment Variable in Vercel

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project (devi-jewellers)
3. Go to **Settings** → **Environment Variables**
4. Add this variable:

   ```
   Name: DATABASE_URL
   Value: postgresql://neondb_owner:npg_p9MsbmIFeEq6@ep-ancient-sky-adb87hwt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

5. Make sure to select **All Environments** (Production, Preview, Development)
6. Click **Save**

### Step 2: Push Updated Code to GitHub

You need to push the updated files to your GitHub repository:

```bash
git add .
git commit -m "Fix Vercel API endpoints to sync from BusinessMantra directly"
git push origin main
```

Vercel will automatically detect the push and redeploy your application.

### Step 3: Verify Deployment

After deployment completes:

1. **Test the sync endpoint manually:**
   Visit: `https://your-domain.vercel.app/api/rates/save`
   
   You should see: `{"success":true,"message":"Rates saved to database","payload":{...}}`

2. **Check if data is in database:**
   Visit: `https://your-domain.vercel.app/api/rates`
   
   You should see the current rates from your database

3. **Verify live rates endpoint:**
   Visit: `https://your-domain.vercel.app/api/rates/live`
   
   You should see fresh rates fetched from BusinessMantra

## Automatic Sync Schedule

Your Vercel cron jobs (configured in `vercel.json`) will automatically sync data:

- **Every hour** → `/api/rates/save` fetches from BusinessMantra and saves to database
- **Every 30 minutes** → `/api/sync-gold-rates` (if you have DATABASE_LOCAL and DATABASE_REMOTE configured)

## Troubleshooting

If the sync still doesn't work after deployment:

1. **Check Vercel Logs:**
   - Go to your Vercel Dashboard
   - Click on your project → Deployments
   - Click on the latest deployment → View Function Logs

2. **Verify Environment Variable:**
   - Go to Settings → Environment Variables
   - Make sure DATABASE_URL is set for all environments
   - If you just added it, redeploy the project

3. **Manual Trigger:**
   - Try manually visiting: `https://your-domain.vercel.app/api/rates/save`
   - This will trigger the sync immediately and show any error messages

## Current Data in Database

The database currently has the following rates (last synced on Replit):
- 24K Gold (vedhani): ₹121,500
- 22K Gold (ornaments22k): ₹111,780
- 18K Gold (ornaments18k): ₹100,850
- Silver: ₹1,520/kg
