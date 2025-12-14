# US-8.1: TeamLead Dashboard

## User Story

**As a** Team Lead  
**I want** a dashboard showing my team's schedule health  
**So that** I can quickly identify and address coverage issues

## Priority

P0 - Critical for daily operations

## Acceptance Criteria

- [ ] Shows unassigned shift count per mission
- [ ] Shows pending PTO requests count
- [ ] Shows coverage gaps in next 7 days
- [ ] Quick actions to view schedule, extend, manage PTO
- [ ] Mission overview with health indicators
- [ ] My upcoming approvals/actions

## Technical Details

### Dashboard Layout

```typescript
// app/(app)/dashboard/page.tsx

export default function DashboardPage() {
  const currentUser = useQuery(api.users.current);
  
  if (!currentUser) return <Loading />;
  
  // Route to role-specific dashboard
  if (currentUser.role === "BasicUser") {
    return <BasicUserDashboard user={currentUser} />;
  }
  
  if (currentUser.role === "TeamLead") {
    return <TeamLeadDashboard user={currentUser} />;
  }
  
  if (currentUser.role === "OperationsLead" || currentUser.role === "Admin") {
    return <OpsLeadDashboard user={currentUser} />;
  }
  
  return <BasicUserDashboard user={currentUser} />;
}
```

### TeamLead Dashboard

```typescript
// components/dashboard/team-lead-dashboard.tsx

export function TeamLeadDashboard({ user }: { user: User }) {
  const missions = useQuery(api.missions.listActive);
  const pendingPTO = useQuery(api.pto.pending);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#f5f5f5]">
          Welcome back, {user.name?.split(" ")[0] ?? "Team Lead"}
        </h1>
        <p className="text-sm text-[#a1a1aa]">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Open Shifts"
          icon={Calendar}
          accent="amber"
        >
          <OpenShiftsMetric missions={missions} />
        </MetricCard>
        
        <MetricCard
          title="PTO Pending"
          icon={Clock}
          accent="blue"
        >
          <div className="text-2xl font-semibold text-[#f5f5f5]">
            {pendingPTO?.length ?? 0}
          </div>
          <div className="text-sm text-[#a1a1aa]">Awaiting review</div>
        </MetricCard>
        
        <MetricCard
          title="Coverage Gaps"
          icon={AlertTriangle}
          accent="red"
        >
          <CoverageGapsMetric missions={missions} />
        </MetricCard>
        
        <MetricCard
          title="This Week"
          icon={Users}
          accent="emerald"
        >
          <WeekSummaryMetric missions={missions} />
        </MetricCard>
      </div>
      
      {/* Mission Health */}
      <Card>
        <CardHeader>
          <CardTitle>Mission Health</CardTitle>
        </CardHeader>
        <CardContent>
          <MissionHealthGrid missions={missions} />
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pending PTO */}
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>Pending PTO Requests</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/pto">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PendingPTOList requests={pendingPTO?.slice(0, 5)} />
          </CardContent>
        </Card>
        
        {/* Coverage Alerts */}
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>Coverage Alerts</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/schedules">View Schedule</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CoverageAlertsList missions={missions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### Metric Card Component

```typescript
// components/dashboard/metric-card.tsx

interface MetricCardProps {
  title: string;
  icon: React.ComponentType;
  accent: "emerald" | "amber" | "blue" | "red";
  children: React.ReactNode;
}

export function MetricCard({ title, icon: Icon, accent, children }: MetricCardProps) {
  const accentColors = {
    emerald: "border-l-emerald-500",
    amber: "border-l-amber-500",
    blue: "border-l-blue-500",
    red: "border-l-red-500",
  };
  
  return (
    <Card className={cn("border-l-4", accentColors[accent])}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-[#a1a1aa]">
          <Icon className="h-4 w-4" />
          <span className="text-sm">{title}</span>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
```

### Mission Health Grid

```typescript
// components/dashboard/mission-health-grid.tsx

export function MissionHealthGrid({ missions }: { missions: Mission[] | undefined }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {missions?.map(mission => (
        <MissionHealthCard key={mission._id} mission={mission} />
      ))}
    </div>
  );
}

function MissionHealthCard({ mission }: { mission: Mission }) {
  const health = useQuery(api.schedules.getMissionCoverageHealth, {
    missionId: mission._id,
  });
  
  return (
    <Link
      href={`/schedules?mission=${mission._id}`}
      className="flex items-center justify-between p-3 rounded-lg bg-[#111111] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors"
    >
      <div className="flex items-center gap-3">
        <CoverageBadge status={health?.health ?? "green"} size="md" />
        <div>
          <div className="font-medium text-[#f5f5f5]">{mission.name}</div>
          <div className="text-xs text-[#a1a1aa]">
            {health?.gapCount ?? 0} gaps this week
          </div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-[#a1a1aa]" />
    </Link>
  );
}
```

## Files Created/Modified

- `app/(app)/dashboard/page.tsx` - Rewritten
- `components/dashboard/team-lead-dashboard.tsx` - New
- `components/dashboard/metric-card.tsx` - New
- `components/dashboard/mission-health-grid.tsx` - New
- `components/dashboard/pending-pto-list.tsx` - New
- `components/dashboard/coverage-alerts-list.tsx` - New

## Dependencies

- US-2.4: Coverage Validation API

## Estimate

Medium (M)
