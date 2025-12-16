# US-7.2: Visual Pattern Builder

## User Story

**As a** Team Lead  
**I want** a visual editor to define shift patterns  
**So that** I can create and modify rotation schedules intuitively

## Priority

P1 - Nice to have for custom patterns

## Acceptance Criteria

- [ ] Visual grid showing days vs crews
- [ ] Click cells to toggle Day/Night/Off
- [ ] Color-coded cells by shift type
- [ ] Preview pattern output
- [ ] Save pattern to template
- [ ] Load from presets

## Technical Details

### Pattern Builder Component

```typescript
// components/templates/pattern-builder.tsx

interface PatternBuilderProps {
  cycleDays: number;
  crews: string[];  // ["A", "B", "C", "D"]
  initialPattern: PatternDay[];
  onChange: (pattern: PatternDay[]) => void;
}

type ShiftState = "off" | "day" | "night";

export function PatternBuilder({ 
  cycleDays, 
  crews,
  initialPattern,
  onChange 
}: PatternBuilderProps) {
  const [pattern, setPattern] = useState<Map<string, ShiftState[]>>(() => {
    // Initialize from initialPattern or empty
    const map = new Map<string, ShiftState[]>();
    crews.forEach(crew => {
      map.set(crew, Array(cycleDays).fill("off"));
    });
    // Apply initial pattern
    initialPattern.forEach(p => {
      const crewPattern = map.get(p.crewId);
      if (crewPattern) {
        crewPattern[p.dayIndex] = p.work 
          ? (p.shiftType === "day" ? "day" : "night")
          : "off";
      }
    });
    return map;
  });
  
  const cycleCell = (crew: string, dayIndex: number) => {
    const crewPattern = [...(pattern.get(crew) ?? [])];
    const current = crewPattern[dayIndex];
    const next: ShiftState = 
      current === "off" ? "day" :
      current === "day" ? "night" : "off";
    crewPattern[dayIndex] = next;
    
    const newPattern = new Map(pattern);
    newPattern.set(crew, crewPattern);
    setPattern(newPattern);
    
    // Convert to PatternDay[] for onChange
    onChange(patternMapToArray(newPattern));
  };
  
  return (
    <div className="pattern-builder">
      {/* Header row with day numbers */}
      <div className="grid gap-1" style={{ 
        gridTemplateColumns: `80px repeat(${cycleDays}, 1fr)` 
      }}>
        <div className="text-xs text-[#a1a1aa] p-2">Crew</div>
        {Array.from({ length: cycleDays }).map((_, i) => (
          <div 
            key={i} 
            className="text-xs text-[#a1a1aa] p-2 text-center"
          >
            Day {i + 1}
          </div>
        ))}
        
        {/* Crew rows */}
        {crews.map(crew => (
          <React.Fragment key={crew}>
            <div className="text-sm font-medium text-[#f5f5f5] p-2">
              Crew {crew}
            </div>
            {(pattern.get(crew) ?? []).map((state, dayIndex) => (
              <PatternCell
                key={dayIndex}
                state={state}
                onClick={() => cycleCell(crew, dayIndex)}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#2a2a2a]">
        <div className="text-xs text-[#a1a1aa]">Click cells to cycle:</div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-[#2a2a2a]" />
          <span className="text-xs">Off</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-amber-500" />
          <span className="text-xs">Day</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-indigo-500" />
          <span className="text-xs">Night</span>
        </div>
      </div>
    </div>
  );
}
```

### Pattern Cell

```typescript
// components/templates/pattern-cell.tsx

interface PatternCellProps {
  state: ShiftState;
  onClick: () => void;
}

export function PatternCell({ state, onClick }: PatternCellProps) {
  const config = {
    off: {
      bg: "bg-[#2a2a2a]",
      label: "",
    },
    day: {
      bg: "bg-amber-500",
      label: "D",
    },
    night: {
      bg: "bg-indigo-500",
      label: "N",
    },
  }[state];
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-10 rounded flex items-center justify-center",
        "text-sm font-medium text-white",
        "hover:opacity-80 transition-opacity",
        config.bg
      )}
    >
      {config.label}
    </button>
  );
}
```

### Pattern Preview

```typescript
// components/templates/pattern-preview.tsx

export function PatternPreview({ 
  pattern, 
  cycleDays 
}: { 
  pattern: PatternDay[];
  cycleDays: number;
}) {
  // Group by day to show who's on each shift
  const byDay = useMemo(() => {
    const map = new Map<number, { day: string[], night: string[] }>();
    for (let i = 0; i < cycleDays; i++) {
      map.set(i, { day: [], night: [] });
    }
    pattern.forEach(p => {
      if (p.work) {
        const dayData = map.get(p.dayIndex)!;
        if (p.shiftType === "day") {
          dayData.day.push(p.crewId);
        } else {
          dayData.night.push(p.crewId);
        }
      }
    });
    return map;
  }, [pattern, cycleDays]);
  
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-[#f5f5f5]">Pattern Preview</div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from(byDay.entries()).map(([dayIndex, crews]) => (
          <div 
            key={dayIndex}
            className="p-2 rounded bg-[#111111] text-xs"
          >
            <div className="font-medium mb-1">Day {dayIndex + 1}</div>
            <div className="text-amber-400">
              D: {crews.day.join(", ") || "-"}
            </div>
            <div className="text-indigo-400">
              N: {crews.night.join(", ") || "-"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Preset Patterns

```typescript
// lib/template-presets.ts

export const PANAMA_2_2_3: PatternDay[] = [
  // Crew A: 2 on, 2 off, 3 on, 2 off, 2 on, 3 off (days)
  { dayIndex: 0, crewId: "A", work: true, shiftType: "day" },
  { dayIndex: 1, crewId: "A", work: true, shiftType: "day" },
  { dayIndex: 2, crewId: "A", work: false, shiftType: "day" },
  { dayIndex: 3, crewId: "A", work: false, shiftType: "day" },
  { dayIndex: 4, crewId: "A", work: true, shiftType: "day" },
  { dayIndex: 5, crewId: "A", work: true, shiftType: "day" },
  { dayIndex: 6, crewId: "A", work: true, shiftType: "day" },
  { dayIndex: 7, crewId: "A", work: false, shiftType: "day" },
  { dayIndex: 8, crewId: "A", work: false, shiftType: "day" },
  { dayIndex: 9, crewId: "A", work: true, shiftType: "day" },
  { dayIndex: 10, crewId: "A", work: true, shiftType: "day" },
  { dayIndex: 11, crewId: "A", work: false, shiftType: "day" },
  { dayIndex: 12, crewId: "A", work: false, shiftType: "day" },
  { dayIndex: 13, crewId: "A", work: false, shiftType: "day" },
  // ... similar for Crews B, C, D with offset patterns
];

export const PRESETS = {
  panama: {
    name: "Panama 2-2-3",
    description: "4 crews, 14-day cycle, 2-2-3-2-2-3 pattern",
    cycleDays: 14,
    shiftLengthHours: 12,
    pattern: PANAMA_2_2_3,
  },
  // ... more presets
};
```

## Files Created

- `components/templates/pattern-builder.tsx`
- `components/templates/pattern-cell.tsx`
- `components/templates/pattern-preview.tsx`
- `lib/template-presets.ts`

## Dependencies

- US-7.1: Template List & CRUD

## Estimate

Large (L)



