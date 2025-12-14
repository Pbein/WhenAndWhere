# US-2.6: Schedule Approval APIs

## User Story

**As an** Ops Lead  
**I want** to review and approve schedules submitted by Team Leads  
**So that** schedules become official only after verification

## Priority

P1 - Required for approval workflow

## Acceptance Criteria

- [ ] `submitForApproval` mutation marks shifts as pending approval
- [ ] `approveSchedule` mutation finalizes shifts (Ops Lead only)
- [ ] `rejectSchedule` mutation returns shifts to draft with comments
- [ ] `getPendingApprovals` query lists schedules awaiting review
- [ ] Approval is per mission + date range

## Technical Details

### Approval Flow States

```
DRAFT -> PENDING_APPROVAL -> FINAL
                          -> DRAFT (if rejected)
```

### Schema Update Needed

The `shiftInstances.status` field needs a new value:

```typescript
status: v.union(
  v.literal("DRAFT"),
  v.literal("PENDING_APPROVAL"),  // New
  v.literal("FINAL")
),
```

### New Mutations/Queries

```typescript
// convex/schedules.ts

// Submit shifts for approval
export const submitForApproval = mutation({
  args: {
    missionId: v.id("zooMissions"),
    startDate: v.number(),
    endDate: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    
    const shifts = await ctx.db
      .query("shiftInstances")
      .withIndex("by_mission_and_date", q =>
        q.eq("missionId", args.missionId).gte("dateStart", args.startDate)
      )
      .filter(q => q.lte(q.field("dateStart"), args.endDate))
      .collect();
    
    // Only submit DRAFT shifts
    const draftShifts = shifts.filter(s => s.status === "DRAFT");
    
    for (const shift of draftShifts) {
      await ctx.db.patch(shift._id, {
        status: "PENDING_APPROVAL",
        readyForApproval: true,
      });
    }
    
    return { submitted: draftShifts.length };
  },
});

// Approve shifts (Ops Lead only)
export const approveSchedule = mutation({
  args: {
    missionId: v.id("zooMissions"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["OperationsLead", "Admin"]);
    
    const shifts = await ctx.db
      .query("shiftInstances")
      .withIndex("by_mission_and_date", q =>
        q.eq("missionId", args.missionId).gte("dateStart", args.startDate)
      )
      .filter(q => 
        q.and(
          q.lte(q.field("dateStart"), args.endDate),
          q.eq(q.field("status"), "PENDING_APPROVAL")
        )
      )
      .collect();
    
    for (const shift of shifts) {
      await ctx.db.patch(shift._id, { status: "FINAL" });
    }
    
    return { approved: shifts.length };
  },
});

// Reject shifts back to draft
export const rejectSchedule = mutation({
  args: {
    missionId: v.id("zooMissions"),
    startDate: v.number(),
    endDate: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["OperationsLead", "Admin"]);
    
    const shifts = await ctx.db
      .query("shiftInstances")
      .withIndex("by_mission_and_date", q =>
        q.eq("missionId", args.missionId).gte("dateStart", args.startDate)
      )
      .filter(q => 
        q.and(
          q.lte(q.field("dateStart"), args.endDate),
          q.eq(q.field("status"), "PENDING_APPROVAL")
        )
      )
      .collect();
    
    for (const shift of shifts) {
      await ctx.db.patch(shift._id, {
        status: "DRAFT",
        readyForApproval: false,
      });
    }
    
    // TODO: Store rejection reason somewhere (notification or log)
    
    return { rejected: shifts.length, reason: args.reason };
  },
});

// Get pending approvals across all missions
export const getPendingApprovals = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["OperationsLead", "Admin"]);
    
    const pendingShifts = await ctx.db
      .query("shiftInstances")
      .withIndex("by_status", q => q.eq("status", "PENDING_APPROVAL"))
      .collect();
    
    // Group by mission
    const byMission = new Map<string, typeof pendingShifts>();
    
    for (const shift of pendingShifts) {
      const key = shift.missionId;
      if (!byMission.has(key)) {
        byMission.set(key, []);
      }
      byMission.get(key)!.push(shift);
    }
    
    // Build result with mission details
    const result = await Promise.all(
      Array.from(byMission.entries()).map(async ([missionId, shifts]) => {
        const mission = await ctx.db.get(missionId as any);
        const minDate = Math.min(...shifts.map(s => s.dateStart));
        const maxDate = Math.max(...shifts.map(s => s.dateStart));
        
        return {
          mission,
          shiftCount: shifts.length,
          dateRange: { start: minDate, end: maxDate },
        };
      })
    );
    
    return result;
  },
});
```

## Files Modified

- `convex/schema.ts` (add PENDING_APPROVAL status)
- `convex/schedules.ts`

## Dependencies

- US-1.1: Mission Lifecycle Schema (for status field pattern)

## Estimate

Small (S)
