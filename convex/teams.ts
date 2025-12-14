import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./rbac";
import { Id } from "./_generated/dataModel";

// ============================================================================
// Team CRUD APIs
// ============================================================================

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return await ctx.db.query("teams").collect();
  },
});

export const get = query({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.get(args.id);
  },
});

export const listByMission = query({
  args: { missionId: v.id("zooMissions") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("teams")
      .withIndex("by_mission", (q) => q.eq("missionId", args.missionId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    missionId: v.id("zooMissions"),
    description: v.string(),
    focus: v.optional(v.string()),
    shiftPreference: v.optional(v.union(v.literal("DAY"), v.literal("NIGHT"), v.literal("BOTH"))),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    return await ctx.db.insert("teams", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("teams"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    focus: v.optional(v.string()),
    shiftPreference: v.optional(v.union(v.literal("DAY"), v.literal("NIGHT"), v.literal("BOTH"))),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Admin"]);
    
    // Remove all crew memberships first
    const memberships = await ctx.db
      .query("crewMemberships")
      .withIndex("by_team", (q) => q.eq("teamId", args.id))
      .collect();
    
    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }
    
    await ctx.db.delete(args.id);
  },
});

// ============================================================================
// US-2.2: Crew Membership APIs
// ============================================================================

/**
 * Add a user to a crew
 */
export const addCrewMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
    isPrimary: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);

    // Check if already a member
    const existing = await ctx.db
      .query("crewMemberships")
      .withIndex("by_user_team", (q) =>
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
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const shouldBePrimary = isPrimary || userCrews.length === 0;

    return await ctx.db.insert("crewMemberships", {
      teamId: args.teamId,
      userId: args.userId,
      isPrimary: shouldBePrimary,
      joinedAt: Date.now(),
      addedBy: currentUser._id,
    });
  },
});

/**
 * Remove a user from a crew
 */
export const removeCrewMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);

    const membership = await ctx.db
      .query("crewMemberships")
      .withIndex("by_user_team", (q) =>
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
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();

      if (otherCrew) {
        await ctx.db.patch(otherCrew._id, { isPrimary: true });
      }
    }
  },
});

/**
 * Get all members of a crew with user details
 */
export const getCrewMembers = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const memberships = await ctx.db
      .query("crewMemberships")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    // Fetch user details and qualifications for each member
    return await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        const userQuals = await ctx.db
          .query("userQualifications")
          .withIndex("by_user", (q) => q.eq("userId", m.userId))
          .collect();
        const qualifications = await Promise.all(
          userQuals.map(async (uq) => ({
            ...uq,
            qualification: await ctx.db.get(uq.qualificationId),
          }))
        );
        return { ...m, user, qualifications };
      })
    );
  },
});

/**
 * Get all crews a user belongs to
 */
export const getUserCrews = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const memberships = await ctx.db
      .query("crewMemberships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Fetch team details for each membership
    return await Promise.all(
      memberships.map(async (m) => {
        const team = await ctx.db.get(m.teamId);
        const mission = team ? await ctx.db.get(team.missionId) : null;
        return { ...m, team, mission };
      })
    );
  },
});

/**
 * Set a crew as the user's primary crew
 */
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
      .withIndex("by_user_team", (q) =>
        q.eq("userId", args.userId).eq("teamId", args.teamId)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this crew");
    }

    await ctx.db.patch(membership._id, { isPrimary: true });
  },
});

/**
 * Get team with member count
 */
export const getTeamWithMemberCount = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const team = await ctx.db.get(args.teamId);
    if (!team) return null;

    const memberships = await ctx.db
      .query("crewMemberships")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const mission = await ctx.db.get(team.missionId);

    return {
      ...team,
      memberCount: memberships.length,
      mission,
    };
  },
});

// Helper function to clear primary crew status for a user
async function clearPrimaryCrew(ctx: any, userId: Id<"users">) {
  const memberships = await ctx.db
    .query("crewMemberships")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();

  for (const m of memberships) {
    if (m.isPrimary) {
      await ctx.db.patch(m._id, { isPrimary: false });
    }
  }
}
