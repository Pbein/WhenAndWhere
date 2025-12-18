# Epic 03: Shared UI Components

## Overview

Build reusable calendar and scheduling UI components that will be used across multiple pages (Schedules, Mission Detail, Approvals, etc.).

## Priority

**Phase 2** - Can be built in parallel with E02 (APIs), but needs E01 (Schema) complete.

## Dependencies

- E01: Foundation Schema (for types)
- E02: Core Backend APIs (for data fetching)

## User Stories

| ID | Title | Priority | Estimate |
|----|-------|----------|----------|
| US-3.1 | Week Grid Calendar Component | P0 | L |
| US-3.2 | Month View Calendar Component | P0 | M |
| US-3.3 | Shift Slot Assignment Panel | P0 | L |
| US-3.4 | Coverage Status Indicators | P0 | S |

## Technical Notes

### Component Architecture

```
components/schedule/
├── week-grid.tsx          # Enhanced week grid with crew rows
├── month-view.tsx         # Month calendar with day summaries
├── slot-panel.tsx         # Side panel for shift assignment
├── coverage-badge.tsx     # Reusable green/yellow/red badge
├── shift-cell.tsx         # Individual shift cell (shared)
├── employee-list.tsx      # Filterable employee picker
└── hooks/
    ├── use-calendar-navigation.ts
    └── use-shift-selection.ts
```

### Shared State Pattern

Use React Context for calendar state shared between components:

```typescript
// components/schedule/schedule-context.tsx
interface ScheduleContextValue {
  selectedMissionId: Id<"zooMissions"> | null;
  selectedShiftId: Id<"shiftInstances"> | null;
  dateRange: { start: Date; end: Date };
  viewMode: "week" | "month";
  filters: ScheduleFilters;
  // Actions
  setSelectedShift: (id: Id<"shiftInstances"> | null) => void;
  setDateRange: (range: DateRange) => void;
  setViewMode: (mode: "week" | "month") => void;
}
```

### Design System

Follow existing dark theme conventions:
- Background: `#0a0a0a`, `#111111`, `#1a1a1a`
- Border: `#2a2a2a`
- Text: `#f5f5f5` (primary), `#a1a1aa` (secondary)
- Accent: `#10b981` (green), `#f59e0b` (amber), `#ef4444` (red)

## Files Created

- `components/schedule/week-grid.tsx` - Enhanced
- `components/schedule/month-view.tsx` - New
- `components/schedule/slot-panel.tsx` - New
- `components/schedule/coverage-badge.tsx` - New
- `components/schedule/shift-cell.tsx` - New
- `components/schedule/employee-list.tsx` - New
- `components/schedule/schedule-context.tsx` - New
- `components/schedule/hooks/use-calendar-navigation.ts` - New




