import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./rbac";
import { Id } from "./_generated/dataModel";
import {
  MS_PER_DAY,
  calculateCycleDay,
  createTimestamp,
  calculateShiftEnd,
} from "./helpers/schedule";
import {
  getShiftCoverageDetails,
  determineHealth,
  CoverageStatus,
  CoverageDetails,
  CoverageGap,
} from "./helpers/coverage";
import { getEligibleCandidates } from "./helpers/eligibility";

// ============================================================================
// US-2.1: Continuous Schedule Generation APIs
// ============================================================================

/**
 * Set up schedule generation for a mission with a template and anchor date
 */
export const startMissionSchedule = mutation({
  args: {
    missionId: v.id("zooMissions"),
    templateId: v.id("scheduleTemplates"),
    anchorDate: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);

    const mission = await ctx.db.get(args.missionId);
    if (!mission) throw new Error("Mission not found");

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");

    await ctx.db.patch(args.missionId, {
      activeTemplateId: args.templateId,
      cycleAnchorDate: args.anchorDate,
    });

    return { success: true };
  },
});

/**
 * Extend schedule from the last generated date to a new end date
 */
export const extendSchedule = mutation({
  args: {
    missionId: v.id("zooMissions"),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);

    const mission = await ctx.db.get(args.missionId);
    if (!mission?.activeTemplateId || !mission?.cycleAnchorDate) {
      throw new Error("Mission must have template and anchor date set");
    }

    const template = await ctx.db.get(mission.activeTemplateId);
    if (!template) throw new Error("Template not found");

    const pattern = JSON.parse(template.patternJson);

    // Get shift definitions for this mission
    const shiftDefs = await ctx.db
      .query("shiftDefinitions")
      .withIndex("by_mission", (q) => q.eq("missionId", args.missionId))
      .collect();

    if (shiftDefs.length === 0) {
      throw new Error("No shift definitions found for this mission");
    }

    // Map shift definitions by label
    const shiftDefMap = new Map(shiftDefs.map((sd) => [sd.label.toLowerCase(), sd]));

    // Get teams for this mission
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_mission", (q) => q.eq("missionId", args.missionId))
      .collect();

    // Find last generated date
    const lastShift = await ctx.db
      .query("shiftInstances")
      .withIndex("by_mission_and_date", (q) => q.eq("missionId", args.missionId))
      .order("desc")
      .first();

    const startDate = lastShift
      ? lastShift.dateStart + MS_PER_DAY
      : mission.cycleAnchorDate;

    // Generate shifts using cycle position calculation
    let currentDate = startDate;
    let count = 0;

    while (currentDate <= args.endDate) {
      const cycleDay = calculateCycleDay(
        mission.cycleAnchorDate,
        currentDate,
        template.cycleDays
      );

      // Find all pattern entries for this cycle day
      const dayPatterns = pattern.filter((p: any) => p.dayIndex === cycleDay);

      for (const dayPattern of dayPatterns) {
        if (!dayPattern.work) continue;

        // Determine shift definition
        const shiftKey = (dayPattern.shiftDefinitionKey || "day").toLowerCase();
        const shiftDef = shiftDefMap.get(shiftKey) || shiftDefs[0];

        // Determine team if specified in pattern
        let teamId: Id<"teams"> | undefined = undefined;
        if (dayPattern.crewIndex !== undefined && teams[dayPattern.crewIndex]) {
          teamId = teams[dayPattern.crewIndex]._id;
        }

        // Calculate actual start and end times
        const dateStart = createTimestamp(currentDate, shiftDef.startTime);
        const dateEnd = calculateShiftEnd(currentDate, shiftDef.startTime, shiftDef.endTime);

        // Check if shift already exists
        const existing = await ctx.db
          .query("shiftInstances")
          .withIndex("by_mission_and_date", (q) =>
            q.eq("missionId", args.missionId).eq("dateStart", dateStart)
          )
          .filter((q) =>
            q.and(
              q.eq(q.field("shiftDefinitionId"), shiftDef._id),
              teamId ? q.eq(q.field("teamId"), teamId) : true
            )
          )
          .first();

        if (!existing) {
          await ctx.db.insert("shiftInstances", {
            missionId: args.missionId,
            teamId,
            shiftDefinitionId: shiftDef._id,
            dateStart,
            dateEnd,
            status: "DRAFT",
            readyForApproval: false,
            generatedFromTemplateId: template._id,
          });
          count++;
        }
      }

      currentDate += MS_PER_DAY;
    }

    return { generated: count };
  },
});

