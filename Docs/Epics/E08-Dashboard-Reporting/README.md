# Epic 08: Dashboard & Reporting ✅ COMPLETE

## Overview

Role-specific dashboards showing operational health, coverage gaps, pending actions, and key metrics.

## Status

**✅ Complete** - Dec 14, 2024

## Priority

**Phase 5** - Requires most other features to be complete for meaningful data.

## Dependencies

- E02: Core Backend APIs (coverage validation) ✅
- E04: Schedule Management (for context) ✅

## User Stories

| ID | Title | Priority | Estimate | Status |
|----|-------|----------|----------|--------|
| US-8.1 | TeamLead Dashboard | P0 | M | ✅ Complete |
| US-8.2 | OpsLead Dashboard | P0 | M | ✅ Complete |

## Technical Notes

### Dashboard by Role

**BasicUser Dashboard:**
- My upcoming shifts (next 7 days)
- My PTO requests and status
- Quick request PTO button

**TeamLead Dashboard:**
- Unassigned shifts count by mission
- Pending PTO requests to review
- Coverage gaps in next 7 days
- Quick actions: View Schedule, Extend Schedule

**OpsLead Dashboard:**
- Cross-mission health overview
- Schedules pending approval
- Coverage gaps across all missions
- Approve/Reject quick actions

### Health Indicators

```typescript
type HealthStatus = "green" | "yellow" | "red";

interface MissionHealth {
  missionId: Id<"zooMissions">;
  status: HealthStatus;
  unassignedCount: number;
  gapCount: number;
  pendingApproval: boolean;
}
```

Visual representation:
- 🟢 Green: Fully covered, no gaps
- 🟡 Yellow: Partially covered or pending approval
- 🔴 Red: Coverage gaps exist

### Dashboard Cards (Reusable)

```typescript
// components/dashboard/metric-card.tsx
<MetricCard
  title="Open Shifts"
  value={12}
  subtitle="Across 3 missions"
  accent="amber"
  action={{ label: "View", href: "/schedules" }}
/>

// components/dashboard/mission-health-card.tsx
<MissionHealthCard missions={missionHealthData} />
```

## Files Modified

- `app/(app)/dashboard/page.tsx` - Complete rewrite with role-based routing
- `components/dashboard/index.ts` - Barrel exports
- `components/dashboard/metric-card.tsx` - Reusable metric card with accent colors
- `components/dashboard/basic-user-dashboard.tsx` - Personal schedule and PTO view
- `components/dashboard/team-lead-dashboard.tsx` - Mission health and pending actions
- `components/dashboard/ops-lead-dashboard.tsx` - Cross-mission oversight and approvals
- `components/dashboard/mission-health-grid.tsx` - Grid of missions with health indicators
- `components/dashboard/mission-status-card.tsx` - Detailed mission card with stats
- `components/dashboard/pending-pto-list.tsx` - PTO requests with approve/deny actions
- `components/dashboard/coverage-alerts-list.tsx` - Coverage gap alerts by mission
- `components/dashboard/pending-approvals-table.tsx` - Schedule approvals table
- `components/dashboard/upcoming-shifts-card.tsx` - User's upcoming shifts display
- `components/dashboard/my-pto-status.tsx` - User's PTO request history
- `convex/schedules.ts` - Extended with `getDashboardStats` aggregation query




