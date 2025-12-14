# Epic 01: Foundation Schema ✅ COMPLETE

## Overview

Extend the Convex schema (`convex/schema.ts`) with all required tables and fields for the complete scheduling data model. This is the foundation that all other features depend on.

## Status

**✅ COMPLETE** - Deployed December 14, 2024

## Priority

**Phase 1** - Must be completed first before any backend APIs or UI work.

## Dependencies

- None (this is the foundation)

## User Stories

| ID | Title | Priority | Estimate | Status |
|----|-------|----------|----------|--------|
| US-1.1 | Mission Lifecycle Schema | P0 | S | ✅ Complete |
| US-1.2 | User Qualifications Schema | P0 | S | ✅ Complete |
| US-1.3 | Crew Membership Schema | P0 | S | ✅ Complete |
| US-1.4 | Mission Eligibility Schema | P0 | S | ✅ Complete |
| US-1.5 | Call-out Records Schema | P0 | S | ✅ Complete |
| US-1.6 | Extend Existing Tables | P0 | S | ✅ Complete |

## Technical Notes

### Schema Design Principles

1. **Indexes**: Add indexes for all foreign key relationships and common query patterns
2. **Timestamps**: Use `v.number()` for all timestamps (Unix ms)
3. **Enums**: Use `v.union(v.literal(...))` for type-safe enums
4. **Optional fields**: Use `v.optional()` for nullable fields

### Key Relationships

```
users ──┬── userQualifications ── qualifications
        ├── crewMemberships ── teams ── zooMissions
        ├── missionEligibility ── zooMissions
        └── shiftAssignments ── shiftInstances
                                      │
zooMissions ── shiftDefinitions ──────┘
            └── scheduleTemplates
```

## Files Modified

- `convex/schema.ts` - All schema changes in this epic
- `convex/missions.ts` - Updated to use new status field with backwards compatibility
- `convex/lib/types.ts` - Added shared TypeScript type constants
- `app/(app)/missions/page.tsx` - Updated UI for new status field
- `app/(app)/dashboard/page.tsx` - Updated UI for new status field

## What Was Built

### New Tables
- `qualifications` - Certification types (e.g., "Panda-certified")
- `userQualifications` - Links users to their certifications
- `crewMemberships` - Links users to teams with primary designation
- `missionEligibility` - Controls which users can work which missions
- `callOuts` - Records shift call-outs and replacements

### Extended Tables
- `zooMissions` - Added status, timezone, activeTemplateId, cycleAnchorDate, lifecycle dates
- `users` - Added status field (ACTIVE, ON_LEAVE, INACTIVE)
- `teams` - Added shiftPreference and color
- `shiftInstances` - Added requiredQualificationIds, PENDING_APPROVAL status
- `shiftAssignments` - Added ON_CALL role

### Shared Types
- Created `convex/lib/types.ts` with all enum constants and TypeScript types
