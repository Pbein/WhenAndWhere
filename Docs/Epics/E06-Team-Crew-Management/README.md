# Epic 06: Team & Crew Management

## Overview

Managing crew memberships, employee details, qualifications, and mission eligibility. Allows Team Leads to organize their workforce.

## Priority

**Phase 4** - Can be built after E04 or in parallel with E05.

## Dependencies

- E01: Foundation Schema
- E02: Core Backend APIs (crew membership, qualifications)

## User Stories

| ID | Title | Priority | Estimate |
|----|-------|----------|----------|
| US-6.1 | Crew Member Management | P0 | M |
| US-6.2 | Employee Detail Page | P0 | M |
| US-6.3 | Qualification Management UI | P1 | S |

## Technical Notes

### Route Structure

```
app/(app)/
├── teams/
│   └── page.tsx           # Team list with member management
├── crew/
│   ├── page.tsx           # Employee directory (existing, enhanced)
│   └── [id]/
│       └── page.tsx       # Employee detail (new)
```

### Teams Page Enhancements

Add expandable crew cards showing:
- Member list with avatars
- Add/Remove member actions
- Primary crew indicator
- Quick link to member detail

### Employee Detail Sections

1. **Profile Header**: Name, email, role, status
2. **Crew Memberships**: List with primary indicator, add/remove
3. **Mission Eligibility**: Checkboxes for each mission
4. **Qualifications**: List with status (Active/In-Training), grant/revoke
5. **Upcoming Shifts**: Next 7 days of assignments
6. **PTO History**: Recent requests and status

### Reusable Components

```typescript
// components/crew/member-picker.tsx
// Searchable multi-select for adding crew members

// components/crew/qualification-badge.tsx
// Shows qualification with status color

// components/crew/eligibility-checklist.tsx
// Mission eligibility checkboxes
```

## Files Created/Modified

- `app/(app)/teams/page.tsx` - Enhanced with member management
- `app/(app)/crew/[id]/page.tsx` - New employee detail
- `components/crew/member-picker.tsx` - New
- `components/crew/qualification-badge.tsx` - New



