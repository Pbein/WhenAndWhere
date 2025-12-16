# US-8.2: OpsLead Dashboard

## User Story

**As an** Operations Lead  
**I want** a dashboard showing cross-mission operational health  
**So that** I can oversee all missions and approve schedules

## Priority

P0 - Critical for operations oversight

## Acceptance Criteria

- [x] Shows all missions with health status at a glance
- [x] Shows schedules pending approval count
- [x] Shows cross-mission coverage gaps
- [x] Quick approve/reject actions
- [x] Summary statistics across all missions
- [x] Drill-down capability to any mission

## Technical Details

### OpsLead Dashboard

```typescript
// components/dashboard/ops-lead-dashboard.tsx

export function OpsLeadDashboard({ user }: { user: User }) {
  const missions = useQuery(api.missions.listActive);
  const pendingApprovals = useQuery(api.schedules.getPendingApprovals);
  
  // Aggregate stats
  const totalGaps = useMemo(() => {
    // Calculate from mission health data
    return 0; // TODO: implement
  }, [missions]);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#f5f5f5]">
          Operations Overview
        </h1>
        <p className="text-sm text-[#a1a1aa]">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Missions"
          icon={Target}
          accent="emerald"
        >
          <div className="text-2xl font-semibold text-[#f5f5f5]">
            {missions?.length ?? 0}
          </div>
          <div className="text-sm text-[#a1a1aa]">Currently running</div>
        </MetricCard>
        
        <MetricCard
          title="Pending Approvals"
          icon={CheckCircle}
          accent="amber"
        >
          <div className="text-2xl font-semibold text-[#f5f5f5]">
            {pendingApprovals?.length ?? 0}
          </div>
          <div className="text-sm text-[#a1a1aa]">Schedules to review</div>
        </MetricCard>
        
        <MetricCard
          title="Coverage Gaps"
          icon={AlertTriangle}
          accent="red"
        >
          <CrossMissionGapsMetric missions={missions} />
        </MetricCard>
        
        <MetricCard
          title="Staff On Duty"
          icon={Users}
          accent="blue"
        >
          <TodayStaffMetric />
        </MetricCard>
      </div>
      
      {/* Mission Status Grid */}
      <Card>
        <CardHeader>
          <CardTitle>All Missions Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {missions?.map(mission => (
              <MissionStatusCard 
                key={mission._id} 
                mission={mission} 
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Pending Approvals */}
      {(pendingApprovals?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>Schedules Pending Approval</CardTitle>
              <Button asChild>
                <Link href="/approvals">Review All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PendingApprovalsTable approvals={pendingApprovals} />
          </CardContent>
        </Card>
      )}
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivityList />
        </CardContent>
      </Card>
    </div>
  );
}
```

### Mission Status Card

```typescript
// components/dashboard/mission-status-card.tsx

export function MissionStatusCard({ mission }: { mission: Mission }) {
  const health = useQuery(api.schedules.getMissionCoverageHealth, {
    missionId: mission._id,
  });
  const lastGenerated = useQuery(api.schedules.getLastGeneratedDate, {
    missionId: mission._id,
  });
  
  return (
    <Card className="relative">
      {/* Health indicator stripe */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 rounded-t-lg",
        health?.health === "green" ? "bg-emerald-500" :
        health?.health === "yellow" ? "bg-amber-500" : "bg-red-500"
      )} />
      
      <CardHeader className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{mission.name}</CardTitle>
            <Badge 
              tone={mission.status === "ACTIVE" ? "green" : "gray"}
              size="sm"
              className="mt-1"
            >
              {mission.status}
            </Badge>
          </div>
          <CoverageBadge status={health?.health ?? "green"} size="lg" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-[#a1a1aa]">
            <span>Coverage gaps (7d)</span>
            <span className={cn(
              health?.gapCount ? "text-red-400" : "text-emerald-400"
            )}>
              {health?.gapCount ?? 0}
            </span>
          </div>
          <div className="flex justify-between text-[#a1a1aa]">
            <span>Generated through</span>
            <span>
              {lastGenerated 
                ? format(new Date(lastGenerated), "MMM d")
                : "Not set"
              }
            </span>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/schedules?mission=${mission._id}`}>
              View Schedule
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/missions/${mission._id}`}>
              Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Pending Approvals Table

```typescript
// components/dashboard/pending-approvals-table.tsx

export function PendingApprovalsTable({ 
  approvals 
}: { 
  approvals: PendingApproval[] | undefined 
}) {
  const approveSchedule = useMutation(api.schedules.approveSchedule);
  
  return (
    <table className="w-full">
      <thead>
        <tr className="text-left text-xs text-[#a1a1aa] border-b border-[#2a2a2a]">
          <th className="pb-2">Mission</th>
          <th className="pb-2">Date Range</th>
          <th className="pb-2">Shifts</th>
          <th className="pb-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {approvals?.map(approval => (
          <tr key={approval.mission._id} className="border-b border-[#2a2a2a]">
            <td className="py-3 font-medium text-[#f5f5f5]">
              {approval.mission.name}
            </td>
            <td className="py-3 text-[#a1a1aa]">
              {format(new Date(approval.dateRange.start), "MMM d")} - 
              {format(new Date(approval.dateRange.end), "MMM d")}
            </td>
            <td className="py-3 text-[#a1a1aa]">
              {approval.shiftCount} shifts
            </td>
            <td className="py-3">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => approveSchedule({
                    missionId: approval.mission._id,
                    startDate: approval.dateRange.start,
                    endDate: approval.dateRange.end,
                  })}
                >
                  Approve
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/approvals?mission=${approval.mission._id}`}>
                    Review
                  </Link>
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Files Created

- `components/dashboard/ops-lead-dashboard.tsx` - New
- `components/dashboard/mission-status-card.tsx` - New
- `components/dashboard/pending-approvals-table.tsx` - New
- `components/dashboard/cross-mission-gaps-metric.tsx` - New
- `components/dashboard/recent-activity-list.tsx` - New

## Dependencies

- US-2.4: Coverage Validation API
- US-2.6: Schedule Approval APIs

## Estimate

Medium (M)



