# US-4.3: Schedules Page - Slot Assignment Integration ✅ COMPLETE

## User Story

**As a** Team Lead  
**I want** to assign employees to shifts directly from the calendar  
**So that** I can efficiently staff all shifts

## Priority

P0 - Core assignment workflow

## Acceptance Criteria

- [x] Clicking a shift cell opens the slot panel
- [x] Panel shows shift details and current assignments
- [x] Can add Primary, Backup, and On-Call assignments
- [x] Employee picker filters by eligibility and qualifications
- [x] Qualified employees highlighted, sorted first
- [x] Can remove existing assignments
- [x] Coverage status updates in real-time
- [x] Changes reflect immediately in calendar

## Technical Details

### Integration Flow

```
1. User clicks shift cell in WeekGrid or MonthView
2. setSelectedShiftId(shiftId) called
3. SlotPanel opens with shift data
4. User clicks "Add Primary" or similar
5. EmployeeList shows filtered candidates
6. User selects employee
7. assignUser mutation called
8. Panel updates with new assignment
9. Calendar cell updates with coverage status
```

### State Management

```typescript
// Schedule context for sharing state
interface ScheduleContextValue {
  selectedMissionId: Id<"zooMissions"> | null;
  selectedShiftId: Id<"shiftInstances"> | null;
  setSelectedShift: (id: Id<"shiftInstances"> | null) => void;
}

// In page component
const [selectedShiftId, setSelectedShiftId] = useState<Id<"shiftInstances"> | null>(null);

// Pass to components
<WeekGrid 
  onSlotSelect={setSelectedShiftId}
  selectedSlotId={selectedShiftId}
/>

<SlotPanel
  shiftId={selectedShiftId}
  isOpen={!!selectedShiftId}
  onClose={() => setSelectedShiftId(null)}
/>
```

### Real-time Updates

Convex provides real-time updates automatically:

```typescript
// When assignUser mutation completes:
// 1. shiftAssignments table updates
// 2. getShiftsForDateRange query re-runs
// 3. WeekGrid re-renders with new data
// 4. SlotPanel re-renders with new assignments
// 5. CoverageBadge updates automatically
```

### Keyboard Shortcuts

```typescript
// In schedules page
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && selectedShiftId) {
      setSelectedShiftId(null);
    }
  };
  
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [selectedShiftId]);
```

### Quick Assignment

For faster assignment, add right-click context menu:

```typescript
// components/schedule/shift-cell.tsx

<ContextMenu>
  <ContextMenuTrigger asChild>
    <button className="shift-cell" onClick={() => onSelect(shift._id)}>
      {/* cell content */}
    </button>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onClick={() => onQuickAssign(shift._id, "PRIMARY")}>
      Add Primary
    </ContextMenuItem>
    <ContextMenuItem onClick={() => onQuickAssign(shift._id, "BACKUP")}>
      Add Backup
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem onClick={() => onMarkCallout(shift._id)}>
      Mark Call-out
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

## Files Modified

- `app/(app)/schedules/page.tsx` - Integration
- `components/schedule/shift-cell.tsx` - Context menu
- `components/schedule/slot-panel.tsx` - Refinements

## Dependencies

- US-3.1: Week Grid Calendar
- US-3.3: Slot Assignment Panel
- US-2.2: Crew Membership APIs (for filtering)

## Estimate

Large (L)
