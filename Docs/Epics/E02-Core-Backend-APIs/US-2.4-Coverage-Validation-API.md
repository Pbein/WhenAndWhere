# US-2.4: Coverage Validation API

## User Story

**As a** Team Lead or Ops Lead  
**I want** to see which shifts have coverage gaps  
**So that** I can ensure 24/7 coverage is maintained

## Priority

P0 - Core visibility feature

## Acceptance Criteria

- [ ] `getShiftCoverageStatus` query returns status for a single shift (green/yellow/red)
- [ ] `validateCoverage` query returns all gaps for a mission in date range
- [ ] `getMissionCoverageHealth` query returns overall health status per mission
- [ ] Coverage considers: required count vs assigned, required qualifications
- [ ] Results include actionable details (what's missing)

## Technical Details

### Coverage Status Types

```typescript
// lib/types.ts or convex/helpers/coverage.ts

export type CoverageStatus = "green" | "yellow" | "red";

export interface CoverageDetails {
  status: CoverageStatus;
  requiredPrimary: number;
  assignedPrimary: number;
  requiredBackup: number;
  assignedBackup: number;
  requiredQualifications: string[];
  missingQualifications: string[];
  message: string;  // Human-readable summary
}

export interface CoverageGap {
  shiftInstanceId: Id<"shiftInstances">;
  date: number;
  shiftType: string;  // "Day" or "Night"
  details: CoverageDetails;
}
```

### New Queries

```typescript
// convex/schedules.ts

export const getShiftCoverageStatus = query({
  args: { shiftInstanceId: v.id("shiftInstances") },
  handler: async (ctx, args): Promise<CoverageDetails> => {
    await requireAuth(ctx);
    
    const shift = await ctx.db.get(args.shiftInstanceId);
    if (!shift) throw new Error("Shift not found");
    
    const shiftDef = await ctx.db.get(shift.shiftDefinitionId);
    
    const assignments = await ctx.db
      .query("shiftAssignments")
      .withIndex("by_shift", q => q.eq("shiftInstanceId", args.shiftInstanceId))
      .collect();
    
    const primaryCount = assignments.filter(a => a.role === "PRIMARY").length;
    const backupCount = assignments.filter(a => a.role === "BACKUP").length;
    
    // Calculate status
    let status: CoverageStatus = "green";
    let message = "Fully covered";
    
    if (primaryCount < shiftDef.minPrimary) {
      status = "red";
      message = `Need ${shiftDef.minPrimary - primaryCount} more primary`;
    } else if (backupCount < shiftDef.minBackup) {
      status = "yellow";
      message = `Need ${shiftDef.minBackup - backupCount} more backup`;
    }
    
    // TODO: Add qualification checks
    
    return {
      status,
      requiredPrimary: shiftDef.minPrimary,
      assignedPrimary: primaryCount,
      requiredBackup: shiftDef.minBackup,
      assignedBackup: backupCount,
      requiredQualifications: [],
      missingQualifications: [],
      message,
    };
  },
});

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
      .withIndex("by_mission_and_date", q => 
        q.eq("missionId", args.missionId).gte("dateStart", args.startDate)
      )
      .filter(q => q.lte(q.field("dateStart"), args.endDate))
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

export const getMissionCoverageHealth = query({
  args: { missionId: v.id("zooMissions") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    // Check next 7 days
    const now = Date.now();
    const weekFromNow = now + 7 * 24 * 60 * 60 * 1000;
    
    const gaps = await validateCoverage(ctx, {
      missionId: args.missionId,
      startDate: now,
      endDate: weekFromNow,
    });
    
    const redCount = gaps.filter(g => g.details.status === "red").length;
    const yellowCount = gaps.filter(g => g.details.status === "yellow").length;
    
    let health: CoverageStatus = "green";
    if (redCount > 0) health = "red";
    else if (yellowCount > 0) health = "yellow";
    
    return {
      health,
      gapCount: gaps.length,
      redCount,
      yellowCount,
    };
  },
});
```

### Shared Helper

```typescript
// convex/helpers/coverage.ts

export async function getShiftCoverageDetails(
  ctx: QueryCtx,
  shiftInstanceId: Id<"shiftInstances">
): Promise<CoverageDetails> {
  // Reusable logic for coverage calculation
  // Called by both query and internal functions
}
```

## Files Modified

- `convex/schedules.ts`
- `convex/helpers/coverage.ts` (new)

## Dependencies

- US-1.6: Extended tables (for minPrimary, minBackup)

## Estimate

Medium (M)




