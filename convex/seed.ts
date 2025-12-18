import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./rbac";
import { Id } from "./_generated/dataModel";

// ============================================================================
// Development Database Seeding
// ============================================================================

// First/last name pools for generating realistic names
const FIRST_NAMES = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Christopher", "Karen", "Charles", "Lisa", "Daniel", "Nancy",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
  "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
  "Timothy", "Deborah", "Ronald", "Stephanie", "Edward", "Rebecca", "Jason", "Sharon",
  "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
  "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
];

// Mission data
const MISSIONS = [
  {
    name: "African Savanna",
    description: "Large habitat housing elephants, giraffes, zebras, and lions",
    color: "#F59E0B",
    timezone: "America/New_York",
  },
  {
    name: "Tropical Rainforest",
    description: "Indoor climate-controlled exhibit with primates, birds, and reptiles",
    color: "#10B981",
    timezone: "America/New_York",
  },
];

// Teams per mission
const TEAM_CONFIGS = [
  // African Savanna teams
  { missionIndex: 0, name: "Alpha Crew", description: "Primary day shift crew", shiftPreference: "DAY" as const, color: "#3B82F6" },
  { missionIndex: 0, name: "Bravo Crew", description: "Primary night shift crew", shiftPreference: "NIGHT" as const, color: "#8B5CF6" },
  { missionIndex: 0, name: "Charlie Crew", description: "Rotation support crew", shiftPreference: "BOTH" as const, color: "#EC4899" },
  // Tropical Rainforest teams
  { missionIndex: 1, name: "Delta Crew", description: "Day operations team", shiftPreference: "DAY" as const, color: "#14B8A6" },
  { missionIndex: 1, name: "Echo Crew", description: "Night operations team", shiftPreference: "NIGHT" as const, color: "#F97316" },
  { missionIndex: 1, name: "Foxtrot Crew", description: "Flex support team", shiftPreference: "BOTH" as const, color: "#EF4444" },
];

// Qualifications
const QUALIFICATIONS = [
  // Global qualifications
  { name: "First Aid Certified", description: "Basic first aid and CPR certification", missionIndex: null },
  { name: "Heavy Machinery License", description: "Licensed to operate forklifts and utility vehicles", missionIndex: null },
  { name: "Hazmat Trained", description: "Hazardous materials handling certification", missionIndex: null },
  // African Savanna specific
  { name: "Large Mammal Handler", description: "Trained for elephant and giraffe care", missionIndex: 0 },
  { name: "Predator Safety Certified", description: "Lion and predator enclosure protocols", missionIndex: 0 },
  // Tropical Rainforest specific
  { name: "Primate Specialist", description: "Certified in great ape and monkey handling", missionIndex: 1 },
  { name: "Reptile Handler", description: "Venomous and non-venomous reptile care", missionIndex: 1 },
  { name: "Avian Care Certified", description: "Exotic bird care and handling", missionIndex: 1 },
];

// Shift definitions per mission
const SHIFT_DEFINITIONS = [
  // African Savanna
  { missionIndex: 0, label: "Day Shift", startTime: "07:00", endTime: "19:00", minPrimary: 3, minBackup: 1 },
  { missionIndex: 0, label: "Night Shift", startTime: "19:00", endTime: "07:00", minPrimary: 2, minBackup: 1 },
  // Tropical Rainforest
  { missionIndex: 1, label: "Day Shift", startTime: "06:00", endTime: "18:00", minPrimary: 2, minBackup: 1 },
  { missionIndex: 1, label: "Night Shift", startTime: "18:00", endTime: "06:00", minPrimary: 2, minBackup: 1 },
];

// Helper to generate a random element from array
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to generate unique names
function generateUniqueName(usedNames: Set<string>): { firstName: string; lastName: string; fullName: string } {
  let attempts = 0;
  while (attempts < 1000) {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    if (!usedNames.has(fullName)) {
      usedNames.add(fullName);
      return { firstName, lastName, fullName };
    }
    attempts++;
  }
  // Fallback with number suffix
  const firstName = randomElement(FIRST_NAMES);
  const lastName = randomElement(LAST_NAMES);
  const fullName = `${firstName} ${lastName} ${Date.now()}`;
  usedNames.add(fullName);
  return { firstName, lastName, fullName };
}

