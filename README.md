# WhenAndWhere - Zoo Scheduler

A role-based scheduling application for zoo operations built with Next.js, Convex, and Clerk.

## Features

- **Role-based Access Control (RBAC)**: BasicUser, TeamLead, OperationsLead, and Admin roles
- **Mission Management**: Manage multiple zoo habitats (Lion, Seal, Panda, etc.)
- **Team Organization**: Create and manage day/night crews per mission
- **Schedule Generation**: Panama 2-2-3 rotation patterns and custom templates
- **Shift Assignment**: Assign PRIMARY and BACKUP crew to shifts
- **PTO Management**: Request, approve, and track time off
- **Real-time Updates**: Powered by Convex for live data synchronization
- **Role-Based Dashboards**: Customized views for BasicUser, TeamLead, and OpsLead
- **Modern UI**: Clean, responsive interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Backend**: Convex (database, queries, mutations, real-time)
- **Authentication**: Clerk (with role-based JWT claims)
- **Deployment Ready**: Easy to deploy on Vercel + Convex

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Convex

```bash
npx convex dev
```

Choose "Login or create an account" and follow the prompts. This creates `.env.local` with your Convex credentials.

### 3. Set up Clerk

1. Create a Clerk application at https://dashboard.clerk.com
2. Add to your `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

3. In Clerk Dashboard → **JWT Templates** → Create a new **Convex** template

### 4. Run the App

In two separate terminals:

```bash
# Terminal 1: Convex dev server
npx convex dev

# Terminal 2: Next.js dev server
npm run dev
```

Open http://localhost:3000

### 5. First-Time Setup

1. Sign up for an account
2. Go to Convex Dashboard → Data → `users` table
3. Change your `role` to `"Admin"`
4. Create initial missions, teams, and shift definitions

## Project Structure

```
whenandwhere/
├── app/                      # Next.js App Router
│   ├── (app)/               # Protected app pages
│   │   ├── dashboard/       # Role-based dashboards
│   │   ├── missions/        # Mission management
│   │   ├── teams/           # Team management
│   │   ├── crew/            # Crew listing & details
│   │   ├── schedules/       # Schedule view & generation
│   │   ├── templates/       # Template management
│   │   ├── pto/             # PTO requests
│   │   └── admin/           # Admin pages (users, qualifications)
│   ├── sign-in/             # Clerk sign-in
│   └── sign-up/             # Clerk sign-up
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── nav/                 # Sidebar, Topbar
│   ├── schedule/            # Calendar and scheduling components
│   ├── missions/            # Mission management components
│   ├── crew/                # Team and employee components
│   ├── templates/           # Template pattern building
│   ├── qualifications/      # Qualification management
│   └── dashboard/           # Dashboard components
├── convex/                   # Convex backend
│   ├── schema.ts            # Database schema
│   ├── rbac.ts              # Role-based helpers
│   ├── helpers/             # Shared backend utilities
│   └── *.ts                 # Queries and mutations
├── Docs/                     # Documentation
│   ├── Setup/               # Setup guides
│   ├── Epics/               # Development roadmap
│   ├── Build Doc.md         # Core concepts
│   └── Todo.md              # Project status
└── lib/                      # Shared utilities
```

## User Roles

| Role | Capabilities |
|------|-------------|
| **BasicUser** | View own schedule, request PTO, read-only mission views |
| **TeamLead** | Manage schedules, generate from templates, assign crew, approve team PTO |
| **OperationsLead** | Cross-mission oversight, approve schedules, global PTO approval |
| **Admin** | Full system access, manage users, missions, teams, templates |

## Documentation

| Document | Description |
|----------|-------------|
| [New Machine Setup](Docs/Setup/NEW_MACHINE_SETUP.md) | Complete setup guide for new development machines |
| [Clerk + Convex Integration](Docs/Setup/CLERK_CONVEX_INTEGRATION.md) | Detailed auth configuration |
| [Build Doc](Docs/Build%20Doc.md) | Core concepts, data model, and workflows |
| [Roadmap](Docs/Epics/ROADMAP.md) | Development progress and epic tracking |
| [Todo](Docs/Todo.md) | Current project status |

## Development

### Commands

```bash
npm run dev      # Start Next.js dev server
npm run build    # Build for production
npm run lint     # Run ESLint
npx convex dev   # Start Convex dev server (keep running)
npx convex deploy # Deploy Convex to production
```

### Key Files

- `convex/schema.ts` - Database schema definition
- `convex/rbac.ts` - Role-based access control helpers
- `middleware.ts` - Clerk route protection
- `app/ConvexClientProvider.tsx` - Convex + Clerk integration

## Deployment

### Vercel + Convex

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables from `.env.local`
4. Deploy!

Convex automatically handles database hosting, real-time subscriptions, and serverless functions.

## Current Status

- ✅ **E01-E08**: Foundation, APIs, UI, Schedule, Mission, Team, Template, Dashboard - Complete
- 🔲 **E09**: Advanced Workflows (PTO conflicts, call-outs, approvals) - Ready

See [Roadmap](Docs/Epics/ROADMAP.md) for detailed progress.

## License

Private - All rights reserved
