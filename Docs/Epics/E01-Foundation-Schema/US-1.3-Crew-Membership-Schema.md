# US-1.3: Crew Membership Schema ✅ COMPLETE

## User Story

**As a** Team Lead  
**I want** employees to belong to multiple crews with a primary designation  
**So that** I can organize staff into rotating crews while allowing flexibility

## Status

**✅ COMPLETE** - Deployed December 14, 2024

## Priority

P0 - Required for crew-based scheduling

## Acceptance Criteria

- [x] `crewMemberships` table exists linking users to teams
- [x] Each membership has `isPrimary` boolean
- [x] Table indexed by userId and by teamId
- [x] An employee can belong to multiple crews
- [x] Only one crew can be marked as primary per employee

## Implementation Notes

- Added `by_user_team` composite index for efficient lookups and upserts
- Added `joinedAt` timestamp and `addedBy` for audit trail
- Business rules for primary crew enforcement to be implemented in E02 APIs

## Files Modified

- `convex/schema.ts`