/**
 * Get the furthest date with generated shifts for a mission
 */
export const getLastGeneratedDate = query({
  args: { missionId: v.id("zooMissions") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const lastShift = await ctx.db
      .query("shiftInstances")
      .withIndex("by_mission_and_date", (q) => q.eq("missionId", args.missionId))
      .order("desc")
      .first();

    return lastShift?.dateStart ?? null;
  },
});

// ============================================================================
// Existing APIs (enhanced)
// ============================================================================

/**
 * Get shifts for a date range with assignments and user details
 */
export const getShiftsForDateRange = query({
  args: {
    missionId: v.id("zooMissions"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const shifts = await ctx.db
      .query("shiftInstances")
      .withIndex("by_mission_and_date", (q) =>
        q.eq("missionId", args.missionId).gte("dateStart", args.startDate)
      )
      .filter((q) => q.lte(q.field("dateStart"), args.endDate))
      .collect();

    // Fetch assignments and shift definitions for each shift
    const shiftsWithDetails = await Promise.all(
      shifts.map(async (shift) => {
        const assignments = await ctx.db
          .query("shiftAssignments")
          .withIndex("by_shift", (q) => q.eq("shiftInstanceId", shift._id))
          .collect();

        const assignmentsWithUsers = await Promise.all(
          assignments.map(async (assignment) => {
            const user = await ctx.db.get(assignment.userId);
            return { ...assignment, user };
          })
        );

        const shiftDefinition = await ctx.db.get(shift.shiftDefinitionId);
        const team = shift.teamId ? await ctx.db.get(shift.teamId) : null;

        return {
          ...shift,
          assignments: assignmentsWithUsers,
          shiftDefinition,
          team,
        };
      })
    );

    return shiftsWithDetails;
  },
});

/**
 * Get a single shift with full details
 */
export const getShiftWithAssignments = query({
  args: { shiftId: v.id("shiftInstances") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const shift = await ctx.db.get(args.shiftId);
    if (!shift) return null;

    const assignments = await ctx.db
      .query("shiftAssignments")
      .withIndex("by_shift", (q) => q.eq("shiftInstanceId", args.shiftId))
      .collect();

    const assignmentsWithUsers = await Promise.all(
      assignments.map(async (assignment) => {
        const user = await ctx.db.get(assignment.userId);
        const userQuals = await ctx.db
          .query("userQualifications")
          .withIndex("by_user", (q) => q.eq("userId", assignment.userId))
          .collect();
        const qualsWithDetails = await Promise.all(
          userQuals.map(async (uq) => ({
            ...uq,
            qualification: await ctx.db.get(uq.qualificationId),
          }))
        );
        return { ...assignment, user, qualifications: qualsWithDetails };
      })
    );

    const shiftDefinition = await ctx.db.get(shift.shiftDefinitionId);
    const team = shift.teamId ? await ctx.db.get(shift.teamId) : null;
    const mission = await ctx.db.get(shift.missionId);

    return {
      ...shift,
      assignments: assignmentsWithUsers,
      shiftDefinition,
      team,
      mission,
    };
  },
});

/**
 * Generate schedule from a template
 */
export const generateSchedule = mutation({
  args: {
    missionId: v.id("zooMissions"),
    teamId: v.optional(v.id("teams")),
    templateId: v.id("scheduleTemplates"),
    dayShiftDefId: v.id("shiftDefinitions"),
    nightShiftDefId: v.id("shiftDefinitions"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");

    const pattern = JSON.parse(template.patternJson);
    const createdIds: any[] = [];

    let currentDate = args.startDate;
    let dayIndex = 0;

    while (currentDate <= args.endDate) {
      const cycleDay = dayIndex % template.cycleDays;
      const dayPattern = pattern.find((p: any) => p.dayIndex === cycleDay);

      if (dayPattern && dayPattern.work) {
        const shiftDefId =
          dayPattern.shiftDefinitionKey === "day"
            ? args.dayShiftDefId
            : args.nightShiftDefId;

        const shiftDef = await ctx.db.get(shiftDefId);
        const dateStart = shiftDef
          ? createTimestamp(currentDate, shiftDef.startTime)
          : currentDate;
        const dateEnd = shiftDef
          ? calculateShiftEnd(currentDate, shiftDef.startTime, shiftDef.endTime)
          : currentDate + MS_PER_DAY;

        const shiftId = await ctx.db.insert("shiftInstances", {
          missionId: args.missionId,
          teamId: args.teamId,
          shiftDefinitionId: shiftDefId,
          dateStart,
          dateEnd,
          status: "DRAFT",
          readyForApproval: false,
          generatedFromTemplateId: args.templateId,
        });

        createdIds.push(shiftId);
      }

      currentDate += MS_PER_DAY;
      dayIndex++;
    }

    return { count: createdIds.length, ids: createdIds };
  },
});

/**
 * Assign a user to a shift
 */
export const assignUser = mutation({
  args: {
    shiftInstanceId: v.id("shiftInstances"),
    userId: v.id("users"),
    role: v.union(v.literal("PRIMARY"), v.literal("BACKUP"), v.literal("ON_CALL")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);

    // Check if user is already assigned to this shift with same role
    const existing = await ctx.db
      .query("shiftAssignments")
      .withIndex("by_shift", (q) => q.eq("shiftInstanceId", args.shiftInstanceId))
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("role"), args.role)
        )
      )
      .first();

    if (existing) {
      throw new Error("User is already assigned to this shift with the same role");
    }

    return await ctx.db.insert("shiftAssignments", {
      shiftInstanceId: args.shiftInstanceId,
      userId: args.userId,
      role: args.role,
      notes: args.notes,
      createdBy: currentUser._id,
    });
  },
});

