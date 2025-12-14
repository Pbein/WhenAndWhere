# Quick Start Guide

## 1. Initialize Convex

Run this command and follow the prompts:

```bash
npx convex dev
```

Choose **"Login or create an account"** and complete the setup.

This will:
- Create a Convex deployment
- Generate `.env.local` with `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`
- Start watching your Convex functions

## 2. Set up Clerk

1. Go to https://dashboard.clerk.com and create an application
2. Add to your `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

3. In Clerk Dashboard → **JWT Templates**:
   - Create a new **Convex** template (this auto-configures everything)

## 3. Run the App

In a separate terminal:

```bash
npm run dev
```

Visit http://localhost:3000

## 4. First Steps

1. Sign up for an account via Clerk
2. Go to Convex Dashboard → Data → users table
3. Find your user and change `role` to `"Admin"`
4. Refresh the app - you now have full access!

## 5. Seed Initial Data

As Admin, create:
- **Missions**: Lion Habitat, Seal Pool, Panda Grove
- **Teams**: 2-3 per mission (Day/Night crews)
- **Shift Definitions**: Day shift (06:00-18:00), Night shift (18:00-06:00)

You're ready to start scheduling! 🎉







