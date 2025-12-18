# US-2.1: Continuous Schedule Generation API

## User Story

**As a** Team Lead  
**I want** to generate schedule shifts that continue seamlessly across months  
**So that** the Panama 2-2-3 pattern never resets when extending the schedule

## Priority

P0 - Core scheduling functionality

## Acceptance Criteria

- [ ] `startMissionSchedule` mutation sets template and anchor date for a mission
- [ ] `extendSchedule` mutation generates shifts from last date to new end date
- [ ] `getLastGeneratedDate` query returns the furthest date with shifts
- [ ] Schedule generation uses `cycleAnchorDate` to calculate pattern position
- [ ] Generation is idempotent (skips dates that already have shifts)
- [ ] Supports generating months or years ahead

## Technical Details

### New Mutations/Queries

```typescript
// convex/schedules.ts

// One-time setup for a mission's schedule
export const startMissionSchedule = mutation({
  args: {
    missionId: v.id("zooMissions"),
    templateId: v.id("scheduleTemplates"),
    anchorDate: v.number(),  // When pattern starts (typically today or mission start)
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    
    await ctx.db.patch(args.missionId, {
      activeTemplateId: args.templateId,
      cycleAnchorDate: args.anchorDate,
    });
    
    return { success: true };
  },
});

// Extend schedule into the future
export const extendSchedule = mutation({
  args: {
    missionId: v.id("zooMissions"),
    endDate: v.number(),  // Generate up to this date
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    
    const mission = await ctx.db.get(args.missionId);
    if (!mission?.activeTemplateId || !mission?.cycleAnchorDate) {
      throw new Error("Mission must have template and anchor date set");
    }
    
    const template = await ctx.db.get(mission.activeTemplateId);
    const pattern = JSON.parse(template.patternJson);
    
    // Find last generated date
    const lastShift = await ctx.db
      .query("shiftInstances")
      .withIndex("by_mission_and_date", q => q.eq("missionId", args.missionId))
      .order("desc")
      .first();
    
    const startDate = lastShift 
      ? lastShift.dateStart + MS_PER_DAY 
      : mission.cycleAnchorDate;
    
    // Generate shifts using cycle position calculation
    let currentDate = startDate;
    let count = 0;
    
    while (currentDate <= args.endDate) {
      const daysSinceAnchor = Math.floor(
        (currentDate - mission.cycleAnchorDate) / MS_PER_DAY
      );
      const cycleDay = daysSinceAnchor % template.cycleDays;
      
      // Generate shifts for this day based on pattern
      // ... (implementation details)
      
      currentDate += MS_PER_DAY;
      count++;
    }
    
    return { generated: count };
  },
});

// Query last generated date
export const getLastGeneratedDate = query({
  args: { missionId: v.id("zooMissions") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    const lastShift = await ctx.db
      .query("shiftInstances")
      .withIndex("by_mission_and_date", q => q.eq("missionId", args.missionId))
      .order("desc")
      .first();
    
    return lastShift?.dateStart ?? null;
  },
});
```

### Shared Helper

```typescript
// convex/helpers/schedule.ts

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function calculateCycleDay(
  anchorDate: number,
  targetDate: number,
  cycleDays: number
): number {
  const daysSinceAnchor = Math.floor((targetDate - anchorDate) / MS_PER_DAY);
  return ((daysSinceAnchor % cycleDays) + cycleDays) % cycleDays; // Handle negatives
}
```

## Files Modified

- `convex/schedules.ts`
- `convex/helpers/schedule.ts` (new)

## Dependencies

- US-1.1: Mission Lifecycle Schema

## Estimate

Medium (M)




