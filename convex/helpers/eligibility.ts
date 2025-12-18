/**
 * Shared helper functions for user eligibility and filtering
 */

import { QueryCtx } from "../_generated/server";
import { Id, Doc } from "../_generated/dataModel";

export interface EligibleCandidate {
  user: Doc<"users">;
  qualifications: Array<{
    qualification: Doc<"qualifications"> | null;
    status: string;
  }>;
  isCrewMember: boolean;
  isPrimaryCrew: boolean;
  hasRequiredQualification: boolean;
  isAvailable: boolean;
  availability: "available" | "on_pto" | "already_assigned";
}

/**
 * Get eligible candidates for a shift with sorting and filtering
 */
export async function getEligibleCandidates(
  ctx: QueryCtx,
  shiftInstanceId: Id<"shiftInstances">
): Promise<EligibleCandidate[]> {
  const shift = await ctx.db.get(shiftInstanceId);
  if (!shift) return [];

  const mission = await ctx.db.get(shift.missionId);
  if (!mission) return [];

  // Get all active users eligible for this mission
  const eligibilities = await ctx.db
    .query("missionEligibility")
    .withIndex("by_mission", (q) => q.eq("missionId", shift.missionId))
    .collect();

  const eligibleUserIds = eligibilities.map((e) => e.userId);

  // Get all active users
  const allUsers = await ctx.db.query("users").collect();
  const activeUsers = allUsers.filter(
    (u) => u.status === "ACTIVE" && eligibleUserIds.includes(u._id)
  );

  // Get current assignments for this shift
  const currentAssignments = await ctx.db
    .query("shiftAssignments")
    .withIndex("by_shift", (q) => q.eq("shiftInstanceId", shiftInstanceId))
    .collect();
  const assignedUserIds = new Set(currentAssignments.map((a) => a.userId.toString()));

  // Get team/crew info if shift has a team
  let teamMemberIds = new Set<string>();
  let primaryCrewUserIds = new Set<string>();
  
  if (shift.teamId) {
    const memberships = await ctx.db
      .query("crewMemberships")
      .withIndex("by_team", (q) => q.eq("teamId", shift.teamId!))
      .collect();
    teamMemberIds = new Set(memberships.map((m) => m.userId.toString()));
    primaryCrewUserIds = new Set(
      memberships.filter((m) => m.isPrimary).map((m) => m.userId.toString())
    );
  }

  // Get PTO for the shift date
  const ptoRequests = await ctx.db
    .query("ptoRequests")
    .withIndex("by_status", (q) => q.eq("status", "APPROVED"))
    .collect();
  
  const usersOnPto = new Set(
    ptoRequests
      .filter((pto) => pto.startDate <= shift.dateStart && pto.endDate >= shift.dateStart)
      .map((pto) => pto.userId.toString())
  );

  // Build candidate list
  const candidates: EligibleCandidate[] = await Promise.all(
    activeUsers.map(async (user) => {
      // Get user's qualifications
      const userQuals = await ctx.db
        .query("userQualifications")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      const qualsWithDetails = await Promise.all(
        userQuals.map(async (uq) => ({
          qualification: await ctx.db.get(uq.qualificationId),
          status: uq.status,
        }))
      );

      // Check if user has required qualifications
      let hasRequiredQual = true;
      if (shift.requiredQualificationIds && shift.requiredQualificationIds.length > 0) {
        const activeQualIds = userQuals
          .filter((uq) => uq.status === "ACTIVE")
          .map((uq) => uq.qualificationId.toString());
        hasRequiredQual = shift.requiredQualificationIds.some((rq) =>
          activeQualIds.includes(rq.toString())
        );
      }

      // Determine availability
      let availability: EligibleCandidate["availability"] = "available";
      if (usersOnPto.has(user._id.toString())) {
        availability = "on_pto";
      } else if (assignedUserIds.has(user._id.toString())) {
        availability = "already_assigned";
      }

      return {
        user,
        qualifications: qualsWithDetails,
        isCrewMember: teamMemberIds.has(user._id.toString()),
        isPrimaryCrew: primaryCrewUserIds.has(user._id.toString()),
        hasRequiredQualification: hasRequiredQual,
        isAvailable: availability === "available",
        availability,
      };
    })
  );

  // Sort candidates: qualified crew members first, then qualified, then others
  return candidates.sort((a, b) => {
    // Already assigned at the bottom
    if (a.availability === "already_assigned" && b.availability !== "already_assigned") return 1;
    if (b.availability === "already_assigned" && a.availability !== "already_assigned") return -1;

    // On PTO near the bottom
    if (a.availability === "on_pto" && b.availability !== "on_pto") return 1;
    if (b.availability === "on_pto" && a.availability !== "on_pto") return -1;

    // Primary crew members first
    if (a.isPrimaryCrew && !b.isPrimaryCrew) return -1;
    if (b.isPrimaryCrew && !a.isPrimaryCrew) return 1;

    // Crew members before non-crew
    if (a.isCrewMember && !b.isCrewMember) return -1;
    if (b.isCrewMember && !a.isCrewMember) return 1;

    // Qualified before unqualified
    if (a.hasRequiredQualification && !b.hasRequiredQualification) return -1;
    if (b.hasRequiredQualification && !a.hasRequiredQualification) return 1;

    // Alphabetical by name
    return (a.user.name ?? "").localeCompare(b.user.name ?? "");
  });
}




