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

/**
 * Get all users with their qualifications, crew memberships, and mission eligibility
 * Used for the Roster view
 */
export const listWithDetails = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    
    const users = await ctx.db.query("users").collect();
    
    // Fetch all related data for each user
    return await Promise.all(
      users.map(async (user) => {
        // Get qualifications
        const userQualifications = await ctx.db
          .query("userQualifications")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        
        const qualifications = await Promise.all(
          userQualifications.map(async (uq) => {
            const qualification = await ctx.db.get(uq.qualificationId);
            return { ...uq, qualification };
          })
        );
        
        // Get crew memberships
        const memberships = await ctx.db
          .query("crewMemberships")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        
        const crews = await Promise.all(
          memberships.map(async (m) => {
            const team = await ctx.db.get(m.teamId);
            const mission = team ? await ctx.db.get(team.missionId) : null;
            return { ...m, team, mission };
          })
        );
        
        // Get mission eligibility
        const eligibilities = await ctx.db
          .query("missionEligibility")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        
        const eligibleMissions = await Promise.all(
          eligibilities.map(async (e) => {
            const mission = await ctx.db.get(e.missionId);
            return { ...e, mission };
          })
        );
        
        // Get pending PTO requests count
        const ptoRequests = await ctx.db
          .query("ptoRequests")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        
        const pendingPtoCount = ptoRequests.filter(r => r.status === "PENDING").length;
        const approvedPtoCount = ptoRequests.filter(r => r.status === "APPROVED").length;
        
        return {
          ...user,
          qualifications,
          crews,
          eligibleMissions,
          pendingPtoCount,
          approvedPtoCount,
        };
      })
    );
  },
});











