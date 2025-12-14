# Zoo Scheduler Setup Guide

## Prerequisites
- Node.js 18+ installed
- Convex account (sign up at https://convex.dev)
- Clerk account (sign up at https://clerk.com)

## Step 1: Convex Setup

1. Run `npx convex dev` in the project directory
2. Choose "Login or create an account" and follow the prompts
3. This will create a `.env.local` file with `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`

## Step 2: Clerk Setup

1. Create a new Clerk application at https://dashboard.clerk.com
2. Add these environment variables to `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

3. In Clerk Dashboard → JWT Templates:
   - Create a new "Convex" template
   - Add custom claims for user role

4. In Clerk Dashboard → Webhooks:
   - Add webhook endpoint: `https://YOUR_CONVEX_SITE_URL/clerk`
   - Subscribe to `user.created` and `user.updated` events

## Step 3: Seed Initial Data

After Convex is running, you can add initial data:

1. Go to Convex Dashboard
2. Navigate to Data tab
3. Manually create:
   - First admin user (link to your Clerk ID)
   - Initial missions (Lion, Seal, Panda)
   - Teams for each mission
   - Shift definitions (Day 06:00-18:00, Night 18:00-06:00)

## Step 4: Run the App

```bash
npm run dev
```

Visit http://localhost:3000 and sign in with Clerk!







