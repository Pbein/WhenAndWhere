import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./rbac";

// ============================================================================
// US-2.3: Qualification APIs
// ============================================================================

/**
 * List all qualifications, optionally filtered by mission
 */
export const list = query({
  args: { missionId: v.optional(v.id("zooMissions")) },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    if (args.missionId) {
      // Get mission-specific and global qualifications
      const missionQuals = await ctx.db
        .query("qualifications")
        .withIndex("by_mission", (q) => q.eq("missionId", args.missionId))
        .collect();

      const globalQuals = await ctx.db
        .query("qualifications")
        .withIndex("by_mission", (q) => q.eq("missionId", undefined))
        .collect();

      return [...missionQuals, ...globalQuals];
    }

    return await ctx.db.query("qualifications").collect();
  },
});

/**
 * Get a single qualification by ID
 */
export const get = query({
  args: { id: v.id("qualifications") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.get(args.id);
  },
});

/**
 * Create a new qualification
 */
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

/**
 * Update a qualification
 */
export const update = mutation({
  args: {
    id: v.id("qualifications"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

/**
 * Delete a qualification
 */
export const remove = mutation({
  args: { id: v.id("qualifications") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Admin"]);

    // Remove all user qualifications first
    const userQuals = await ctx.db
      .query("userQualifications")
      .withIndex("by_qualification", (q) => q.eq("qualificationId", args.id))
      .collect();

    for (const uq of userQuals) {
      await ctx.db.delete(uq._id);
    }

    await ctx.db.delete(args.id);
  },
});

/**
 * Grant a qualification to a user
 */
export const grantToUser = mutation({
  args: {
    userId: v.id("users"),
    qualificationId: v.id("qualifications"),
    status: v.union(v.literal("ACTIVE"), v.literal("IN_TRAINING")),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);

    // Check if already has this qualification
    const existing = await ctx.db
      .query("userQualifications")
      .withIndex("by_user_qualification", (q) =>
        q.eq("userId", args.userId).eq("qualificationId", args.qualificationId)
      )
      .first();

    if (existing) {
      // Update status instead of creating duplicate
      await ctx.db.patch(existing._id, {
        status: args.status,
        expiresAt: args.expiresAt,
      });
      return existing._id;
    }

    return await ctx.db.insert("userQualifications", {
      userId: args.userId,
      qualificationId: args.qualificationId,
      status: args.status,
      grantedAt: Date.now(),
      expiresAt: args.expiresAt,
      grantedBy: currentUser._id,
    });
  },
});

/**
 * Revoke a qualification from a user
 */
export const revokeFromUser = mutation({
  args: {
    userId: v.id("users"),
    qualificationId: v.id("qualifications"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);

    const existing = await ctx.db
      .query("userQualifications")
      .withIndex("by_user_qualification", (q) =>
        q.eq("userId", args.userId).eq("qualificationId", args.qualificationId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

/**
 * Get all qualifications for a user
 */
export const getUserQualifications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const userQuals = await ctx.db
      .query("userQualifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
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

/**
 * Update a user's qualification status
 */
export const updateUserQualificationStatus = mutation({
  args: {
    userId: v.id("users"),
    qualificationId: v.id("qualifications"),
    status: v.union(v.literal("ACTIVE"), v.literal("IN_TRAINING"), v.literal("EXPIRED")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);

    const existing = await ctx.db
      .query("userQualifications")
      .withIndex("by_user_qualification", (q) =>
        q.eq("userId", args.userId).eq("qualificationId", args.qualificationId)
      )
      .first();

    if (!existing) {
      throw new Error("User does not have this qualification");
    }

    await ctx.db.patch(existing._id, { status: args.status });
  },
});

/**
 * Get all users with a specific qualification
 */
export const getUsersWithQualification = query({
  args: {
    qualificationId: v.id("qualifications"),
    status: v.optional(
      v.union(v.literal("ACTIVE"), v.literal("IN_TRAINING"), v.literal("EXPIRED"))
    ),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    let userQuals = await ctx.db
      .query("userQualifications")
      .withIndex("by_qualification", (q) => q.eq("qualificationId", args.qualificationId))
      .collect();

    if (args.status) {
      userQuals = userQuals.filter((uq) => uq.status === args.status);
    }

    // Fetch user details
    return await Promise.all(
      userQuals.map(async (uq) => {
        const user = await ctx.db.get(uq.userId);
        return { ...uq, user };
      })
    );
  },
});



