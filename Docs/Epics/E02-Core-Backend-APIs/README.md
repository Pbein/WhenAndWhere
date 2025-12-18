# Epic 02: Core Backend APIs

## Overview

Build all Convex mutations and queries needed to support the scheduling application. These APIs power all UI interactions.

## Priority

**Phase 2** - Requires E01 (Schema) to be complete.

## Dependencies

- E01: Foundation Schema

## User Stories

| ID | Title | Priority | Estimate |
|----|-------|----------|----------|
| US-2.1 | Continuous Schedule Generation API | P0 | M |
| US-2.2 | Crew Membership APIs | P0 | S |
| US-2.3 | Qualification APIs | P0 | S |
| US-2.4 | Coverage Validation API | P0 | M |
| US-2.5 | Call-out APIs | P1 | S |
| US-2.6 | Schedule Approval APIs | P1 | S |

## Technical Notes

### API Design Principles

1. **RBAC**: All mutations use `requireRole()` for authorization
2. **Validation**: Validate inputs before database operations
3. **Idempotency**: Safe to call multiple times with same inputs
4. **Error Messages**: Clear, actionable error messages

### Shared Helper Functions

Create `convex/helpers/` directory for shared logic:

```typescript
// convex/helpers/schedule.ts
export function calculateCycleDay(anchorDate: number, targetDate: number, cycleDays: number): number
export function isShiftCovered(shift: ShiftInstance, assignments: ShiftAssignment[]): CoverageStatus

// convex/helpers/eligibility.ts
export function filterEligibleUsers(users: User[], missionId: Id, shiftDate: number): User[]
export function sortByQualificationMatch(users: User[], requiredQuals: Id[]): User[]
```

## Files Created/Modified

- `convex/schedules.ts` - Extended with new functions
- `convex/qualifications.ts` - New file
- `convex/callouts.ts` - New file
- `convex/helpers/schedule.ts` - New shared helper
- `convex/helpers/eligibility.ts` - New shared helper




