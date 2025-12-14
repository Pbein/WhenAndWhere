# US-2.2: Crew Membership APIs

## User Story

**As a** Team Lead  
**I want** to add and remove employees from crews  
**So that** I can organize my team into rotating groups

## Priority

P0 - Required for crew management UI

## Acceptance Criteria

- [ ] `addCrewMember` mutation adds user to a crew
- [ ] `removeCrewMember` mutation removes user from a crew
- [ ] `getCrewMembers` query returns all members of a crew with details
- [ ] `getUserCrews` query returns all crews a user belongs to
- [ ] `setPrimaryCrew` mutation changes which crew is primary
- [ ] Business rule: only one primary crew per user is enforced

## Technical Details

### New Functions

```typescript
// convex/teams.ts

export const addCrewMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
    isPrimary: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    
    // Check if already a member
    const existing = await ctx.db
      .query("crewMemberships")
      .withIndex("by_user_team", q => 
        q.eq("userId", args.userId).eq("teamId", args.teamId)
      )
      .first();
    
    if (existing) {
      throw new Error("User is already a member of this crew");
    }
    
    // If isPrimary, clear other primaries
    const isPrimary = args.isPrimary ?? false;
    if (isPrimary) {
      await clearPrimaryCrew(ctx, args.userId);
    }
    
    // Check if user has no crews (make this one primary)
    const userCrews = await ctx.db
      .query("crewMemberships")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect();
    
    const shouldBePrimary = isPrimary || userCrews.length === 0;
    
    return await ctx.db.insert("crewMemberships", {
      teamId: args.teamId,
      userId: args.userId,
      isPrimary: shouldBePrimary,
      joinedAt: Date.now(),
    });
  },
});

export const removeCrewMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    
    const membership = await ctx.db
      .query("crewMemberships")
      .withIndex("by_user_team", q => 
        q.eq("userId", args.userId).eq("teamId", args.teamId)
      )
      .first();
    
    if (!membership) {
      throw new Error("User is not a member of this crew");
    }
    
    await ctx.db.delete(membership._id);
    
    // If was primary, promote another crew
    if (membership.isPrimary) {
      const otherCrew = await ctx.db
        .query("crewMemberships")
        .withIndex("by_user", q => q.eq("userId", args.userId))
        .first();
      
      if (otherCrew) {
        await ctx.db.patch(otherCrew._id, { isPrimary: true });
      }
    }
  },
});

export const getCrewMembers = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    const memberships = await ctx.db
      .query("crewMemberships")
      .withIndex("by_team", q => q.eq("teamId", args.teamId))
      .collect();
    
    // Fetch user details for each member
    return await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return { ...m, user };
      })
    );
  },
});

export const setPrimaryCrew = mutation({
  args: {
    userId: v.id("users"),
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    
    // Clear existing primary
    await clearPrimaryCrew(ctx, args.userId);
    
    // Set new primary
    const membership = await ctx.db
      .query("crewMemberships")
      .withIndex("by_user_team", q => 
        q.eq("userId", args.userId).eq("teamId", args.teamId)
      )
      .first();
    
    if (!membership) {
      throw new Error("User is not a member of this crew");
    }
    
    await ctx.db.patch(membership._id, { isPrimary: true });
  },
});

// Helper function
async function clearPrimaryCrew(ctx: any, userId: Id<"users">) {
  const memberships = await ctx.db
    .query("crewMemberships")
    .withIndex("by_user", q => q.eq("userId", userId))
    .collect();
  
  for (const m of memberships) {
    if (m.isPrimary) {
      await ctx.db.patch(m._id, { isPrimary: false });
    }
  }
}
```

## Files Modified

- `convex/teams.ts`

## Dependencies

- US-1.3: Crew Membership Schema

## Estimate

Small (S)
