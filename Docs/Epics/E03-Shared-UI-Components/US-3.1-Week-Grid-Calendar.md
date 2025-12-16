# US-3.1: Week Grid Calendar Component

## User Story

**As a** Team Lead  
**I want** to view shifts in a week grid with crews as rows  
**So that** I can see the full picture of who's working when

## Priority

P0 - Core calendar component

## Acceptance Criteria

- [ ] Grid displays 7 or 14 days as columns
- [ ] Rows can be grouped by crew or by employee
- [ ] Each cell shows shift type (Day/Night) with color coding
- [ ] Cells show assigned employee names or "Unassigned"
- [ ] Clicking a cell selects it (for slot panel integration)
- [ ] Coverage status indicator on each cell
- [ ] Responsive design for various screen sizes

## Technical Details

### Component Props

```typescript
// components/schedule/week-grid.tsx

interface WeekGridProps {
  missionId: Id<"zooMissions">;
  startDate: Date;
  endDate: Date;
  groupBy: "crew" | "employee";
  onSlotSelect: (shiftId: Id<"shiftInstances">) => void;
  selectedSlotId?: Id<"shiftInstances">;
  filters?: {
    crewIds?: Id<"teams">[];
    shiftType?: "day" | "night" | "all";
    showUnassignedOnly?: boolean;
  };
}
```

### Layout Structure

```
┌──────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│          │  Mon    │  Tue    │  Wed    │  Thu    │  Fri    │  Sat    │  Sun    │
│          │  Dec 16 │  Dec 17 │  Dec 18 │  Dec 19 │  Dec 20 │  Dec 21 │  Dec 22 │
├──────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Crew A   │         │         │         │         │         │         │         │
│   Day    │ 🟢 John │ 🟢 John │   OFF   │   OFF   │ 🟢 John │ 🟢 John │ 🟢 John │
│   Night  │ 🟢 Mary │ 🟢 Mary │   OFF   │   OFF   │ 🟢 Mary │ 🟢 Mary │ 🟢 Mary │
├──────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Crew B   │         │         │         │         │         │         │         │
│   Day    │   OFF   │   OFF   │ 🔴 ---  │ 🟡 Bob  │   OFF   │   OFF   │   OFF   │
│   Night  │   OFF   │   OFF   │ 🟢 Sue  │ 🟢 Sue  │   OFF   │   OFF   │   OFF   │
└──────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
```

### Component Architecture

```typescript
// Main grid component
export function WeekGrid({ missionId, startDate, ... }: WeekGridProps) {
  const shifts = useQuery(api.schedules.getShiftsForDateRange, {
    missionId,
    startDate: startDate.getTime(),
    endDate: endDate.getTime(),
  });
  
  return (
    <div className="week-grid">
      <WeekGridHeader dates={dateRange} />
      {rows.map(row => (
        <WeekGridRow
          key={row.id}
          rowData={row}
          shifts={shifts}
          onSlotSelect={onSlotSelect}
          selectedSlotId={selectedSlotId}
        />
      ))}
    </div>
  );
}

// Individual cell component (reusable)
export function ShiftCell({ shift, isSelected, onClick }: ShiftCellProps) {
  const coverage = useCoverageStatus(shift._id);
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "shift-cell",
        shift.shiftType === "day" ? "bg-amber-900/20" : "bg-indigo-900/20",
        isSelected && "ring-2 ring-emerald-500"
      )}
    >
      <CoverageBadge status={coverage.status} />
      <span className="shift-assignee">
        {shift.assignments[0]?.user?.name ?? "Unassigned"}
      </span>
    </button>
  );
}
```

### Styling (Tailwind)

```css
/* Day shifts: warm amber tones */
.shift-cell.day { @apply bg-amber-900/20 border-amber-700/30; }

/* Night shifts: cool indigo tones */
.shift-cell.night { @apply bg-indigo-900/20 border-indigo-700/30; }

/* Selected state */
.shift-cell.selected { @apply ring-2 ring-emerald-500; }

/* Off days */
.shift-cell.off { @apply bg-zinc-800/50 text-zinc-600; }
```

## Subcomponents

- `WeekGridHeader` - Date headers
- `WeekGridRow` - Single crew or employee row
- `ShiftCell` - Individual shift cell (reusable in month view too)
- `CoverageBadge` - Status indicator (see US-3.4)

## Files Created

- `components/schedule/week-grid.tsx` (enhanced from existing)
- `components/schedule/shift-cell.tsx`
- `components/schedule/week-grid-header.tsx`
- `components/schedule/week-grid-row.tsx`

## Dependencies

- E02 APIs (getShiftsForDateRange, getShiftCoverageStatus)

## Estimate

Large (L)



