import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./rbac";

export const listByMission = query({
  args: { missionId: v.id("zooMissions") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("shiftDefinitions")
      .withIndex("by_mission", (q) => q.eq("missionId", args.missionId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("shiftDefinitions") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    missionId: v.id("zooMissions"),
    label: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    minPrimary: v.number(),
    minBackup: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    return await ctx.db.insert("shiftDefinitions", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("shiftDefinitions"),
    label: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    minPrimary: v.optional(v.number()),
    minBackup: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("shiftDefinitions") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Admin"]);
    await ctx.db.delete(args.id);
  },
});











