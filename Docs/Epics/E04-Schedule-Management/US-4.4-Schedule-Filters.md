# US-4.4: Schedules Page - Filters

## User Story

**As a** Team Lead  
**I want** to filter the schedule view  
**So that** I can focus on specific crews, shift types, or unassigned slots

## Priority

P1 - Important for usability with large schedules

## Acceptance Criteria

- [ ] Filter by crew (multi-select)
- [ ] Filter by shift type (Day/Night/All)
- [ ] Filter to show only unassigned slots
- [ ] Filters persist during view changes
- [ ] Clear all filters button
- [ ] Filter state shown in header
- [ ] Filtered count displayed

## Technical Details

### Filter State

```typescript
interface ScheduleFilters {
  crewIds: Id<"teams">[];
  shiftType: "day" | "night" | "all";
  showUnassignedOnly: boolean;
}

const defaultFilters: ScheduleFilters = {
  crewIds: [],
  shiftType: "all",
  showUnassignedOnly: false,
};
```

### Filter Bar Component

```typescript
// components/schedule/filter-bar.tsx

interface FilterBarProps {
  filters: ScheduleFilters;
  onFiltersChange: (filters: ScheduleFilters) => void;
  crews: Team[] | undefined;
  missionId: Id<"zooMissions"> | null;
}

export function FilterBar({ filters, onFiltersChange, crews }: FilterBarProps) {
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.crewIds.length > 0) count++;
    if (filters.shiftType !== "all") count++;
    if (filters.showUnassignedOnly) count++;
    return count;
  }, [filters]);
  
  return (
    <div className="flex items-center gap-3 p-3 border-b border-[#2a2a2a] bg-[#111111]">
      {/* Crew filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            Crews
            {filters.crewIds.length > 0 && (
              <Badge className="ml-1">{filters.crewIds.length}</Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="space-y-2">
            {crews?.map(crew => (
              <label key={crew._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.crewIds.includes(crew._id)}
                  onChange={e => {
                    const newCrewIds = e.target.checked
                      ? [...filters.crewIds, crew._id]
                      : filters.crewIds.filter(id => id !== crew._id);
                    onFiltersChange({ ...filters, crewIds: newCrewIds });
                  }}
                />
                <span className="text-sm">{crew.name}</span>
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Shift type filter */}
      <select
        value={filters.shiftType}
        onChange={e => onFiltersChange({ 
          ...filters, 
          shiftType: e.target.value as "day" | "night" | "all" 
        })}
        className="rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-2 py-1 text-sm"
      >
        <option value="all">All Shifts</option>
        <option value="day">Day Only</option>
        <option value="night">Night Only</option>
      </select>
      
      {/* Unassigned toggle */}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={filters.showUnassignedOnly}
          onChange={e => onFiltersChange({
            ...filters,
            showUnassignedOnly: e.target.checked,
          })}
        />
        Unassigned only
      </label>
      
      {/* Clear filters */}
      {activeFilterCount > 0 && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onFiltersChange(defaultFilters)}
        >
          Clear ({activeFilterCount})
        </Button>
      )}
    </div>
  );
}
```

### Applying Filters

```typescript
// In WeekGrid or wherever shifts are rendered

const filteredShifts = useMemo(() => {
  if (!shifts) return [];
  
  return shifts.filter(shift => {
    // Crew filter
    if (filters.crewIds.length > 0 && 
        !filters.crewIds.includes(shift.teamId)) {
      return false;
    }
    
    // Shift type filter
    if (filters.shiftType !== "all") {
      const shiftDef = shiftDefinitions.get(shift.shiftDefinitionId);
      if (shiftDef?.label.toLowerCase() !== filters.shiftType) {
        return false;
      }
    }
    
    // Unassigned filter
    if (filters.showUnassignedOnly && shift.assignments.length > 0) {
      return false;
    }
    
    return true;
  });
}, [shifts, filters]);
```

### URL Persistence (Optional)

```typescript
// Persist filters in URL for sharing
import { useSearchParams } from "next/navigation";

function useFilterParams() {
  const searchParams = useSearchParams();
  
  const filters = useMemo(() => ({
    crewIds: searchParams.getAll("crew") as Id<"teams">[],
    shiftType: (searchParams.get("type") ?? "all") as ScheduleFilters["shiftType"],
    showUnassignedOnly: searchParams.get("unassigned") === "true",
  }), [searchParams]);
  
  return filters;
}
```

## Files Created

- `components/schedule/filter-bar.tsx`

## Dependencies

- US-4.1: Calendar Views Integration

## Estimate

Small (S)