/**
 * Remove a shift assignment
 */
export const removeAssignment = mutation({
  args: { assignmentId: v.id("shiftAssignments") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    await ctx.db.delete(args.assignmentId);
  },
});

/**
 * Update shift status
 */
export const updateShiftStatus = mutation({
  args: {
    shiftId: v.id("shiftInstances"),
    status: v.union(v.literal("DRAFT"), v.literal("PENDING_APPROVAL"), v.literal("FINAL")),
    readyForApproval: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    const { shiftId, ...updates } = args;
    await ctx.db.patch(shiftId, updates);
  },
});

// ============================================================================
// US-2.4: Coverage Validation APIs
// ============================================================================

/**
 * Get coverage status for a single shift
 */
export const getShiftCoverageStatus = query({
  args: { shiftInstanceId: v.id("shiftInstances") },
  handler: async (ctx, args): Promise<CoverageDetails> => {
    await requireAuth(ctx);
    return await getShiftCoverageDetails(ctx, args.shiftInstanceId);
  },
});

/**
 * Validate coverage for all shifts in a date range
 */
export const validateCoverage = query({
  args: {
    missionId: v.id("zooMissions"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args): Promise<CoverageGap[]> => {
    await requireAuth(ctx);

    const shifts = await ctx.db
      .query("shiftInstances")
      .withIndex("by_mission_and_date", (q) =>
        q.eq("missionId", args.missionId).gte("dateStart", args.startDate)
      )
      .filter((q) => q.lte(q.field("dateStart"), args.endDate))
      .collect();

    const gaps: CoverageGap[] = [];

    for (const shift of shifts) {
      const details = await getShiftCoverageDetails(ctx, shift._id);
      if (details.status !== "green") {
        const shiftDef = await ctx.db.get(shift.shiftDefinitionId);
        gaps.push({
          shiftInstanceId: shift._id,
          date: shift.dateStart,
          shiftType: shiftDef?.label ?? "Unknown",
          details,
        });
      }
    }

    return gaps;
  },
});

/**
 * Get overall coverage health for a mission over the next 7 days
 */
export const getMissionCoverageHealth = query({
  args: { missionId: v.id("zooMissions") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const now = Date.now();
    const weekFromNow = now + 7 * MS_PER_DAY;

    const shifts = await ctx.db
      .query("shiftInstances")
      .withIndex("by_mission_and_date", (q) =>
        q.eq("missionId", args.missionId).gte("dateStart", now)
      )
      .filter((q) => q.lte(q.field("dateStart"), weekFromNow))
      .collect();

    let redCount = 0;
    let yellowCount = 0;
    let greenCount = 0;

    for (const shift of shifts) {
      const details = await getShiftCoverageDetails(ctx, shift._id);
      if (details.status === "red") redCount++;
      else if (details.status === "yellow") yellowCount++;
      else greenCount++;
    }

    return {
      health: determineHealth(redCount, yellowCount),
      totalShifts: shifts.length,
      gapCount: redCount + yellowCount,
      redCount,
      yellowCount,
      greenCount,
    };
  },
});

/**
 * Get eligible replacement candidates for a shift
 */
export const getEligibleReplacements = query({
  args: { shiftInstanceId: v.id("shiftInstances") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await getEligibleCandidates(ctx, args.shiftInstanceId);
  },
});

// ============================================================================
// US-2.6: Schedule Approval APIs
// ============================================================================

/**
 * Submit shifts for approval
 */
export const submitForApproval = mutation({
  args: {
    missionId: v.id("zooMissions"),
    startDate: v.number(),
    endDate: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);

    const shifts = await ctx.db
      .query("shiftInstances")
      .withIndex("by_mission_and_date", (q) =>
        q.eq("missionId", args.missionId).gte("dateStart", args.startDate)
      )
      .filter((q) => q.lte(q.field("dateStart"), args.endDate))
      .collect();

    const draftShifts = shifts.filter((s) => s.status === "DRAFT");

    for (const shift of draftShifts) {
      await ctx.db.patch(shift._id, {
        status: "PENDING_APPROVAL",
        readyForApproval: true,
      });
    }

    return { submitted: draftShifts.length };
  },
});

