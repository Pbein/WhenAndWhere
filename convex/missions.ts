import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./rbac";

// Helper to get effective status from mission (handles legacy 'active' field)
function getEffectiveStatus(mission: {
  status?: "ACTIVE" | "PAUSED" | "TERMINATED";
  active?: boolean;
}): "ACTIVE" | "PAUSED" | "TERMINATED" {
  if (mission.status) {
    return mission.status;
  }
  // Fallback to legacy 'active' field
  return mission.active === false ? "TERMINATED" : "ACTIVE";
}

/**
 * List all missions with normalized status
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    const missions = await ctx.db.query("zooMissions").collect();
    // Normalize status for backwards compatibility
    return missions.map((m) => ({
      ...m,
      status: getEffectiveStatus(m),
    }));
  },
});

/**
 * Get a single mission by ID
 */
export const get = query({
  args: { id: v.id("zooMissions") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.get(args.id);
  },
});

/**
 * List only active missions (status === "ACTIVE" or legacy active === true)
 */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    const missions = await ctx.db.query("zooMissions").collect();
    // Filter for active missions, handling both new status and legacy active field
    return missions
      .filter((m) => getEffectiveStatus(m) === "ACTIVE")
      .map((m) => ({
        ...m,
        status: getEffectiveStatus(m),
      }));
  },
});

/**
 * List missions by status
 */
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("ACTIVE"),
      v.literal("PAUSED"),
      v.literal("TERMINATED")
    ),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const missions = await ctx.db.query("zooMissions").collect();
    // Filter by effective status
    return missions
      .filter((m) => getEffectiveStatus(m) === args.status)
      .map((m) => ({
        ...m,
        status: getEffectiveStatus(m),
      }));
  },
});

/**
 * Create a new mission
 */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    color: v.optional(v.string()),
    timezone: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("ACTIVE"),
        v.literal("PAUSED"),
        v.literal("TERMINATED")
      )
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    return await ctx.db.insert("zooMissions", {
      name: args.name,
      description: args.description,
      color: args.color,
      timezone: args.timezone,
      status: args.status ?? "ACTIVE", // Default to ACTIVE
      startDate: args.startDate,
      endDate: args.endDate,
    });
  },
});

/**
 * Update an existing mission
 */
export const update = mutation({
  args: {
    id: v.id("zooMissions"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    timezone: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("ACTIVE"),
        v.literal("PAUSED"),
        v.literal("TERMINATED")
      )
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    activeTemplateId: v.optional(v.id("scheduleTemplates")),
    cycleAnchorDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    const { id, ...updates } = args;

    // If terminating, set terminatedAt timestamp
    if (updates.status === "TERMINATED") {
      await ctx.db.patch(id, {
        ...updates,
        terminatedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(id, updates);
    }
  },
});

/**
 * Pause a mission
 */
export const pause = mutation({
  args: { id: v.id("zooMissions") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    await ctx.db.patch(args.id, { status: "PAUSED" });
  },
});

/**
 * Resume a paused mission
 */
export const resume = mutation({
  args: { id: v.id("zooMissions") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    await ctx.db.patch(args.id, { status: "ACTIVE" });
  },
});

/**
 * Terminate a mission (soft delete)
 */
export const terminate = mutation({
  args: { id: v.id("zooMissions") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["OperationsLead", "Admin"]);
    await ctx.db.patch(args.id, {
      status: "TERMINATED",
      terminatedAt: Date.now(),
    });
  },
});

/**
 * Set the active template for a mission (for schedule generation)
 */
export const setActiveTemplate = mutation({
  args: {
    missionId: v.id("zooMissions"),
    templateId: v.id("scheduleTemplates"),
    cycleAnchorDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    await ctx.db.patch(args.missionId, {
      activeTemplateId: args.templateId,
      cycleAnchorDate: args.cycleAnchorDate ?? Date.now(),
    });
  },
});

/**
 * Remove a mission (hard delete - Admin only)
 */
export const remove = mutation({
  args: { id: v.id("zooMissions") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Admin"]);
    await ctx.db.delete(args.id);
  },
});

/**
 * Migrate legacy missions from 'active' boolean to 'status' enum
 * Run this once to migrate existing data
 */
export const migrateToStatus = mutation({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["Admin"]);
    const missions = await ctx.db.query("zooMissions").collect();
    let migrated = 0;

    for (const mission of missions) {
      // Only migrate if status is not already set
      if (!mission.status) {
        await ctx.db.patch(mission._id, {
          status: mission.active === false ? "TERMINATED" : "ACTIVE",
        });
        migrated++;
      }
    }

    return { migrated, total: missions.length };
  },
});
