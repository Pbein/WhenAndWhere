# WhenAndWhere - Development Roadmap

## Overview

This document outlines the complete build plan for the WhenAndWhere scheduling application, organized into epics and user stories in logical build order.

## Current Status

| Phase | Epic | Status | Completed |
|-------|------|--------|-----------|
| 1 | E01 Foundation Schema | ✅ Complete | Dec 14, 2024 |
| 2 | E02 Core Backend APIs | 🔲 Not Started | - |
| 2 | E03 Shared UI Components | 🔲 Not Started | - |
| 3 | E04 Schedule Management | 🔲 Not Started | - |
| 4 | E05 Mission Management | 🔲 Not Started | - |
| 4 | E06 Team & Crew Management | 🔲 Not Started | - |
| 4 | E07 Template Management | 🔲 Not Started | - |
| 5 | E08 Dashboard & Reporting | 🔲 Not Started | - |
| 6 | E09 Advanced Workflows | 🔲 Not Started | - |

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
E02 Core APIs      E03 UI Components
       │                  │
       └────────┬─────────┘
                ▼
         E04 Schedule Management
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
| 2 | E02 | Core Backend APIs | 6 | 🔲 Ready |
| 2 | E03 | Shared UI Components (parallel) | 4 | 🔲 Ready |
| 3 | E04 | Schedule Management | 4 | ⏳ Blocked |
| 4 | E05 | Mission Management | 3 | ⏳ Blocked |
| 4 | E06 | Team & Crew Management | 3 | ⏳ Blocked |
| 4 | E07 | Template Management | 2 | ⏳ Blocked |
| 5 | E08 | Dashboard & Reporting | 2 | ⏳ Blocked |
| 6 | E09 | Advanced Workflows | 3 | ⏳ Blocked |

**Total User Stories: 33**

---

## Epics Summary

### E01: Foundation Schema ✅ COMPLETE
Extend the Convex schema with all required tables and fields for the complete data model.

**What was built:**
- New tables: `qualifications`, `userQualifications`, `crewMemberships`, `missionEligibility`, `callOuts`
- Extended: `zooMissions`, `users`, `teams`, `shiftInstances`, `shiftAssignments`
- Shared types: `convex/lib/types.ts`

### E02: Core Backend APIs 🔲 READY
Build all Convex mutations and queries needed by the UI.

### E03: Shared UI Components 🔲 READY
Reusable calendar components, panels, and indicators used across multiple pages.

### E04: Schedule Management ⏳ BLOCKED
The heart of the app - viewing and managing shift schedules.

### E05: Mission Management ⏳ BLOCKED
Mission detail pages and lifecycle management (start, pause, terminate).

### E06: Team & Crew Management ⏳ BLOCKED
Managing crew memberships, employee details, and qualifications.

### E07: Template Management ⏳ BLOCKED
Creating and editing Panama 2-2-3 and custom schedule templates.

### E08: Dashboard & Reporting ⏳ BLOCKED
Role-specific dashboards showing coverage health and pending actions.

### E09: Advanced Workflows ⏳ BLOCKED
PTO conflict detection, call-out handling, and schedule approval flow.

---

## Shared Code Strategy (DRY)

### Shared Utilities (`lib/`)
- `lib/date-utils.ts` - Date formatting, cycle calculations
- `lib/coverage-utils.ts` - Coverage status computation
- `lib/constants.ts` - Shared constants (colors, roles, statuses)

### Shared Hooks (`hooks/`)
- `useMission(id)` - Fetch mission with related data
- `useShiftSlots(missionId, dateRange)` - Fetch shifts with assignments
- `useCoverageStatus(shiftId)` - Compute coverage status
- `useEligibleEmployees(shiftId)` - Get sorted replacement candidates

### Shared Components (`components/`)
- `components/ui/` - Base UI primitives (existing)
- `components/schedule/` - Calendar and scheduling components
- `components/common/` - Shared layout components
- `components/forms/` - Reusable form patterns

### Convex Shared Logic (`convex/`)
- `convex/lib/types.ts` - Shared type constants ✅
- `convex/helpers/` - Shared validation and computation functions
- `convex/rbac.ts` - Role-based access control (existing)

---

## Definition of Done

Each user story is complete when:
1. Code is implemented and type-safe
2. Follows existing code patterns and conventions
3. No linter errors
4. Integrated with existing navigation/layout
5. Works with role-based access control
6. Documentation updated with completion status