/**
 * Approve shifts (Ops Lead only)
 */
export const approveSchedule = mutation({
  args: {
    missionId: v.id("zooMissions"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["OperationsLead", "Admin"]);

    const shifts = await ctx.db
      .query("shiftInstances")
      .withIndex("by_mission_and_date", (q) =>
        q.eq("missionId", args.missionId).gte("dateStart", args.startDate)
      )
      .filter((q) =>
        q.and(
          q.lte(q.field("dateStart"), args.endDate),
          q.eq(q.field("status"), "PENDING_APPROVAL")
        )
      )
      .collect();

    for (const shift of shifts) {
      await ctx.db.patch(shift._id, { status: "FINAL" });
    }

    return { approved: shifts.length };
  },
});

/**
 * Reject shifts back to draft
 */
export const rejectSchedule = mutation({
  args: {
    missionId: v.id("zooMissions"),
    startDate: v.number(),
    endDate: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["OperationsLead", "Admin"]);

    const shifts = await ctx.db
      .query("shiftInstances")
      .withIndex("by_mission_and_date", (q) =>
        q.eq("missionId", args.missionId).gte("dateStart", args.startDate)
      )
      .filter((q) =>
        q.and(
          q.lte(q.field("dateStart"), args.endDate),
          q.eq(q.field("status"), "PENDING_APPROVAL")
        )
      )
      .collect();

    for (const shift of shifts) {
      await ctx.db.patch(shift._id, {
        status: "DRAFT",
        readyForApproval: false,
      });
    }

    return { rejected: shifts.length, reason: args.reason };
  },
});

/**
 * Get pending approvals across all missions
 */
export const getPendingApprovals = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["OperationsLead", "Admin"]);

    const pendingShifts = await ctx.db
      .query("shiftInstances")
      .filter((q) => q.eq(q.field("status"), "PENDING_APPROVAL"))
      .collect();

    // Group by mission
    const byMission = new Map<string, typeof pendingShifts>();

    for (const shift of pendingShifts) {
      const key = shift.missionId.toString();
      if (!byMission.has(key)) {
        byMission.set(key, []);
      }
      byMission.get(key)!.push(shift);
    }

    // Build result with mission details
    const result = await Promise.all(
      Array.from(byMission.entries()).map(async ([missionId, shifts]) => {
        const mission = await ctx.db.get(shifts[0].missionId);
        const minDate = Math.min(...shifts.map((s) => s.dateStart));
        const maxDate = Math.max(...shifts.map((s) => s.dateStart));

        return {
          mission,
          shiftCount: shifts.length,
          dateRange: { start: minDate, end: maxDate },
        };
      })
    );

    return result;
  },
});

