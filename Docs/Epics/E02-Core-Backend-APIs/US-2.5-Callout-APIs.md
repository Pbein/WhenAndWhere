# US-2.5: Call-out APIs

## User Story

**As a** Team Lead  
**I want** to record employee call-outs and assign replacements  
**So that** I can manage unexpected absences

## Priority

P1 - Important but not blocking initial launch

## Acceptance Criteria

- [ ] `reportCallout` mutation creates a call-out record
- [ ] `assignReplacement` mutation assigns replacement and updates status
- [ ] `getPendingCallouts` query returns unresolved call-outs for a mission
- [ ] `getCalloutHistory` query returns call-out history for reporting
- [ ] Original shift assignment is marked appropriately

## Technical Details

### New File: convex/callouts.ts

```typescript
// convex/callouts.ts

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./rbac";

// Report a call-out
export const report = mutation({
  args: {
    shiftAssignmentId: v.id("shiftAssignments"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    
    const assignment = await ctx.db.get(args.shiftAssignmentId);
    if (!assignment) throw new Error("Assignment not found");
    
    // Check for existing call-out
    const existing = await ctx.db
      .query("callOuts")
      .withIndex("by_shift_assignment", q => 
        q.eq("shiftAssignmentId", args.shiftAssignmentId)
      )
      .first();
    
    if (existing) {
      throw new Error("Call-out already recorded for this assignment");
    }
    
    // Create call-out record
    const calloutId = await ctx.db.insert("callOuts", {
      shiftAssignmentId: args.shiftAssignmentId,
      userId: assignment.userId,
      reason: args.reason,
      reportedAt: Date.now(),
      reportedBy: currentUser._id,
      status: "PENDING",
    });
    
    // Optionally mark assignment with a note
    await ctx.db.patch(args.shiftAssignmentId, {
      notes: (assignment.notes ?? "") + " [CALLED OUT]",
    });
    
    return calloutId;
  },
});

// Assign a replacement
export const assignReplacement = mutation({
  args: {
    calloutId: v.id("callOuts"),
    replacementUserId: v.id("users"),
    role: v.union(v.literal("PRIMARY"), v.literal("BACKUP"), v.literal("ON_CALL")),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    
    const callout = await ctx.db.get(args.calloutId);
    if (!callout) throw new Error("Call-out not found");
    
    const originalAssignment = await ctx.db.get(callout.shiftAssignmentId);
    if (!originalAssignment) throw new Error("Original assignment not found");
    
    // Create replacement assignment
    const replacementAssignmentId = await ctx.db.insert("shiftAssignments", {
      shiftInstanceId: originalAssignment.shiftInstanceId,
      userId: args.replacementUserId,
      role: args.role,
      notes: `Replacement for call-out`,
      createdBy: currentUser._id,
    });
    
    // Update call-out record
    await ctx.db.patch(args.calloutId, {
      replacementUserId: args.replacementUserId,
      replacementAssignmentId: replacementAssignmentId,
      resolvedAt: Date.now(),
      status: "REPLACED",
    });
    
    return replacementAssignmentId;
  },
});

// Get pending call-outs for a mission
export const getPending = query({
  args: { missionId: v.id("zooMissions") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    
    const pendingCallouts = await ctx.db
      .query("callOuts")
      .withIndex("by_status", q => q.eq("status", "PENDING"))
      .collect();
    
    // Filter by mission and enrich with details
    const enriched = await Promise.all(
      pendingCallouts.map(async (callout) => {
        const assignment = await ctx.db.get(callout.shiftAssignmentId);
        if (!assignment) return null;
        
        const shift = await ctx.db.get(assignment.shiftInstanceId);
        if (!shift || shift.missionId !== args.missionId) return null;
        
        const user = await ctx.db.get(callout.userId);
        
        return {
          ...callout,
          assignment,
          shift,
          user,
        };
      })
    );
    
    return enriched.filter(Boolean);
  },
});

// Get call-out history
export const getHistory = query({
  args: {
    missionId: v.optional(v.id("zooMissions")),
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    
    let query = ctx.db.query("callOuts");
    
    if (args.userId) {
      query = query.withIndex("by_user", q => q.eq("userId", args.userId));
    }
    
    const callouts = await query
      .order("desc")
      .take(args.limit ?? 50);
    
    // TODO: Filter by mission if specified
    
    return callouts;
  },
});
```

## Files Created

- `convex/callouts.ts`

## Dependencies

- US-1.5: Call-out Records Schema

## Estimate

Small (S)




