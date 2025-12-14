# US-1.5: Call-out Records Schema ✅ COMPLETE

## User Story

**As a** Team Lead  
**I want** to record when employees call out of their shifts  
**So that** I can track patterns and manage replacement assignments

## Status

**✅ COMPLETE** - Deployed December 14, 2024

## Priority

P0 - Required for call-out workflow

## Acceptance Criteria

- [x] `callOuts` table exists with required fields
- [x] Links to the shift assignment being called out
- [x] Records reason and timestamp
- [x] Tracks replacement assignment if one is made
- [x] Indexed for efficient lookup by shift

## Implementation Notes

- Status workflow: PENDING → REPLACED | UNFILLED
- Indexed by `shiftAssignmentId`, `userId`, and `status` for efficient queries
- Added `resolvedAt` timestamp for tracking resolution time
- Types exported in `convex/lib/types.ts`

## Files Modified

- `convex/schema.ts`
- `convex/lib/types.ts` - Added CALLOUT_STATUS constants