/**
 * Get upcoming shifts for a specific user
 */
export const getUserUpcomingShifts = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const now = Date.now();
    const limit = args.limit ?? 10;

    // Get all assignments for this user
    const assignments = await ctx.db
      .query("shiftAssignments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get shift details for each assignment
    const shiftsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        const shift = await ctx.db.get(assignment.shiftInstanceId);
        if (!shift || shift.dateStart < now) return null;

        const shiftDefinition = await ctx.db.get(shift.shiftDefinitionId);
        const mission = await ctx.db.get(shift.missionId);
        const team = shift.teamId ? await ctx.db.get(shift.teamId) : null;

        return {
          ...shift,
          assignment,
          shiftDefinition,
          mission,
          team,
        };
      })
    );

    // Filter out nulls and past shifts, sort by date, limit
    return shiftsWithDetails
      .filter((s): s is NonNullable<typeof s> => s !== null)
      .sort((a, b) => a.dateStart - b.dateStart)
      .slice(0, limit);
  },
});

// ============================================================================
// Dashboard Aggregation APIs
// ============================================================================

/**
 * Get aggregated dashboard statistics across all missions
 * Used by OpsLead and TeamLead dashboards for efficient data loading
 */
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);

    const now = Date.now();
    const weekFromNow = now + 7 * MS_PER_DAY;

    // Get all active missions
    const allMissions = await ctx.db.query("zooMissions").collect();
    const activeMissions = allMissions.filter(
      (m) => m.status === "ACTIVE" || (m.status === undefined && m.active !== false)
    );

    // Calculate coverage health for each mission
    const missionStats = await Promise.all(
      activeMissions.map(async (mission) => {
        const shifts = await ctx.db
          .query("shiftInstances")
          .withIndex("by_mission_and_date", (q) =>
            q.eq("missionId", mission._id).gte("dateStart", now)
          )
          .filter((q) => q.lte(q.field("dateStart"), weekFromNow))
          .collect();

        let redCount = 0;
        let yellowCount = 0;
        let greenCount = 0;

        for (const shift of shifts) {
          const details = await getShiftCoverageDetails(ctx, shift._id);
          if (details.status === "red") redCount++;
          else if (details.status === "yellow") yellowCount++;
          else greenCount++;
        }

        const health = determineHealth(redCount, yellowCount);
        const gapCount = redCount + yellowCount;

        // Get last generated date
        const lastShift = await ctx.db
          .query("shiftInstances")
          .withIndex("by_mission_and_date", (q) => q.eq("missionId", mission._id))
          .order("desc")
          .first();

        return {
          missionId: mission._id,
          missionName: mission.name,
          status: mission.status ?? "ACTIVE",
          health,
          totalShifts: shifts.length,
          gapCount,
          redCount,
          yellowCount,
          greenCount,
          lastGeneratedDate: lastShift?.dateStart ?? null,
        };
      })
    );

    // Aggregate totals
    const totals = missionStats.reduce(
      (acc, m) => ({
        totalMissions: acc.totalMissions + 1,
        totalShifts: acc.totalShifts + m.totalShifts,
        totalGaps: acc.totalGaps + m.gapCount,
        totalRed: acc.totalRed + m.redCount,
        totalYellow: acc.totalYellow + m.yellowCount,
        totalGreen: acc.totalGreen + m.greenCount,
      }),
      {
        totalMissions: 0,
        totalShifts: 0,
        totalGaps: 0,
        totalRed: 0,
        totalYellow: 0,
        totalGreen: 0,
      }
    );

    // Get pending approvals count
    const pendingShifts = await ctx.db
      .query("shiftInstances")
      .filter((q) => q.eq(q.field("status"), "PENDING_APPROVAL"))
      .collect();

    // Group by mission for pending approvals
    const pendingByMission = new Map<string, number>();
    for (const shift of pendingShifts) {
      const key = shift.missionId.toString();
      pendingByMission.set(key, (pendingByMission.get(key) ?? 0) + 1);
    }

    return {
      missions: missionStats,
      totals,
      pendingApprovalsMissionCount: pendingByMission.size,
      pendingApprovalsShiftCount: pendingShifts.length,
    };
  },
});
