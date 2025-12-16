# Clerk + Convex Setup Guide

This guide covers JWT authentication and webhook setup for syncing Clerk users to Convex.

---

## Part 1: JWT Authentication Setup

### Issue
Your Clerk instance is not configured to issue JWT tokens for Convex, which is causing 404 errors when trying to authenticate with Convex.

### Steps to Fix

#### 1. Configure Clerk to Issue Convex Tokens

1. Go to your Clerk Dashboard: https://dashboard.clerk.com/
2. Select your application: `trusted-glowworm-49`
3. Navigate to **JWT Templates** in the left sidebar (under "Configure")
4. Click **+ New Template**
5. Select **Convex** from the template list
6. Click **Apply Changes** or **Create**

#### 2. Get Your Convex Issuer Domain

After creating the JWT template, you'll see an issuer domain like:
```
https://trusted-glowworm-49.clerk.accounts.dev
```

#### 3. Configure Convex to Accept Clerk Tokens

1. Go to your Convex Dashboard: https://dashboard.convex.dev/
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following environment variables (if not already present):
   - `CLERK_HOSTNAME`: `trusted-glowworm-49.clerk.accounts.dev` (without https://)

#### 4. Update Your convex/auth.config.ts (if needed)

If you have a custom auth config in Convex, ensure it's set up for Clerk. If not, Convex should auto-detect it.

#### 5. Verify Environment Variables

Make sure your `.env.local` file has:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
```

---

## Part 2: Webhook Setup (User Sync)

Webhooks automatically sync Clerk users to your Convex database when they sign up, update their profile, or are deleted.

### 1. Get Your Convex HTTP Endpoint URL

1. Go to your Convex Dashboard: https://dashboard.convex.dev/
2. Select your project
3. Find your deployment URL (looks like `https://your-project-123.convex.cloud`)
4. Your webhook endpoint will be: `https://your-project-123.convex.site/clerk-webhook`

> **Note:** The HTTP endpoint uses `.convex.site` (not `.convex.cloud`)

### 2. Create Webhook in Clerk Dashboard

1. Go to your Clerk Dashboard: https://dashboard.clerk.com/
2. Navigate to **Webhooks** in the left sidebar
3. Click **+ Add Endpoint**
4. Configure the endpoint:
   - **Endpoint URL**: `https://your-project-123.convex.site/clerk-webhook`
   - **Message Filtering**: Select these events:
     - `user.created`
     - `user.updated`
     - `user.deleted` (optional)
5. Click **Create**
6. **Copy the Signing Secret** (starts with `whsec_...`)

### 3. Add Webhook Secret to Convex

1. Go to your Convex Dashboard: https://dashboard.convex.dev/
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `CLERK_WEBHOOK_SECRET`
   - **Value**: `whsec_...` (the signing secret from step 2)
5. Click **Save**

### 4. Deploy Convex

After adding the environment variable, redeploy your Convex functions:
```bash
npx convex deploy
```

### 5. Test the Webhook

1. In Clerk Dashboard → Webhooks, click on your endpoint
2. Go to the **Testing** tab
3. Select `user.created` event type
4. Click **Send Example**
5. Check if it shows a successful response (200 OK)

---

## Part 3: Fallback User Sync

In addition to webhooks, this app includes a fallback mechanism:

- **`UserSync` component**: Automatically syncs authenticated users to Convex if they're not in the database
- **`ensureCurrentUser` mutation**: Called when a user is authenticated via Clerk but missing from Convex

This handles edge cases like:
- Development environments without webhook access
- Webhook delivery failures
- Users who signed up before webhooks were configured

---

## Additional Notes

### Cookie Security Warning
The "suffixed cookie" warning appears when running on `http://10.0.0.117:3000/` instead of `localhost`. This is normal in development and won't affect functionality. In production (with HTTPS), this warning will disappear.

### Development vs Production
Remember that Clerk development keys have strict usage limits. Before deploying to production:
1. Upgrade to production keys in Clerk Dashboard
2. Update your environment variables
3. Redeploy your application

### Webhook Debugging

If webhooks aren't working:
1. Check the Clerk Dashboard → Webhooks → your endpoint → **Logs** tab
2. Check Convex Dashboard → **Logs** for any errors
3. Verify the `CLERK_WEBHOOK_SECRET` is correctly set in Convex environment variables
4. Ensure your Convex deployment is up to date (`npx convex deploy`)

---

## Testing Checklist

After completing setup:
- [ ] Clear your browser cookies/storage for the site
- [ ] Visit your application
- [ ] Sign up as a new user
- [ ] Check Convex Dashboard → Data → `users` table to confirm user was created
- [ ] Sign in and verify you can access `/dashboard`
- [ ] Check the console - there should be no 404 or authentication errors










