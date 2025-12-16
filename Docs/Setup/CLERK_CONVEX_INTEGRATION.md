# Clerk + Convex Integration Guide

This guide covers the detailed JWT authentication and webhook setup for syncing Clerk users to Convex.

---

## Overview

WhenAndWhere uses:
- **Clerk** for authentication (sign-in, sign-up, session management)
- **Convex** for backend (database, real-time queries, mutations)

These two services communicate via JWT tokens. Clerk issues tokens that Convex validates.

---

## Part 1: JWT Authentication Setup

### How It Works

1. User signs in via Clerk
2. Clerk issues a JWT token with the "convex" audience
3. Your app sends this token to Convex with each request
4. Convex validates the token against Clerk's public keys

### Configuration Steps

#### 1. Create Clerk JWT Template

1. Go to Clerk Dashboard: https://dashboard.clerk.com/
2. Select your application
3. Navigate to **JWT Templates** (under Configure)
4. Click **+ New Template**
5. Select **Convex** from the template list
6. Click **Apply Changes** or **Create**

After creating the template, note the issuer domain:
```
https://your-app-name.clerk.accounts.dev
```

#### 2. Configure Convex Auth

Update `convex/auth.config.ts` with your Clerk domain:

```typescript
export default {
  providers: [
    {
      domain: "https://your-app-name.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
```

#### 3. Set Convex Environment Variables

In Convex Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `CLERK_HOSTNAME` | `your-app-name.clerk.accounts.dev` (without https://) |

---

## Part 2: Webhook Setup (User Sync)

Webhooks automatically sync Clerk users to your Convex database when they sign up, update their profile, or are deleted.

### Why Webhooks?

Without webhooks, user data only syncs when they actively use the app. Webhooks ensure:
- User records are created immediately on sign-up
- Profile updates sync automatically
- Admin can see users even before their first login

### Setup Steps

#### 1. Find Your Convex HTTP Endpoint

Your webhook endpoint is:
```
https://YOUR-PROJECT.convex.site/clerk-webhook
```

> **Important:** Use `.convex.site` (NOT `.convex.cloud`)

Find your project name in the Convex Dashboard URL or deployment settings.

#### 2. Create Webhook in Clerk

1. Go to Clerk Dashboard → **Webhooks**
2. Click **+ Add Endpoint**
3. Configure:
   - **Endpoint URL**: `https://your-project.convex.site/clerk-webhook`
   - **Message Filtering**: Select these events:
     - `user.created`
     - `user.updated`
     - `user.deleted` (optional)
4. Click **Create**
5. **Copy the Signing Secret** (starts with `whsec_...`)

#### 3. Add Webhook Secret to Convex

1. Go to Convex Dashboard → Settings → Environment Variables
2. Add a new variable:
   - **Name**: `CLERK_WEBHOOK_SECRET`
   - **Value**: `whsec_...` (the signing secret from Clerk)
3. Click **Save**

#### 4. Redeploy Convex

```bash
npx convex deploy
```

#### 5. Test the Webhook

1. In Clerk Dashboard → Webhooks → your endpoint
2. Go to the **Testing** tab
3. Select `user.created` event type
4. Click **Send Example**
5. Check for successful response (200 OK)

---

## Part 3: Fallback User Sync

This app includes a fallback mechanism for when webhooks aren't available or fail:

### UserSync Component

Located at `components/user-sync.tsx`, this component:
- Runs when an authenticated user loads the app
- Checks if the user exists in Convex
- Creates the user record if missing

### ensureCurrentUser Mutation

Located in `convex/users.ts`, this mutation:
- Takes the authenticated user's Clerk ID
- Creates or updates their Convex user record
- Returns the user data

### When Fallback Activates

- Development environments without webhook access
- Webhook delivery failures
- Users who signed up before webhooks were configured
- Network issues between Clerk and Convex

---

## Troubleshooting

### "404 on authentication" Errors

**Cause:** Clerk JWT Template not configured

**Fix:**
1. Ensure JWT Template exists in Clerk Dashboard
2. Verify `convex/auth.config.ts` has correct domain
3. Redeploy: `npx convex deploy`

### Users Not Appearing in Database

**Cause:** Webhook not configured or failing

**Fix:**
1. Check Clerk Dashboard → Webhooks → Logs tab
2. Verify `CLERK_WEBHOOK_SECRET` is set in Convex
3. Ensure endpoint URL uses `.convex.site`
4. The fallback sync will handle it when users sign in

### "Invalid signature" Webhook Errors

**Cause:** Webhook secret mismatch

**Fix:**
1. Copy the signing secret again from Clerk
2. Update `CLERK_WEBHOOK_SECRET` in Convex
3. Redeploy: `npx convex deploy`

### Cookie Security Warnings

**Cause:** Running on non-localhost IP (e.g., `10.0.0.x:3000`)

**Status:** Normal in development, no action needed. Resolves in production with HTTPS.

---

## Architecture Reference

### How Requests Flow

```
User Browser
    │
    ├── Sign In ──► Clerk (authenticates)
    │                  │
    │                  ├── Issues JWT token
    │                  │
    │                  └── Webhook ──► Convex (creates user record)
    │
    └── App Request ──► Next.js
                          │
                          └── Convex Query/Mutation
                                (validates JWT, processes request)
```

### Files Involved

| File | Purpose |
|------|---------|
| `convex/auth.config.ts` | Tells Convex to trust Clerk JWTs |
| `convex/http.ts` | Handles webhook POST requests |
| `convex/users.ts` | User mutations including `upsertFromClerk` |
| `components/user-sync.tsx` | Fallback sync component |
| `app/ConvexClientProvider.tsx` | Provides Convex client with Clerk auth |
| `middleware.ts` | Clerk route protection |

---

## Production Checklist

Before deploying to production:

- [ ] Upgrade to Clerk production keys
- [ ] Update environment variables in:
  - [ ] Vercel (or your host)
  - [ ] Convex production deployment
- [ ] Verify webhook endpoint is accessible
- [ ] Test user sign-up flow end-to-end
- [ ] Verify JWT authentication works
- [ ] Check Convex logs for any auth errors

