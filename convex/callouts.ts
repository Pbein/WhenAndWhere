import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./rbac";

// ============================================================================
// US-2.5: Call-out APIs
// ============================================================================

/**
 * Report a call-out for a shift assignment
 */
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
      .withIndex("by_shift_assignment", (q) =>
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

    // Mark assignment with a note
    const existingNotes = assignment.notes ?? "";
    await ctx.db.patch(args.shiftAssignmentId, {
      notes: existingNotes + (existingNotes ? " " : "") + "[CALLED OUT]",
    });

    return calloutId;
  },
});

/**
 * Assign a replacement for a call-out
 */
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
      notes: "Replacement for call-out",
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

/**
 * Mark a call-out as unfilled
 */
export const markUnfilled = mutation({
  args: {
    calloutId: v.id("callOuts"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);

    const callout = await ctx.db.get(args.calloutId);
    if (!callout) throw new Error("Call-out not found");

    await ctx.db.patch(args.calloutId, {
      resolvedAt: Date.now(),
      status: "UNFILLED",
    });
  },
});

/**
 * Get pending call-outs for a mission
 */
export const getPending = query({
  args: { missionId: v.id("zooMissions") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);

    const pendingCallouts = await ctx.db
      .query("callOuts")
      .withIndex("by_status", (q) => q.eq("status", "PENDING"))
      .collect();

    // Filter by mission and enrich with details
    const enriched = await Promise.all(
      pendingCallouts.map(async (callout) => {
        const assignment = await ctx.db.get(callout.shiftAssignmentId);
        if (!assignment) return null;

        const shift = await ctx.db.get(assignment.shiftInstanceId);
        if (!shift || shift.missionId !== args.missionId) return null;

        const user = await ctx.db.get(callout.userId);
        const shiftDefinition = await ctx.db.get(shift.shiftDefinitionId);
        const reportedBy = await ctx.db.get(callout.reportedBy);

        return {
          ...callout,
          assignment,
          shift,
          shiftDefinition,
          user,
          reportedByUser: reportedBy,
        };
      })
    );

    return enriched.filter(Boolean);
  },
});

/**
 * Get call-out history
 */
export const getHistory = query({
  args: {
    missionId: v.optional(v.id("zooMissions")),
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);

    let callouts;

    if (args.userId) {
      callouts = await ctx.db
        .query("callOuts")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!))
        .order("desc")
        .take(args.limit ?? 50);
    } else {
      callouts = await ctx.db
        .query("callOuts")
        .order("desc")
        .take(args.limit ?? 50);
    }

    // Filter by mission if specified and enrich with details
    const enriched = await Promise.all(
      callouts.map(async (callout) => {
        const assignment = await ctx.db.get(callout.shiftAssignmentId);
        if (!assignment) return null;

        const shift = await ctx.db.get(assignment.shiftInstanceId);
        if (!shift) return null;
        if (args.missionId && shift.missionId !== args.missionId) return null;

        const user = await ctx.db.get(callout.userId);
        const shiftDefinition = await ctx.db.get(shift.shiftDefinitionId);
        const mission = await ctx.db.get(shift.missionId);
        const replacementUser = callout.replacementUserId
          ? await ctx.db.get(callout.replacementUserId)
          : null;

        return {
          ...callout,
          assignment,
          shift,
          shiftDefinition,
          mission,
          user,
          replacementUser,
        };
      })
    );

    return enriched.filter(Boolean);
  },
});

/**
 * Get call-out statistics for a mission
 */
export const getStats = query({
  args: {
    missionId: v.id("zooMissions"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const allCallouts = await ctx.db.query("callOuts").collect();

    // Filter by mission and date range
    const filtered = await Promise.all(
      allCallouts.map(async (callout) => {
        const assignment = await ctx.db.get(callout.shiftAssignmentId);
        if (!assignment) return null;

        const shift = await ctx.db.get(assignment.shiftInstanceId);
        if (!shift || shift.missionId !== args.missionId) return null;

        if (args.startDate && callout.reportedAt < args.startDate) return null;
        if (args.endDate && callout.reportedAt > args.endDate) return null;

        return callout;
      })
    );

    const callouts = filtered.filter(Boolean);

    return {
      total: callouts.length,
      pending: callouts.filter((c) => c?.status === "PENDING").length,
      replaced: callouts.filter((c) => c?.status === "REPLACED").length,
      unfilled: callouts.filter((c) => c?.status === "UNFILLED").length,
    };
  },
});



