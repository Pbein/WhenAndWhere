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
| 4 | E05 Mission Management | ✅ Complete | Dec 14, 2024 |
| 4 | E06 Team & Crew Management | ✅ Complete | Dec 14, 2024 |
| 4 | E07 Template Management | ✅ Complete | Dec 14, 2024 |
| 5 | E08 Dashboard & Reporting | ✅ Complete | Dec 14, 2024 |
| 6 | E09 Advanced Workflows | 🔲 Ready | - |

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
| 4 | E05 | Mission Management | 3 | ✅ Complete |
| 4 | E06 | Team & Crew Management | 3 | ✅ Complete |
| 4 | E07 | Template Management | 2 | ✅ Complete |
| 5 | E08 | Dashboard & Reporting | 2 | ✅ Complete |
| 6 | E09 | Advanced Workflows | 3 | 🔲 Ready |

**Total User Stories: 33** | **Completed: 30** | **Remaining: 3**

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

### E05: Mission Management ✅ COMPLETE
Mission detail pages and lifecycle management (start, pause, terminate).

**What was built:**
- `app/(app)/missions/[id]/page.tsx` - Mission detail page with comprehensive management
- `components/missions/mission-header.tsx` - Header with name, status badge, actions
- `components/missions/mission-lifecycle-card.tsx` - Template selector, anchor date, status
- `components/missions/cycle-position-indicator.tsx` - Visual cycle progress bar
- `components/missions/mission-status-actions.tsx` - Pause/Resume/Terminate controls
- `components/missions/terminate-mission-dialog.tsx` - Confirmation dialog
- `components/missions/crews-card.tsx` - Displays associated crews with counts
- `components/missions/shift-definitions-card.tsx` - Day/Night shift management
- `components/missions/shift-definition-form.tsx` - Create/edit shifts with presets
- `components/missions/quick-actions-card.tsx` - Quick links to schedule, extend, crews

### E06: Team & Crew Management ✅ COMPLETE
Managing crew memberships, employee details, and qualifications.

**What was built:**
- `app/(app)/teams/page.tsx` - Enhanced with expandable crew cards and member management
- `app/(app)/crew/page.tsx` - Updated with links to employee details
- `app/(app)/crew/[id]/page.tsx` - Employee detail page with profile, crews, qualifications
- `app/(app)/admin/qualifications/page.tsx` - Qualification administration
- `components/crew/crew-card.tsx` - Expandable card showing team members
- `components/crew/crew-member-row.tsx` - Member display with qualifications
- `components/crew/add-member-dialog.tsx` - Searchable member picker
- `components/crew/create-team-dialog.tsx` - Team creation form
- `components/crew/employee-header.tsx` - Employee profile header
- `components/crew/crew-memberships-list.tsx` - Manage user crews
- `components/crew/qualifications-list.tsx` - Manage user qualifications
- `components/crew/upcoming-shifts-list.tsx` - Display upcoming assignments
- `components/crew/pto-history-list.tsx` - Display PTO history
- `components/qualifications/qualification-form-dialog.tsx` - Create/edit qualifications
- `components/qualifications/qualifications-admin-list.tsx` - Admin list view

### E07: Template Management ✅ COMPLETE
Creating and editing Panama 2-2-3 and custom schedule templates.

**What was built:**
- `app/(app)/templates/page.tsx` - Enhanced with full CRUD and pattern builder
- `components/templates/template-card.tsx` - Template display with usage info
- `components/templates/template-form-dialog.tsx` - Create/edit template details
- `components/templates/pattern-cell.tsx` - Interactive cell (Off/Day/Night)
- `components/templates/pattern-builder.tsx` - Visual grid editor for patterns
- `components/templates/pattern-preview.tsx` - Read-only pattern summary
- `components/templates/pattern-editor-dialog.tsx` - Full pattern editing experience
- `lib/template-presets.ts` - Panama 2-2-3 and Simple 4-Crew presets

### E08: Dashboard & Reporting ✅ COMPLETE
Role-specific dashboards showing coverage health and pending actions.

**What was built:**
- `app/(app)/dashboard/page.tsx` - Rewritten with role-based routing
- `components/dashboard/metric-card.tsx` - Reusable metric card with accent colors
- `components/dashboard/basic-user-dashboard.tsx` - Personal schedule and PTO view
- `components/dashboard/team-lead-dashboard.tsx` - Mission health and pending actions
- `components/dashboard/ops-lead-dashboard.tsx` - Cross-mission oversight and approvals
- `components/dashboard/mission-health-grid.tsx` - Grid of missions with health indicators
- `components/dashboard/mission-status-card.tsx` - Detailed mission card with stats
- `components/dashboard/pending-pto-list.tsx` - PTO requests with approve/deny
- `components/dashboard/coverage-alerts-list.tsx` - Coverage gap alerts
- `components/dashboard/pending-approvals-table.tsx` - Schedule approvals table
- `components/dashboard/upcoming-shifts-card.tsx` - User's upcoming shifts
- `components/dashboard/my-pto-status.tsx` - User's PTO history
- `convex/schedules.ts` - Extended with `getDashboardStats` aggregation query

### E09: Advanced Workflows 🔲 READY
PTO conflict detection, call-out handling, and schedule approval flow.

---

## Shared Code Strategy (DRY)

### Shared Utilities (`lib/`)
- `lib/utils.ts` - General utilities (cn function) ✅
- `lib/constants.ts` - Shared constants (colors, roles, statuses) ✅
- `lib/template-presets.ts` - Panama 2-2-3 and pattern utilities ✅

### Shared Hooks (`components/schedule/hooks/`)
- `use-calendar-navigation.ts` - Date range and navigation ✅
- `use-shift-selection.ts` - Shift selection and panel state ✅

### Shared Components (`components/`)
- `components/ui/` - Base UI primitives ✅
- `components/schedule/` - Calendar and scheduling components ✅
- `components/nav/` - Navigation components ✅
- `components/missions/` - Mission management components ✅
- `components/crew/` - Team and employee management components ✅
- `components/templates/` - Template pattern building components ✅
- `components/qualifications/` - Qualification management components ✅

### Convex Shared Logic (`convex/`)
- `convex/lib/types.ts` - Shared type constants ✅
- `convex/helpers/schedule.ts` - Schedule calculation helpers ✅
- `convex/helpers/coverage.ts` - Coverage validation helpers ✅
- `convex/helpers/eligibility.ts` - User eligibility helpers ✅
- `convex/rbac.ts` - Role-based access control ✅
- `convex/schedules.ts` - Extended with `getUserUpcomingShifts` ✅
- `convex/pto.ts` - Extended with `getUserHistory` ✅
- `convex/teams.ts` - Extended with `listByMissionWithCounts` ✅

---

## Definition of Done

Each user story is complete when:
1. Code is implemented and type-safe
2. Follows existing code patterns and conventions
3. No linter errors
4. Integrated with existing navigation/layout
5. Works with role-based access control
6. Documentation updated with completion status
