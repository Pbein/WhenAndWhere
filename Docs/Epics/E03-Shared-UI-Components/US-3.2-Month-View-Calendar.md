# US-3.2: Month View Calendar Component

## User Story

**As a** Team Lead or Ops Lead  
**I want** to see a month-at-a-glance view of the schedule  
**So that** I can quickly identify coverage patterns and gaps

## Priority

P0 - Essential for big-picture planning

## Acceptance Criteria

- [ ] Traditional 7-column calendar grid layout
- [ ] Each day shows summary of Day/Night shift status
- [ ] Color-coded coverage status per day (green/yellow/red)
- [ ] Click on day to navigate to week view centered on that date
- [ ] Month/year navigation controls
- [ ] Holidays and special dates highlighted

## Technical Details

### Component Props

```typescript
// components/schedule/month-view.tsx

interface MonthViewProps {
  missionId: Id<"zooMissions">;
  month: Date;  // Any date in the target month
  onDayClick: (date: Date) => void;
  onNavigate: (direction: "prev" | "next") => void;
}
```

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  < December 2024 >                                          │
├─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┤
│   Sun   │   Mon   │   Tue   │   Wed   │   Thu   │   Fri   │   Sat   │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│    1    │    2    │    3    │    4    │    5    │    6    │    7    │
│ 🟢 D:2/2│ 🟢 D:2/2│ 🟡 D:1/2│ 🟢 D:2/2│ 🟢 D:2/2│ 🟢 D:2/2│ 🟢 D:2/2│
│ 🟢 N:2/2│ 🟢 N:2/2│ 🔴 N:0/2│ 🟢 N:2/2│ 🟢 N:2/2│ 🟢 N:2/2│ 🟢 N:2/2│
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│    8    │    9    │   10    │   11    │   12    │   13    │   14    │
│   ...   │   ...   │   ...   │   ...   │   ...   │   ...   │   ...   │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
```

### Day Cell Summary

Each day cell shows:
- Day number
- Day shift: status icon + "assigned/required" (e.g., "D:2/2")
- Night shift: status icon + "assigned/required" (e.g., "N:1/2")
- Overall day status (worst of Day/Night)

### Component Architecture

```typescript
export function MonthView({ missionId, month, onDayClick }: MonthViewProps) {
  const { startOfMonth, endOfMonth, weeks } = useCalendarMonth(month);
  
  const shifts = useQuery(api.schedules.getShiftsForDateRange, {
    missionId,
    startDate: startOfMonth.getTime(),
    endDate: endOfMonth.getTime(),
  });
  
  // Group shifts by date
  const shiftsByDate = useMemo(() => 
    groupShiftsByDate(shifts ?? []), 
    [shifts]
  );
  
  return (
    <div className="month-view">
      <MonthHeader 
        month={month} 
        onNavigate={onNavigate} 
      />
      <div className="grid grid-cols-7 gap-1">
        <DayOfWeekHeaders />
        {weeks.map(week => (
          week.map(day => (
            <MonthDayCell
              key={day.toISOString()}
              date={day}
              shifts={shiftsByDate.get(day.toDateString())}
              isCurrentMonth={isSameMonth(day, month)}
              onClick={() => onDayClick(day)}
            />
          ))
        ))}
      </div>
    </div>
  );
}

function MonthDayCell({ date, shifts, isCurrentMonth, onClick }: MonthDayCellProps) {
  const dayShifts = shifts?.filter(s => s.shiftType === "day") ?? [];
  const nightShifts = shifts?.filter(s => s.shiftType === "night") ?? [];
  
  const dayCoverage = aggregateCoverage(dayShifts);
  const nightCoverage = aggregateCoverage(nightShifts);
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "month-day-cell p-2 rounded-lg",
        !isCurrentMonth && "opacity-40"
      )}
    >
      <div className="text-sm font-medium">{date.getDate()}</div>
      <div className="text-xs space-y-0.5">
        <ShiftSummary label="D" coverage={dayCoverage} />
        <ShiftSummary label="N" coverage={nightCoverage} />
      </div>
    </button>
  );
}
```

### Helper Hook

```typescript
// components/schedule/hooks/use-calendar-month.ts

export function useCalendarMonth(month: Date) {
  return useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    
    // Get full weeks (including days from prev/next month)
    const calendarStart = startOfWeek(start, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(end, { weekStartsOn: 0 });
    
    const weeks: Date[][] = [];
    let current = calendarStart;
    
    while (current <= calendarEnd) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(addDays(current, i));
      }
      weeks.push(week);
      current = addDays(current, 7);
    }
    
    return { startOfMonth: start, endOfMonth: end, weeks };
  }, [month]);
}
```

## Files Created

- `components/schedule/month-view.tsx`
- `components/schedule/month-day-cell.tsx`
- `components/schedule/month-header.tsx`
- `components/schedule/hooks/use-calendar-month.ts`

## Dependencies

- US-3.4: Coverage Status Indicators
- E02: Coverage validation API

## Estimate

Medium (M)




