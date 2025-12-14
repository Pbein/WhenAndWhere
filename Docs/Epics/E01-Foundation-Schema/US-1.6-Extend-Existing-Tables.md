# US-1.6: Extend Existing Tables ✅ COMPLETE

## User Story

**As a** developer  
**I want** to extend existing schema tables with missing fields  
**So that** all required data can be stored properly

## Status

**✅ COMPLETE** - Deployed December 14, 2024

## Priority

P0 - Required for complete data model

## Acceptance Criteria

- [x] `shiftAssignments.role` includes ON_CALL option
- [x] `users` table has `status` field (ACTIVE, ON_LEAVE, INACTIVE)
- [x] `shiftInstances` has optional `requiredQualificationIds` array
- [x] `teams` table has additional metadata fields (shiftPreference, color)

## Implementation Notes

- All new fields are optional to maintain backward compatibility
- Added `PENDING_APPROVAL` status to `shiftInstances` for approval workflow
- Types exported in `convex/lib/types.ts`
- Added `by_status` index to users table

## Files Modified

- `convex/schema.ts`
- `convex/lib/types.ts` - Added ASSIGNMENT_ROLE, USER_STATUS, SHIFT_PREFERENCE constants
