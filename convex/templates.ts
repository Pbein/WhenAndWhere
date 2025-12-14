import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./rbac";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return await ctx.db.query("scheduleTemplates").collect();
  },
});

export const get = query({
  args: { id: v.id("scheduleTemplates") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    patternJson: v.string(),
    shiftLengthHours: v.number(),
    cycleDays: v.number(),
    missionId: v.optional(v.id("zooMissions")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    return await ctx.db.insert("scheduleTemplates", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("scheduleTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    patternJson: v.optional(v.string()),
    shiftLengthHours: v.optional(v.number()),
    cycleDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("scheduleTemplates") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Admin"]);
    await ctx.db.delete(args.id);
  },
});







