import { UserIdentity } from "convex/server";
import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export type Role = "BasicUser" | "TeamLead" | "OperationsLead" | "Admin";

export type AuthenticatedCtx = QueryCtx | MutationCtx;

export async function getUserByClerkId(
  ctx: AuthenticatedCtx,
  clerkId: string
) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();
}

/**
 * Get the current authenticated user without throwing.
 * Returns { identity, user } if fully authenticated and synced,
 * or { identity, user: null } if authenticated but not yet synced,
 * or null if not authenticated at all.
 */
export async function getAuth(ctx: AuthenticatedCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  const user = await getUserByClerkId(ctx, identity.subject);
  return { identity, user };
}

/**
 * Require authentication. Throws if not authenticated.
 * If throwIfNotSynced is false (default), returns null user if not yet in database.
 * If throwIfNotSynced is true, throws if user is not in database.
 */
export async function requireAuth(ctx: AuthenticatedCtx, options?: { throwIfNotSynced?: boolean }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const user = await getUserByClerkId(ctx, identity.subject);
  if (!user && options?.throwIfNotSynced) {
    throw new Error("User not found in database");
  }
  return { identity, user };
}

export async function requireRole(ctx: AuthenticatedCtx, allowedRoles: Role[]) {
  const { user } = await requireAuth(ctx, { throwIfNotSynced: true });
  if (!user) {
    throw new Error("User not found in database");
  }
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Insufficient permissions. Required: ${allowedRoles.join(", ")}`);
  }
  return user;
}

export function canManageMission(
  role: Role,
  missionId: Id<"zooMissions">,
  defaultMissionId?: Id<"zooMissions">
): boolean {
  if (role === "Admin" || role === "OperationsLead") return true;
  if (role === "TeamLead" && defaultMissionId === missionId) return true;
  return false;
}











