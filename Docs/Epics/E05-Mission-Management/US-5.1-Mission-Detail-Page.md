# US-5.1: Mission Detail Page

## User Story

**As a** Team Lead  
**I want** a dedicated page for each mission  
**So that** I can see all mission information and configuration in one place

## Priority

P0 - Central mission management

## Acceptance Criteria

- [ ] Route: `/missions/[id]` displays mission details
- [ ] Shows mission name, description, and status
- [ ] Lists all crews with member counts
- [ ] Shows shift definitions (Day/Night times)
- [ ] Quick links to schedule, extend, and manage
- [ ] Editable fields for authorized users

## Technical Details

### Route Structure

```
app/(app)/missions/
├── page.tsx              # List view (existing)
└── [id]/
    └── page.tsx          # Detail view (new)
```

### Page Layout

```typescript
// app/(app)/missions/[id]/page.tsx

interface Props {
  params: { id: string };
}

export default function MissionDetailPage({ params }: Props) {
  const mission = useQuery(api.missions.get, { 
    id: params.id as Id<"zooMissions"> 
  });
  const crews = useQuery(api.teams.listByMission, { 
    missionId: params.id as Id<"zooMissions"> 
  });
  const shiftDefs = useQuery(api.shiftDefinitions.listByMission, {
    missionId: params.id as Id<"zooMissions">
  });
  
  if (!mission) return <Loading />;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <MissionHeader mission={mission} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lifecycle Card */}
        <MissionLifecycleCard mission={mission} />
        
        {/* Crews Card */}
        <CrewsCard crews={crews} missionId={mission._id} />
        
        {/* Shift Definitions Card */}
        <ShiftDefinitionsCard 
          shiftDefs={shiftDefs} 
          missionId={mission._id} 
        />
        
        {/* Quick Actions Card */}
        <QuickActionsCard mission={mission} />
      </div>
    </div>
  );
}
```

### Mission Header

```typescript
// components/missions/mission-header.tsx

export function MissionHeader({ mission }: { mission: Mission }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">
            {mission.name}
          </h1>
          <Badge tone={mission.status === "ACTIVE" ? "green" : "gray"}>
            {mission.status}
          </Badge>
        </div>
        <p className="text-sm text-[#a1a1aa] mt-1">
          {mission.description}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href={`/schedules?mission=${mission._id}`}>
            View Schedule
          </Link>
        </Button>
        <Button variant="outline">
          Edit Mission
        </Button>
      </div>
    </div>
  );
}
```

### Crews Card

```typescript
// components/missions/crews-card.tsx

export function CrewsCard({ 
  crews, 
  missionId 
}: { 
  crews: Team[] | undefined;
  missionId: Id<"zooMissions">;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Crews</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/teams?mission=${missionId}`}>Manage</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {crews?.map(crew => (
          <div 
            key={crew._id}
            className="flex items-center justify-between p-2 rounded bg-[#111111]"
          >
            <div>
              <div className="font-medium text-[#f5f5f5]">{crew.name}</div>
              <div className="text-xs text-[#a1a1aa]">{crew.focus}</div>
            </div>
            <div className="text-sm text-[#a1a1aa]">
              {/* Member count - needs API */}
              4 members
            </div>
          </div>
        ))}
        {(!crews || crews.length === 0) && (
          <div className="text-sm text-[#a1a1aa]">No crews configured</div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Shift Definitions Card

```typescript
// components/missions/shift-definitions-card.tsx

export function ShiftDefinitionsCard({ 
  shiftDefs, 
  missionId 
}: { 
  shiftDefs: ShiftDefinition[] | undefined;
  missionId: Id<"zooMissions">;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shift Definitions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {shiftDefs?.map(def => (
          <div 
            key={def._id}
            className="flex items-center justify-between p-2 rounded bg-[#111111]"
          >
            <div>
              <div className="font-medium text-[#f5f5f5]">{def.label}</div>
              <div className="text-xs text-[#a1a1aa]">
                {def.startTime} - {def.endTime}
              </div>
            </div>
            <div className="text-xs text-[#a1a1aa]">
              Min: {def.minPrimary} primary, {def.minBackup} backup
            </div>
          </div>
        ))}
        {(!shiftDefs || shiftDefs.length === 0) && (
          <div className="text-sm text-[#a1a1aa]">
            No shift definitions. Add Day/Night shifts to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## Files Created

- `app/(app)/missions/[id]/page.tsx`
- `components/missions/mission-header.tsx`
- `components/missions/crews-card.tsx`
- `components/missions/shift-definitions-card.tsx`
- `components/missions/quick-actions-card.tsx`

## Dependencies

- US-1.1: Mission Lifecycle Schema

## Estimate

Medium (M)



