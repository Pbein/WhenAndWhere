/**
 * Shared helper functions for coverage validation
 */

import { QueryCtx } from "../_generated/server";
import { Id, Doc } from "../_generated/dataModel";

export type CoverageStatus = "green" | "yellow" | "red";

export interface CoverageDetails {
  status: CoverageStatus;
  requiredPrimary: number;
  assignedPrimary: number;
  requiredBackup: number;
  assignedBackup: number;
  requiredQualifications: string[];
  missingQualifications: string[];
  message: string;
}

export interface CoverageGap {
  shiftInstanceId: Id<"shiftInstances">;
  date: number;
  shiftType: string;
  details: CoverageDetails;
}

/**
 * Calculate coverage status and details for a shift
 */
export async function getShiftCoverageDetails(
  ctx: QueryCtx,
  shiftInstanceId: Id<"shiftInstances">
): Promise<CoverageDetails> {
  const shift = await ctx.db.get(shiftInstanceId);
  if (!shift) {
    return createEmptyCoverage("Shift not found");
  }

  const shiftDef = await ctx.db.get(shift.shiftDefinitionId);
  if (!shiftDef) {
    return createEmptyCoverage("Shift definition not found");
  }

  const assignments = await ctx.db
    .query("shiftAssignments")
    .withIndex("by_shift", (q) => q.eq("shiftInstanceId", shiftInstanceId))
    .collect();

  const primaryCount = assignments.filter((a) => a.role === "PRIMARY").length;
  const backupCount = assignments.filter((a) => a.role === "BACKUP").length;

  // Determine status
  let status: CoverageStatus = "green";
  let message = "Fully covered";

  if (primaryCount < shiftDef.minPrimary) {
    status = "red";
    const needed = shiftDef.minPrimary - primaryCount;
    message = `Need ${needed} more primary`;
  } else if (backupCount < shiftDef.minBackup) {
    status = "yellow";
    const needed = shiftDef.minBackup - backupCount;
    message = `Need ${needed} more backup`;
  }

  // Check required qualifications if specified
  const requiredQuals: string[] = [];
  const missingQuals: string[] = [];

  if (shift.requiredQualificationIds && shift.requiredQualificationIds.length > 0) {
    for (const qualId of shift.requiredQualificationIds) {
      const qual = await ctx.db.get(qualId);
      if (qual) {
        requiredQuals.push(qual.name);
      }
    }

    // Check if any assigned user has the required qualifications
    const assignedUserIds = assignments.map((a) => a.userId);
    let hasRequiredQual = false;

    for (const userId of assignedUserIds) {
      const userQuals = await ctx.db
        .query("userQualifications")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("status"), "ACTIVE"))
        .collect();

      const userQualIds = userQuals.map((uq) => uq.qualificationId);
      if (shift.requiredQualificationIds.some((rq) => userQualIds.includes(rq))) {
        hasRequiredQual = true;
        break;
      }
    }

    if (!hasRequiredQual && assignedUserIds.length > 0) {
      missingQuals.push(...requiredQuals);
      if (status === "green") {
        status = "yellow";
        message = "Missing required qualification";
      }
    }
  }

  return {
    status,
    requiredPrimary: shiftDef.minPrimary,
    assignedPrimary: primaryCount,
    requiredBackup: shiftDef.minBackup,
    assignedBackup: backupCount,
    requiredQualifications: requiredQuals,
    missingQualifications: missingQuals,
    message,
  };
}

function createEmptyCoverage(message: string): CoverageDetails {
  return {
    status: "red",
    requiredPrimary: 0,
    assignedPrimary: 0,
    requiredBackup: 0,
    assignedBackup: 0,
    requiredQualifications: [],
    missingQualifications: [],
    message,
  };
}

/**
 * Determine overall health from coverage counts
 */
export function determineHealth(
  redCount: number,
  yellowCount: number
): CoverageStatus {
  if (redCount > 0) return "red";
  if (yellowCount > 0) return "yellow";
  return "green";
}



