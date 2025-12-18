# US-2.3: Qualification APIs

## User Story

**As a** Team Lead  
**I want** to manage employee qualifications  
**So that** I can track certifications and assign qualified staff

## Priority

P0 - Required for qualification-based filtering

## Acceptance Criteria

- [ ] CRUD operations for qualifications (create, list, update, delete)
- [ ] `grantQualification` mutation assigns qualification to user
- [ ] `revokeQualification` mutation removes qualification from user
- [ ] `getUserQualifications` query returns user's qualifications
- [ ] `updateQualificationStatus` mutation changes status (ACTIVE/IN_TRAINING/EXPIRED)

## Technical Details

### New File: convex/qualifications.ts

```typescript
// convex/qualifications.ts

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./rbac";

// List all qualifications
export const list = query({
  args: { missionId: v.optional(v.id("zooMissions")) },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    if (args.missionId) {
      return await ctx.db
        .query("qualifications")
        .withIndex("by_mission", q => q.eq("missionId", args.missionId))
        .collect();
    }
    
    return await ctx.db.query("qualifications").collect();
  },
});

// Create a new qualification
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    missionId: v.optional(v.id("zooMissions")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    return await ctx.db.insert("qualifications", args);
  },
});

// Grant qualification to user
export const grantToUser = mutation({
  args: {
    userId: v.id("users"),
    qualificationId: v.id("qualifications"),
    status: v.union(
      v.literal("ACTIVE"),
      v.literal("IN_TRAINING")
    ),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    
    // Check if already has this qualification
    const existing = await ctx.db
      .query("userQualifications")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("qualificationId"), args.qualificationId))
      .first();
    
    if (existing) {
      // Update status instead
      await ctx.db.patch(existing._id, { status: args.status });
      return existing._id;
    }
    
    return await ctx.db.insert("userQualifications", {
      userId: args.userId,
      qualificationId: args.qualificationId,
      status: args.status,
      grantedAt: Date.now(),
      grantedBy: currentUser._id,
    });
  },
});

// Revoke qualification from user
export const revokeFromUser = mutation({
  args: {
    userId: v.id("users"),
    qualificationId: v.id("qualifications"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    
    const existing = await ctx.db
      .query("userQualifications")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("qualificationId"), args.qualificationId))
      .first();
    
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

// Get user's qualifications
export const getUserQualifications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    const userQuals = await ctx.db
      .query("userQualifications")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect();
    
    // Fetch qualification details
    return await Promise.all(
      userQuals.map(async (uq) => {
        const qualification = await ctx.db.get(uq.qualificationId);
        return { ...uq, qualification };
      })
    );
  },
});

// Update qualification status
export const updateUserQualificationStatus = mutation({
  args: {
    userId: v.id("users"),
    qualificationId: v.id("qualifications"),
    status: v.union(
      v.literal("ACTIVE"),
      v.literal("IN_TRAINING"),
      v.literal("EXPIRED")
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    
    const existing = await ctx.db
      .query("userQualifications")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("qualificationId"), args.qualificationId))
      .first();
    
    if (!existing) {
      throw new Error("User does not have this qualification");
    }
    
    await ctx.db.patch(existing._id, { status: args.status });
  },
});
```

## Files Created

- `convex/qualifications.ts`

## Dependencies

- US-1.2: User Qualifications Schema

## Estimate

Small (S)




