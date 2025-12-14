# Epic 09: Advanced Workflows

## Overview

Complex business workflows: PTO conflict detection, real-time call-out handling, and schedule approval flow for Ops Leads.

## Priority

**Phase 6** - Final phase, builds on all previous work.

## Dependencies

- E02: Core Backend APIs (all)
- E03: Shared UI Components
- E04: Schedule Management

## User Stories

| ID | Title | Priority | Estimate |
|----|-------|----------|----------|
| US-9.1 | PTO Conflict Detection | P1 | M |
| US-9.2 | Call-out Workflow | P1 | L |
| US-9.3 | Schedule Approval Flow | P0 | M |

## Technical Notes

### PTO Conflict Detection Flow

```
1. Team Lead approves PTO request
2. System checks for shift conflicts
3. If conflicts exist:
   a. Show modal with affected shifts
   b. Options: "Approve anyway" or "Find replacements first"
   c. If approved: shifts marked as gaps
4. System prompts to find replacements
```

### Call-out Workflow

Real-time handling when an employee can't make their shift:

```
1. Select assigned shift on calendar
2. Click "Mark Call-out" in slot panel
3. Enter reason (optional)
4. Shift turns red/unassigned
5. Panel shows recommended replacements
6. One-click to assign replacement
7. Notification sent to replacement
```

### Approval Flow (Ops Lead)

```
1. Team Lead clicks "Submit for Approval" on schedule
2. Schedule status changes to "PENDING_APPROVAL"
3. Ops Lead sees notification on dashboard
4. Ops Lead reviews:
   - Calendar view with coverage status
   - Any gaps highlighted
   - Comments from Team Lead
5. Approve or Reject with comments
6. Schedule becomes FINAL or returns to DRAFT
```

### New Route: Approvals Page

```
app/(app)/approvals/page.tsx

Sections:
- Pending Approvals list (grouped by mission)
- Click to expand: calendar preview
- Approve/Reject buttons with comment modal
```

## Files Created

- `app/(app)/approvals/page.tsx` - New
- `components/pto/conflict-modal.tsx` - New
- `components/schedule/callout-panel.tsx` - New
- `components/approvals/approval-card.tsx` - New
