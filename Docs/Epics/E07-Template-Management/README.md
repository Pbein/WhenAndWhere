# Epic 07: Template Management

## Overview

Creating and editing schedule templates like Panama 2-2-3. Includes a visual pattern builder for defining rotation patterns.

## Priority

**Phase 4** - Can be built in parallel with E05/E06.

## Dependencies

- E01: Foundation Schema
- E02: Core Backend APIs

## User Stories

| ID | Title | Priority | Estimate |
|----|-------|----------|----------|
| US-7.1 | Template List & CRUD | P0 | S |
| US-7.2 | Visual Pattern Builder | P1 | L |

## Technical Notes

### Pattern Data Structure

```typescript
interface PatternDay {
  dayIndex: number;          // 0-13 for Panama
  crewId: string;            // "A", "B", "C", "D"
  work: boolean;             // Working or off
  shiftType: "day" | "night";
}

// Example Panama pattern (simplified for one crew)
const panamaCrewA = [
  { dayIndex: 0, work: true, shiftType: "day" },
  { dayIndex: 1, work: true, shiftType: "day" },
  { dayIndex: 2, work: false, shiftType: "day" },
  { dayIndex: 3, work: false, shiftType: "day" },
  // ... continues for 14 days
];
```

### Visual Pattern Builder

Interactive grid for building patterns:

```
         Day 1  Day 2  Day 3  Day 4  Day 5  Day 6  Day 7
Crew A   [D]    [D]    [ ]    [ ]    [D]    [D]    [D]
Crew B   [ ]    [ ]    [D]    [D]    [D]    [ ]    [ ]
Crew C   [N]    [N]    [ ]    [ ]    [N]    [N]    [N]
Crew D   [ ]    [ ]    [N]    [N]    [N]    [ ]    [ ]

Legend: [D] = Day shift, [N] = Night shift, [ ] = Off
Click to cycle through states
```

### Presets

Offer common patterns as presets:
- Panama 2-2-3 (4 crews, 14-day cycle)
- DuPont (4 crews, 28-day cycle)
- Custom (blank canvas)

## Files Created/Modified

- `app/(app)/templates/page.tsx` - Enhanced with CRUD
- `components/templates/pattern-builder.tsx` - New visual editor
- `components/templates/pattern-preview.tsx` - Read-only preview
- `lib/template-presets.ts` - Preset pattern definitions




