# US-4.1: Schedules Page - Calendar Views Integration

## User Story

**As a** Team Lead  
**I want** to toggle between week and month calendar views  
**So that** I can see both detailed and high-level schedule views

## Priority

P0 - Core page functionality

## Acceptance Criteria

- [ ] Toggle button to switch between Week and Month view
- [ ] Week view shows 7 or 14 days with detailed shift cells
- [ ] Month view shows full month with day summaries
- [ ] Clicking a day in month view switches to week view
- [ ] Selected mission persists across view changes
- [ ] Date navigation (prev/next) works in both views
- [ ] "Today" button to jump to current date

## Technical Details

### Page Layout

```typescript
// app/(app)/schedules/page.tsx

export default function SchedulesPage() {
  const [missionId, setMissionId] = useState<Id<"zooMissions"> | null>(null);
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [dateRange, setDateRange] = useState(() => getCurrentWeekRange());
  const [selectedShiftId, setSelectedShiftId] = useState<Id<"shiftInstances"> | null>(null);
  
  const missions = useQuery(api.missions.listActive);
  
  const handleDayClick = (date: Date) => {
    // Switch to week view centered on clicked date
    setDateRange(getWeekRange(date));
    setViewMode("week");
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ScheduleHeader
        missions={missions}
        selectedMissionId={missionId}
        onMissionChange={setMissionId}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      
      {/* Calendar */}
      <div className="flex-1 flex">
        <div className="flex-1">
          {viewMode === "week" ? (
            <WeekGrid
              missionId={missionId!}
              startDate={dateRange.start}
              endDate={dateRange.end}
              onSlotSelect={setSelectedShiftId}
              selectedSlotId={selectedShiftId}
            />
          ) : (
            <MonthView
              missionId={missionId!}
              month={dateRange.start}
              onDayClick={handleDayClick}
              onNavigate={handleMonthNav}
            />
          )}
        </div>
        
        {/* Slot Panel */}
        <SlotPanel
          shiftId={selectedShiftId}
          isOpen={!!selectedShiftId}
          onClose={() => setSelectedShiftId(null)}
        />
      </div>
    </div>
  );
}
```

### Schedule Header Component

```typescript
// components/schedule/schedule-header.tsx

interface ScheduleHeaderProps {
  missions: Mission[] | undefined;
  selectedMissionId: Id<"zooMissions"> | null;
  onMissionChange: (id: Id<"zooMissions">) => void;
  viewMode: "week" | "month";
  onViewModeChange: (mode: "week" | "month") => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export function ScheduleHeader(props: ScheduleHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
      {/* Left: Mission selector */}
      <div className="flex items-center gap-4">
        <select
          value={props.selectedMissionId ?? ""}
          onChange={e => props.onMissionChange(e.target.value as any)}
          className="rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2"
        >
          <option value="">Select Mission</option>
          {props.missions?.map(m => (
            <option key={m._id} value={m._id}>{m.name}</option>
          ))}
        </select>
      </div>
      
      {/* Center: Date navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handlePrev}>
          ←
        </Button>
        <span className="text-sm font-medium text-[#f5f5f5] min-w-32 text-center">
          {formatDateRange(props.dateRange, props.viewMode)}
        </span>
        <Button variant="ghost" size="sm" onClick={handleNext}>
          →
        </Button>
        <Button variant="outline" size="sm" onClick={handleToday}>
          Today
        </Button>
      </div>
      
      {/* Right: View toggle */}
      <div className="flex items-center gap-2">
        <div className="flex rounded-md border border-[#2a2a2a]">
          <button
            className={cn(
              "px-3 py-1 text-sm",
              props.viewMode === "week" && "bg-[#10b981] text-white"
            )}
            onClick={() => props.onViewModeChange("week")}
          >
            Week
          </button>
          <button
            className={cn(
              "px-3 py-1 text-sm",
              props.viewMode === "month" && "bg-[#10b981] text-white"
            )}
            onClick={() => props.onViewModeChange("month")}
          >
            Month
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Files Modified

- `app/(app)/schedules/page.tsx` - Complete rewrite
- `components/schedule/schedule-header.tsx` - New

## Dependencies

- US-3.1: Week Grid Calendar
- US-3.2: Month View Calendar
- US-3.3: Slot Assignment Panel

## Estimate

Medium (M)
