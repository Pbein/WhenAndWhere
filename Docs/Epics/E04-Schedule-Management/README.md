# Epic 04: Schedule Management

## Overview

The heart of the application - the Schedules page where Team Leads view, generate, and manage shift assignments. Integrates calendar components and assignment panel.

## Priority

**Phase 3** - Requires E02 (APIs) and E03 (UI Components).

## Dependencies

- E02: Core Backend APIs
- E03: Shared UI Components

## User Stories

| ID | Title | Priority | Estimate |
|----|-------|----------|----------|
| US-4.1 | Schedules Page - Calendar Views | P0 | M |
| US-4.2 | Schedules Page - Extend Schedule | P0 | M |
| US-4.3 | Schedules Page - Slot Assignment | P0 | L |
| US-4.4 | Schedules Page - Filters | P1 | S |

## Technical Notes

### Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ Header: Mission Selector | View Toggle | Extend Button  │
├─────────────────────────────────────────────────────────┤
│ Filters: Crew | Shift Type | Unassigned Only           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Calendar View (Week or Month)                          │
│                                                         │
│  ┌─────────────────────────────┐  ┌──────────────────┐ │
│  │                             │  │  Slot Panel      │ │
│  │  Week Grid / Month Grid     │  │  (when slot      │ │
│  │                             │  │   selected)      │ │
│  │                             │  │                  │ │
│  └─────────────────────────────┘  └──────────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Footer: Schedule Status | Submit for Approval Button   │
└─────────────────────────────────────────────────────────┘
```

### State Management

The Schedules page uses the ScheduleContext from E03 to manage:
- Selected mission
- Date range navigation
- View mode (week/month)
- Selected shift for panel
- Filter state

## Files Modified

- `app/(app)/schedules/page.tsx` - Complete rewrite
- New child components as needed
