# WhenAndWhere - Development Roadmap

## Overview

This document outlines the complete build plan for the WhenAndWhere scheduling application, organized into epics and user stories in logical build order.

## Current Status

| Phase | Epic | Status | Completed |
|-------|------|--------|-----------|
| 1 | E01 Foundation Schema | ✅ Complete | Dec 14, 2024 |
| 2 | E02 Core Backend APIs | ✅ Complete | Dec 14, 2024 |
| 2 | E03 Shared UI Components | ✅ Complete | Dec 14, 2024 |
| 3 | E04 Schedule Management | ✅ Complete | Dec 14, 2024 |
| 4 | E05 Mission Management | 🔲 Ready | - |
| 4 | E06 Team & Crew Management | 🔲 Ready | - |
| 4 | E07 Template Management | 🔲 Ready | - |
| 5 | E08 Dashboard & Reporting | ⏳ Blocked | - |
| 6 | E09 Advanced Workflows | ⏳ Blocked | - |

## Architecture Principles

- **DRY (Don't Repeat Yourself)**: Shared utilities, hooks, and components
- **Single Responsibility**: Each module/component does one thing well
- **Reusable Components**: Build once, use everywhere
- **Type Safety**: Full TypeScript with Convex schema validation

## Epic Dependencies

```
E01 Foundation Schema ✅
       │
       ├──────────────────┐
       ▼                  ▼
E02 Core APIs ✅    E03 UI Components ✅
       │                  │
       └────────┬─────────┘
                ▼
         E04 Schedule Management ✅
                │
       ┌────────┼────────┬─────────┐
       ▼        ▼        ▼         ▼
     E05      E06      E07       E08
   Mission   Team    Template  Dashboard
       │        │        │         │
       └────────┴────────┴─────────┘
                │
                ▼
         E09 Advanced Workflows
```

## Build Order

| Phase | Epic | Description | Est. Stories | Status |
|-------|------|-------------|--------------|--------|
| 1 | E01 | Foundation Schema | 6 | ✅ Complete |
| 2 | E02 | Core Backend APIs | 6 | ✅ Complete |
| 2 | E03 | Shared UI Components (parallel) | 4 | ✅ Complete |
| 3 | E04 | Schedule Management | 4 | ✅ Complete |
| 4 | E05 | Mission Management | 3 | 🔲 Ready |
| 4 | E06 | Team & Crew Management | 3 | 🔲 Ready |
| 4 | E07 | Template Management | 2 | 🔲 Ready |
| 5 | E08 | Dashboard & Reporting | 2 | ⏳ Blocked |
| 6 | E09 | Advanced Workflows | 3 | ⏳ Blocked |

**Total User Stories: 33** | **Completed: 20** | **Remaining: 13**

---

## Epics Summary

### E01: Foundation Schema ✅ COMPLETE
Extend the Convex schema with all required tables and fields for the complete data model.

**What was built:**
- New tables: `qualifications`, `userQualifications`, `crewMemberships`, `missionEligibility`, `callOuts`
- Extended: `zooMissions`, `users`, `teams`, `shiftInstances`, `shiftAssignments`
- Shared types: `convex/lib/types.ts`

### E02: Core Backend APIs ✅ COMPLETE
Build all Convex mutations and queries needed by the UI.

**What was built:**
- `convex/helpers/schedule.ts` - Cycle day calculation, time parsing, shift timing utilities
- `convex/helpers/coverage.ts` - Coverage status calculation and gap detection
- `convex/helpers/eligibility.ts` - Employee filtering and sorting for shift assignments
- `convex/schedules.ts` - Extended with 15+ new APIs:
  - Schedule generation: `startMissionSchedule`, `extendSchedule`, `getLastGeneratedDate`
  - Coverage: `getShiftCoverageStatus`, `validateCoverage`, `getMissionCoverageHealth`
  - Assignments: `getEligibleReplacements`, `getShiftWithAssignments`
  - Approval: `submitForApproval`, `approveSchedule`, `rejectSchedule`, `getPendingApprovals`
- `convex/teams.ts` - Extended with crew membership APIs
- `convex/qualifications.ts` - Full CRUD + grant/revoke user qualifications
- `convex/callouts.ts` - Report, assign replacement, get pending/history

### E03: Shared UI Components ✅ COMPLETE
Reusable calendar components, panels, and indicators used across multiple pages.

**What was built:**
- `components/schedule/coverage-badge.tsx` - Green/yellow/red status indicators
- `components/schedule/coverage-summary.tsx` - Full coverage details display
- `components/schedule/enhanced-week-grid.tsx` - Week view with crews as rows
- `components/schedule/month-view.tsx` - Month calendar with day summaries
- `components/schedule/shift-cell.tsx` - Individual shift cells
- `components/schedule/slot-panel.tsx` - Side panel for shift management
- `components/schedule/employee-list.tsx` - Searchable, filterable employee picker
- `components/schedule/assignment-section.tsx` - Grouped assignment display
- `components/schedule/schedule-context.tsx` - Shared calendar state
- `components/schedule/hooks/use-calendar-navigation.ts` - Navigation utilities
- `components/schedule/hooks/use-shift-selection.ts` - Selection state
- `lib/constants.ts` - Shared color palettes

### E04: Schedule Management ✅ COMPLETE
The heart of the app - viewing and managing shift schedules.

**What was built:**
- `app/(app)/schedules/page.tsx` - Complete rewrite with full calendar integration
- `components/schedule/schedule-header.tsx` - Mission selector, date navigation, view toggle
- `components/schedule/schedule-status.tsx` - Shows how far schedule is generated
- `components/schedule/extend-schedule-modal.tsx` - Modal for generating future shifts
- `components/schedule/filter-bar.tsx` - Crew, shift type, and gap filtering
- Week/Month view toggling with smooth transitions
- Slot panel integration with ESC key to close
- Real-time updates when assignments change

### E05: Mission Management 🔲 READY
Mission detail pages and lifecycle management (start, pause, terminate).

### E06: Team & Crew Management 🔲 READY
Managing crew memberships, employee details, and qualifications.

### E07: Template Management 🔲 READY
Creating and editing Panama 2-2-3 and custom schedule templates.

### E08: Dashboard & Reporting ⏳ BLOCKED
Role-specific dashboards showing coverage health and pending actions.

### E09: Advanced Workflows ⏳ BLOCKED
PTO conflict detection, call-out handling, and schedule approval flow.

---

## Shared Code Strategy (DRY)

### Shared Utilities (`lib/`)
- `lib/utils.ts` - General utilities (cn function) ✅
- `lib/constants.ts` - Shared constants (colors, roles, statuses) ✅

### Shared Hooks (`components/schedule/hooks/`)
- `use-calendar-navigation.ts` - Date range and navigation ✅
- `use-shift-selection.ts` - Shift selection and panel state ✅

### Shared Components (`components/`)
- `components/ui/` - Base UI primitives ✅
- `components/schedule/` - Calendar and scheduling components ✅
- `components/nav/` - Navigation components ✅

### Convex Shared Logic (`convex/`)
- `convex/lib/types.ts` - Shared type constants ✅
- `convex/helpers/schedule.ts` - Schedule calculation helpers ✅
- `convex/helpers/coverage.ts` - Coverage validation helpers ✅
- `convex/helpers/eligibility.ts` - User eligibility helpers ✅
- `convex/rbac.ts` - Role-based access control ✅

---

## Definition of Done

Each user story is complete when:
1. Code is implemented and type-safe
2. Follows existing code patterns and conventions
3. No linter errors
4. Integrated with existing navigation/layout
5. Works with role-based access control
6. Documentation updated with completion status
