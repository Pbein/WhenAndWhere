# US-1.4: Mission Eligibility Schema ✅ COMPLETE

## User Story

**As a** Team Lead  
**I want** to control which employees can work on which missions  
**So that** only authorized staff appear as assignment options for each mission

## Status

**✅ COMPLETE** - Deployed December 14, 2024

## Priority

P0 - Required for filtering assignment recommendations

## Acceptance Criteria

- [x] `missionEligibility` table exists linking users to missions
- [x] Table indexed by userId for finding user's eligible missions
- [x] Table indexed by missionId for finding eligible users
- [x] Eligibility is a simple yes/no (presence in table = eligible)

## Implementation Notes

- Added `by_user_mission` composite index for existence checks
- Added `grantedAt` and `grantedBy` fields for audit trail
- Legacy behavior: If user has NO eligibility records, they can work on ANY mission

## Files Modified

- `convex/schema.ts`
