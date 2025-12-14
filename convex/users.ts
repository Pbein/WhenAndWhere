import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { requireAuth, requireRole } from "./rbac";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    return await ctx.db.query("users").collect();
  },
});

export const get = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.get(args.id);
  },
});

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    // Return user if found, null if not (don't throw - user may need to be synced)
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    return user;
  },
});

// Mutation to sync the current Clerk user to the Convex database
// Call this when the user is authenticated but not yet in the database
export const ensureCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (existing) {
      // Update existing user with latest info from Clerk
      await ctx.db.patch(existing._id, {
        email: identity.email ?? existing.email,
        name: identity.name ?? existing.name,
      });
      return existing._id;
    }

    // Check if this is the first user in the system
    const allUsers = await ctx.db.query("users").collect();
    const isFirstUser = allUsers.length === 0;

    // Create new user - first user becomes Admin
    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email ?? "",
      name: identity.name,
      role: isFirstUser ? "Admin" : "BasicUser",
    });
  },
});

export const updateRole = mutation({
  args: {
    id: v.id("users"),
    role: v.union(
      v.literal("BasicUser"),
      v.literal("TeamLead"),
      v.literal("OperationsLead"),
      v.literal("Admin")
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Admin"]);
    await ctx.db.patch(args.id, { role: args.role });
  },
});

export const updateDefaults = mutation({
  args: {
    id: v.id("users"),
    defaultMissionId: v.optional(v.id("zooMissions")),
    defaultTeamId: v.optional(v.id("teams")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Development helper: Promote current user to Admin (for testing)
// Remove this in production!
export const promoteToAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { role: "Admin" });
    return { success: true, message: "Promoted to Admin" };
  },
});

// Internal mutation called by Clerk webhook to sync users
export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        role: "BasicUser", // Default role
      });
    }
  },
});







