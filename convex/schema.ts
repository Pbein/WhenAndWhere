import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users & Authentication
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(
      v.literal("BasicUser"),
      v.literal("TeamLead"),
      v.literal("OperationsLead"),
      v.literal("Admin")
    ),
    defaultMissionId: v.optional(v.id("zooMissions")),
    defaultTeamId: v.optional(v.id("teams")),
    status: v.optional(
      v.union(
        v.literal("ACTIVE"),
        v.literal("ON_LEAVE"),
        v.literal("INACTIVE")
      )
    ),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // Missions (Zoo habitats/areas requiring 24/7 coverage)
  zooMissions: defineTable({
    name: v.string(),
    description: v.string(),
    color: v.optional(v.string()),
    timezone: v.optional(v.string()),
    activeTemplateId: v.optional(v.id("scheduleTemplates")),
    cycleAnchorDate: v.optional(v.number()), // When the pattern cycle started
    status: v.optional(
      v.union(
        v.literal("ACTIVE"),
        v.literal("PAUSED"),
        v.literal("TERMINATED")
      )
    ),
    active: v.optional(v.boolean()), // Legacy field
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    terminatedAt: v.optional(v.number()),
  }).index("by_status", ["status"]),

  // Teams/Crews that rotate together
  teams: defineTable({
    name: v.string(),
    missionId: v.id("zooMissions"),
    description: v.string(),
    focus: v.optional(v.string()),
    shiftPreference: v.optional(
      v.union(v.literal("DAY"), v.literal("NIGHT"), v.literal("BOTH"))
    ),
    color: v.optional(v.string()),
  }).index("by_mission", ["missionId"]),

  // Certification types (e.g., "Panda-certified", "First Aid")
  qualifications: defineTable({
    name: v.string(),
    description: v.string(),
    missionId: v.optional(v.id("zooMissions")), // null = global qualification
  }).index("by_mission", ["missionId"]),

  // User qualifications (which certs each user has)
  userQualifications: defineTable({
    userId: v.id("users"),
    qualificationId: v.id("qualifications"),
    status: v.union(
      v.literal("ACTIVE"),
      v.literal("IN_TRAINING"),
      v.literal("EXPIRED")
    ),
    grantedAt: v.number(),
    expiresAt: v.optional(v.number()),
    grantedBy: v.optional(v.id("users")),
  })
    .index("by_user", ["userId"])
    .index("by_qualification", ["qualificationId"])
    .index("by_user_qualification", ["userId", "qualificationId"]),

  // Crew memberships (which teams each user belongs to)
  crewMemberships: defineTable({
    userId: v.id("users"),
    teamId: v.id("teams"),
    isPrimary: v.boolean(),
    joinedAt: v.number(),
    addedBy: v.optional(v.id("users")),
  })
    .index("by_user", ["userId"])
    .index("by_team", ["teamId"])
    .index("by_user_team", ["userId", "teamId"]),

  // Mission eligibility (which missions each user can work)
  missionEligibility: defineTable({
    userId: v.id("users"),
    missionId: v.id("zooMissions"),
    grantedAt: v.number(),
    grantedBy: v.optional(v.id("users")),
  })
    .index("by_user", ["userId"])
    .index("by_mission", ["missionId"])
    .index("by_user_mission", ["userId", "missionId"]),

  // Schedule templates (e.g., Panama 2-2-2-3 pattern)
  scheduleTemplates: defineTable({
    name: v.string(),
    description: v.string(),
    patternJson: v.string(),
    shiftLengthHours: v.number(),
    cycleDays: v.number(),
    missionId: v.optional(v.id("zooMissions")),
  }).index("by_mission", ["missionId"]),

  // Shift definitions (Day 07-19, Night 19-07, etc.)
  shiftDefinitions: defineTable({
    missionId: v.id("zooMissions"),
    label: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    minPrimary: v.number(),
    minBackup: v.number(),
  }).index("by_mission", ["missionId"]),

  // Shift instances (actual scheduled shifts)
  shiftInstances: defineTable({
    missionId: v.id("zooMissions"),
    teamId: v.optional(v.id("teams")),
    shiftDefinitionId: v.id("shiftDefinitions"),
    dateStart: v.number(),
    dateEnd: v.number(),
    status: v.union(
      v.literal("DRAFT"),
      v.literal("PENDING_APPROVAL"),
      v.literal("FINAL")
    ),
    readyForApproval: v.boolean(),
    generatedFromTemplateId: v.optional(v.id("scheduleTemplates")),
    requiredQualificationIds: v.optional(v.array(v.id("qualifications"))),
  })
    .index("by_mission_and_date", ["missionId", "dateStart"])
    .index("by_team", ["teamId"])
    .index("by_status", ["status"]),

  // Shift assignments (who's working each shift)
  shiftAssignments: defineTable({
    shiftInstanceId: v.id("shiftInstances"),
    userId: v.id("users"),
    role: v.union(
      v.literal("PRIMARY"),
      v.literal("BACKUP"),
      v.literal("ON_CALL")
    ),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_shift", ["shiftInstanceId"])
    .index("by_user", ["userId"]),

  // Call-outs (when someone can't make their shift)
  callOuts: defineTable({
    shiftAssignmentId: v.id("shiftAssignments"),
    userId: v.id("users"),
    reason: v.optional(v.string()),
    reportedAt: v.number(),
    reportedBy: v.id("users"),
    replacementUserId: v.optional(v.id("users")),
    replacementAssignmentId: v.optional(v.id("shiftAssignments")),
    resolvedAt: v.optional(v.number()),
    status: v.union(
      v.literal("PENDING"),
      v.literal("REPLACED"),
      v.literal("UNFILLED")
    ),
  })
    .index("by_shift_assignment", ["shiftAssignmentId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // PTO requests
  ptoRequests: defineTable({
    userId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(
      v.literal("PENDING"),
      v.literal("APPROVED"),
      v.literal("DENIED")
    ),
    reason: v.optional(v.string()),
    requestedBy: v.id("users"),
    decidedBy: v.optional(v.id("users")),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Holidays
  holidays: defineTable({
    date: v.number(),
    name: v.string(),
    description: v.optional(v.string()),
    missionId: v.optional(v.id("zooMissions")),
  }).index("by_date", ["date"]),
});