// Helper to generate email from name
function generateEmail(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@zoo-dev.example.com`;
}

/**
 * Clear all seed data (for re-seeding)
 */
export const clearSeedData = mutation({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["Admin"]);

    // Get current user to preserve
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    // Delete in dependency order
    const tables = [
      "shiftAssignments",
      "shiftInstances", 
      "callOuts",
      "ptoRequests",
      "userQualifications",
      "crewMemberships",
      "missionEligibility",
      "shiftDefinitions",
      "scheduleTemplates",
      "qualifications",
      "teams",
      "holidays",
    ];

    let deletedCounts: Record<string, number> = {};

    for (const table of tables) {
      const items = await ctx.db.query(table as any).collect();
      for (const item of items) {
        await ctx.db.delete(item._id);
      }
      deletedCounts[table] = items.length;
    }

    // Delete users except current user
    const users = await ctx.db.query("users").collect();
    let usersDeleted = 0;
    for (const user of users) {
      if (user._id !== currentUser?._id) {
        await ctx.db.delete(user._id);
        usersDeleted++;
      }
    }
    deletedCounts["users"] = usersDeleted;

    // Delete missions
    const missions = await ctx.db.query("zooMissions").collect();
    for (const mission of missions) {
      await ctx.db.delete(mission._id);
    }
    deletedCounts["zooMissions"] = missions.length;

    return {
      success: true,
      message: "Seed data cleared",
      deletedCounts,
    };
  },
});

/**
 * Main seed function - creates all dev data
 */
export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["Admin"]);

    const usedNames = new Set<string>();
    const now = Date.now();

    // Get current user ID for granting refs
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!currentUser) throw new Error("Current user not found");

    // ========================================================================
    // 1. Create Missions
    // ========================================================================
    const missionIds: Id<"zooMissions">[] = [];
    
    for (const mission of MISSIONS) {
      const id = await ctx.db.insert("zooMissions", {
        name: mission.name,
        description: mission.description,
        color: mission.color,
        timezone: mission.timezone,
        status: "ACTIVE",
        startDate: now,
      });
      missionIds.push(id);
    }

    // ========================================================================
    // 2. Create Teams
    // ========================================================================
    const teamIds: Id<"teams">[] = [];
    
    for (const teamConfig of TEAM_CONFIGS) {
      const id = await ctx.db.insert("teams", {
        name: teamConfig.name,
        missionId: missionIds[teamConfig.missionIndex],
        description: teamConfig.description,
        shiftPreference: teamConfig.shiftPreference,
        color: teamConfig.color,
      });
      teamIds.push(id);
    }

    // ========================================================================
    // 3. Create Qualifications
    // ========================================================================
    const qualificationIds: Id<"qualifications">[] = [];
    
    for (const qual of QUALIFICATIONS) {
      const id = await ctx.db.insert("qualifications", {
        name: qual.name,
        description: qual.description,
        missionId: qual.missionIndex !== null ? missionIds[qual.missionIndex] : undefined,
      });
      qualificationIds.push(id);
    }

    // ========================================================================
    // 4. Create Shift Definitions
    // ========================================================================
    for (const shiftDef of SHIFT_DEFINITIONS) {
      await ctx.db.insert("shiftDefinitions", {
        missionId: missionIds[shiftDef.missionIndex],
        label: shiftDef.label,
        startTime: shiftDef.startTime,
        endTime: shiftDef.endTime,
        minPrimary: shiftDef.minPrimary,
        minBackup: shiftDef.minBackup,
      });
    }

    // ========================================================================
    // 5. Create Users (50 BasicUsers, 5 TeamLeads, 2 OpsLeads)
    // ========================================================================
    const userIds: { id: Id<"users">; role: string }[] = [];

    // Create 2 Operations Leads
    for (let i = 0; i < 2; i++) {
      const { firstName, lastName, fullName } = generateUniqueName(usedNames);
      const id = await ctx.db.insert("users", {
        clerkId: `seed_ops_${i}_${Date.now()}`,
        email: generateEmail(firstName, lastName),
        name: fullName,
        role: "OperationsLead",
        status: "ACTIVE",
        defaultMissionId: missionIds[i], // Each ops lead defaults to a mission
      });
      userIds.push({ id, role: "OperationsLead" });
    }

    // Create 5 Team Leads
    for (let i = 0; i < 5; i++) {
      const { firstName, lastName, fullName } = generateUniqueName(usedNames);
      const id = await ctx.db.insert("users", {
        clerkId: `seed_tl_${i}_${Date.now()}`,
        email: generateEmail(firstName, lastName),
        name: fullName,
        role: "TeamLead",
        status: "ACTIVE",
        defaultMissionId: missionIds[i % 2], // Distribute across missions
      });
      userIds.push({ id, role: "TeamLead" });
    }

    // Create 50 Basic Users
    for (let i = 0; i < 50; i++) {
      const { firstName, lastName, fullName } = generateUniqueName(usedNames);
      const statuses: ("ACTIVE" | "ON_LEAVE" | "INACTIVE")[] = ["ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "ON_LEAVE", "INACTIVE"];
      const id = await ctx.db.insert("users", {
        clerkId: `seed_user_${i}_${Date.now()}`,
        email: generateEmail(firstName, lastName),
        name: fullName,
        role: "BasicUser",
        status: randomElement(statuses),
        defaultMissionId: missionIds[i % 2],
      });
      userIds.push({ id, role: "BasicUser" });
    }

    // ========================================================================
    // 6. Create Crew Memberships (assign users to teams)
    // ========================================================================
    // Ops leads get assigned to a team in their mission
    for (let i = 0; i < 2; i++) {
      const opsLead = userIds[i];
      // Assign to first team in their mission
      const teamIndex = i === 0 ? 0 : 3; // Alpha or Delta
      await ctx.db.insert("crewMemberships", {
        userId: opsLead.id,
        teamId: teamIds[teamIndex],
        isPrimary: true,
        joinedAt: now,
        addedBy: currentUser._id,
      });
    }

    // Team leads get assigned to specific teams (one per team, plus one shared)
    const teamLeadUsers = userIds.slice(2, 7); // indices 2-6
    for (let i = 0; i < teamLeadUsers.length; i++) {
      const teamLead = teamLeadUsers[i];
      await ctx.db.insert("crewMemberships", {
        userId: teamLead.id,
        teamId: teamIds[i % teamIds.length],
        isPrimary: true,
        joinedAt: now,
        addedBy: currentUser._id,
      });
    }

    // Basic users get distributed across teams
    const basicUsers = userIds.slice(7); // indices 7+
    for (let i = 0; i < basicUsers.length; i++) {
      const user = basicUsers[i];
      const primaryTeamIndex = i % teamIds.length;
      
      // Primary team membership
      await ctx.db.insert("crewMemberships", {
        userId: user.id,
        teamId: teamIds[primaryTeamIndex],
        isPrimary: true,
        joinedAt: now,
        addedBy: currentUser._id,
      });

      // Some users get a secondary team (about 30%)
      if (i % 3 === 0) {
        const secondaryTeamIndex = (primaryTeamIndex + 1) % teamIds.length;
        await ctx.db.insert("crewMemberships", {
          userId: user.id,
          teamId: teamIds[secondaryTeamIndex],
          isPrimary: false,
          joinedAt: now,
          addedBy: currentUser._id,
        });
      }
    }

    // ========================================================================
    // 7. Create Mission Eligibility
    // ========================================================================
    // All users are eligible for the mission of their primary team
    for (const user of userIds) {
      // Get user's primary team
      const membership = await ctx.db
        .query("crewMemberships")
        .withIndex("by_user", (q) => q.eq("userId", user.id))
        .first();
      
      if (membership) {
        const team = await ctx.db.get(membership.teamId);
        if (team) {
          await ctx.db.insert("missionEligibility", {
            userId: user.id,
            missionId: team.missionId,
            grantedAt: now,
            grantedBy: currentUser._id,
          });

          // Some users eligible for both missions (about 25%)
          if (Math.random() < 0.25) {
            const otherMission = team.missionId === missionIds[0] ? missionIds[1] : missionIds[0];
            await ctx.db.insert("missionEligibility", {
              userId: user.id,
              missionId: otherMission,
              grantedAt: now,
              grantedBy: currentUser._id,
            });
          }
        }
      }
    }

    // ========================================================================
    // 8. Assign Qualifications to Users
    // ========================================================================
    // All leads get First Aid
    for (const user of userIds.filter(u => u.role !== "BasicUser")) {
      await ctx.db.insert("userQualifications", {
        userId: user.id,
        qualificationId: qualificationIds[0], // First Aid
        status: "ACTIVE",
        grantedAt: now,
        grantedBy: currentUser._id,
      });
    }

    // Distribute other qualifications to basic users randomly
    for (let i = 0; i < basicUsers.length; i++) {
      const user = basicUsers[i];
      
      // Everyone gets 1-3 random qualifications
      const numQuals = 1 + Math.floor(Math.random() * 3);
      const assignedQuals = new Set<number>();
      
      for (let j = 0; j < numQuals; j++) {
        let qualIndex = Math.floor(Math.random() * qualificationIds.length);
        // Avoid duplicates
        while (assignedQuals.has(qualIndex)) {
          qualIndex = (qualIndex + 1) % qualificationIds.length;
        }
        assignedQuals.add(qualIndex);
        
        const statuses: ("ACTIVE" | "IN_TRAINING")[] = ["ACTIVE", "ACTIVE", "ACTIVE", "IN_TRAINING"];
        await ctx.db.insert("userQualifications", {
          userId: user.id,
          qualificationId: qualificationIds[qualIndex],
          status: randomElement(statuses),
          grantedAt: now - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000), // Random time in past 90 days
          grantedBy: currentUser._id,
          expiresAt: Math.random() > 0.7 
            ? now + Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000) // Some expire in next year
            : undefined,
        });
      }
    }

    // ========================================================================
    // Summary
    // ========================================================================
    return {
      success: true,
      message: "Database seeded successfully",
      counts: {
        missions: missionIds.length,
        teams: teamIds.length,
        qualifications: qualificationIds.length,
        shiftDefinitions: SHIFT_DEFINITIONS.length,
        opsLeads: 2,
        teamLeads: 5,
        basicUsers: 50,
        totalUsers: userIds.length,
      },
    };
  },
});

/**
 * Check if seed data exists
 */
export const hasSeedData = mutation({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["Admin"]);
    
    const users = await ctx.db.query("users").collect();
    const missions = await ctx.db.query("zooMissions").collect();
    const teams = await ctx.db.query("teams").collect();
    
    // Check for seed-specific clerkIds
    const seedUsers = users.filter(u => u.clerkId.startsWith("seed_"));
    
    return {
      hasSeedData: seedUsers.length > 0,
      counts: {
        totalUsers: users.length,
        seedUsers: seedUsers.length,
        missions: missions.length,
        teams: teams.length,
      },
    };
  },
});

