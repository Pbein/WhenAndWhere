import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./rbac";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    return await ctx.db.query("ptoRequests").collect();
  },
});

export const myRequests = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireAuth(ctx, { throwIfNotSynced: true });
    if (!user) {
      throw new Error("User not found");
    }
    return await ctx.db
      .query("ptoRequests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const pending = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    return await ctx.db
      .query("ptoRequests")
      .withIndex("by_status", (q) => q.eq("status", "PENDING"))
      .collect();
  },
});

export const request = mutation({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAuth(ctx, { throwIfNotSynced: true });
    if (!user) {
      throw new Error("User not found");
    }
    return await ctx.db.insert("ptoRequests", {
      userId: user._id,
      startDate: args.startDate,
      endDate: args.endDate,
      status: "PENDING",
      reason: args.reason,
      requestedBy: user._id,
    });
  },
});

export const approve = mutation({
  args: { requestId: v.id("ptoRequests") },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    await ctx.db.patch(args.requestId, {
      status: "APPROVED",
      decidedBy: user._id,
    });
  },
});

export const deny = mutation({
  args: { requestId: v.id("ptoRequests") },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    await ctx.db.patch(args.requestId, {
      status: "DENIED",
      decidedBy: user._id,
    });
  },
});

export const cancel = mutation({
  args: { requestId: v.id("ptoRequests") },
  handler: async (ctx, args) => {
    const { user } = await requireAuth(ctx, { throwIfNotSynced: true });
    if (!user) {
      throw new Error("User not found");
    }
    const request = await ctx.db.get(args.requestId);
    if (!request || request.userId !== user._id) {
      throw new Error("Not authorized to cancel this request");
    }
    if (request.status !== "PENDING") {
      throw new Error("Can only cancel pending requests");
    }
    await ctx.db.delete(args.requestId);
  },
});

/**
 * Get PTO history for a specific user
 */
export const getUserHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const requests = await ctx.db
      .query("ptoRequests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Sort by start date descending
    return requests.sort((a, b) => b.startDate - a.startDate);
  },
});











