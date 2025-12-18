# Epic 05: Mission Management

## Overview

Mission detail pages and lifecycle management. Allows Team Leads to configure missions, set up schedule patterns, and manage mission lifecycle (active, paused, terminated).

## Priority

**Phase 4** - Can be built after E04 or in parallel.

## Dependencies

- E01: Foundation Schema
- E02: Core Backend APIs

## User Stories

| ID | Title | Priority | Estimate |
|----|-------|----------|----------|
| US-5.1 | Mission Detail Page | P0 | M |
| US-5.2 | Mission Lifecycle Controls | P0 | M |
| US-5.3 | Shift Definition Management | P1 | S |

## Technical Notes

### Route Structure

```
app/(app)/missions/
├── page.tsx           # Mission list (existing, enhanced)
└── [id]/
    └── page.tsx       # Mission detail (new)
```

### Mission Detail Sections

1. **Header**: Name, description, status badge, edit button
2. **Lifecycle Card**: 
   - Active template selector
   - Cycle anchor date picker
   - Start/end date configuration
   - Terminate button (with confirmation)
3. **Crews Card**: List of crews with member counts, link to manage
4. **Shift Definitions Card**: Day/Night shift times, coverage requirements
5. **Quick Actions**: View Schedule, Extend Schedule, View Coverage

### Pattern Continuity Display

Show visual indicator of current cycle position:
```
Cycle Day: 7 of 14 | Next reset: Dec 21
Pattern: ██████░░░░░░░░ (Day 7)
```

## Files Created

- `app/(app)/missions/[id]/page.tsx` - New
- `components/missions/lifecycle-card.tsx` - New
- `components/missions/shift-defs-card.tsx` - New




