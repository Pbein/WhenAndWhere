# Epic 08: Dashboard & Reporting

## Overview

Role-specific dashboards showing operational health, coverage gaps, pending actions, and key metrics.

## Priority

**Phase 5** - Requires most other features to be complete for meaningful data.

## Dependencies

- E02: Core Backend APIs (coverage validation)
- E04: Schedule Management (for context)

## User Stories

| ID | Title | Priority | Estimate |
|----|-------|----------|----------|
| US-8.1 | TeamLead Dashboard | P0 | M |
| US-8.2 | OpsLead Dashboard | P0 | M |

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

- `app/(app)/dashboard/page.tsx` - Complete rewrite
- `components/dashboard/metric-card.tsx` - New
- `components/dashboard/mission-health-card.tsx` - New
- `components/dashboard/upcoming-shifts.tsx` - New
