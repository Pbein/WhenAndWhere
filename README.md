# Zoo Scheduler

A role-based scheduling application for zoo operations built with Next.js, Convex, and Clerk.

## Features

- **Role-based Access Control (RBAC)**: BasicUser, TeamLead, OperationsLead, and Admin roles
- **Mission Management**: Manage multiple zoo habitats (Lion, Seal, Panda, etc.)
- **Team Organization**: Create and manage day/night crews per mission
- **Schedule Generation**: Panama 2-2-3 rotation patterns and custom templates
- **Shift Assignment**: Assign PRIMARY and BACKUP crew to shifts
- **PTO Management**: Request, approve, and track time off
- **Real-time Updates**: Powered by Convex for live data synchronization
- **Modern UI**: Clean, responsive interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Convex (database, queries, mutations, real-time)
- **Authentication**: Clerk (with role-based JWT claims)
- **Deployment Ready**: Easy to deploy on Vercel + Convex

## Project Structure

```
whenandwhere/
├── app/                      # Next.js App Router
│   ├── (app)/               # Protected app pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── missions/        # Mission management
│   │   ├── teams/           # Team management
│   │   ├── crew/            # Crew listing
│   │   ├── schedules/       # Schedule view & generation
│   │   ├── templates/       # Template management
│   │   ├── pto/             # PTO requests
│   │   └── admin/users/     # User management (Admin only)
│   ├── sign-in/             # Clerk sign-in
│   ├── sign-up/             # Clerk sign-up
│   └── ConvexClientProvider.tsx
├── convex/                   # Convex backend
│   ├── schema.ts            # Database schema
│   ├── rbac.ts              # Role-based helpers
│   ├── missions.ts          # Mission queries/mutations
│   ├── teams.ts             # Team queries/mutations
│   ├── users.ts             # User queries/mutations
│   ├── templates.ts         # Template queries/mutations
│   ├── shiftDefinitions.ts  # Shift definition queries/mutations
│   ├── schedules.ts         # Schedule generation & assignment
│   └── pto.ts               # PTO queries/mutations
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── nav/                 # Sidebar, Topbar
└── middleware.ts            # Clerk route protection

```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Convex

1. Run Convex initialization:
   ```bash
   npx convex dev
   ```
2. Choose "Login or create an account" and follow the prompts
3. This creates a Convex deployment and adds `.env.local` with:
   - `CONVEX_DEPLOYMENT`
   - `NEXT_PUBLIC_CONVEX_URL`

### 3. Set up Clerk

1. Create a Clerk application at https://dashboard.clerk.com
2. Add these to `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

3. Configure Clerk for Convex:
   - In Clerk Dashboard → **JWT Templates**
   - Create a new **Convex** template
   - This automatically configures the JWT for Convex integration

4. Set up user sync webhook (optional but recommended):
   - In Clerk Dashboard → **Webhooks**
   - Add endpoint: `https://YOUR_CONVEX_SITE_URL/clerk`
   - Subscribe to: `user.created`, `user.updated`

### 4. Seed Initial Data

After signing up your first user:

1. Go to Convex Dashboard → Data
2. Find your user in the `users` table
3. Update their `role` to `"Admin"`
4. Create initial data:
   - **Missions**: Lion Habitat, Seal Pool, Panda Grove
   - **Teams**: Create 2-3 teams per mission (Day crew, Night crew)
   - **Shift Definitions**: Day (06:00-18:00), Night (18:00-06:00)
   - **Templates**: Panama 2-2-3 pattern (12h shifts, 28-day cycle)

Example template pattern JSON:
```json
[
  {"dayIndex": 0, "shiftDefinitionKey": "day", "work": true},
  {"dayIndex": 1, "shiftDefinitionKey": "day", "work": true},
  {"dayIndex": 2, "shiftDefinitionKey": "day", "work": false},
  {"dayIndex": 3, "shiftDefinitionKey": "day", "work": false},
  {"dayIndex": 4, "shiftDefinitionKey": "day", "work": false}
]
```

### 5. Run the App

```bash
npm run dev
```

Open http://localhost:3000

## User Roles

### BasicUser
- View their own schedule
- View mission/team schedules (read-only)
- Request PTO

### TeamLead
- All BasicUser capabilities
- Manage schedules for assigned missions
- Generate schedules from templates
- Assign crew to shifts (PRIMARY/BACKUP)
- Approve/deny PTO for their team
- Handle call-outs and replacements

### OperationsLead
- All BasicUser capabilities
- Read access to all missions
- Review and approve schedules cross-mission
- Approve/deny PTO globally
- Dashboard for coverage status

### Admin
- Full system access
- Manage users and roles
- Manage missions, teams, templates
- System configuration

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables from `.env.local`
4. Deploy!

### Convex Production

Your Convex deployment automatically handles:
- Database hosting
- Real-time subscriptions
- Serverless functions
- Edge caching

## Development Notes

- Convex functions are in `convex/` directory
- All database operations use Convex queries/mutations
- Real-time updates via `useQuery` hooks
- Role checks enforced server-side in Convex functions
- Client components use `"use client"` directive

## Next Steps

- Add drag-and-drop shift assignment
- Implement conflict detection (double-booking, PTO conflicts)
- Add CSV/PDF export for schedules
- Build mobile-responsive schedule grid view
- Add notifications for PTO approvals
- Implement call-out workflow with replacement finder

## Support

For issues or questions, see SETUP.md for detailed setup instructions.
