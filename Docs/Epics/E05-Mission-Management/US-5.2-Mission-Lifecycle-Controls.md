# US-5.2: Mission Lifecycle Controls

## User Story

**As a** Team Lead  
**I want** to configure mission schedule settings  
**So that** I can set up the Panama pattern and manage the mission lifecycle

## Priority

P0 - Required for schedule generation

## Acceptance Criteria

- [ ] Select active schedule template (Panama 2-2-3, etc.)
- [ ] Set cycle anchor date (when pattern starts)
- [ ] Set mission start and end dates
- [ ] Pause/Resume mission
- [ ] Terminate mission with confirmation
- [ ] Show current cycle position visual

## Technical Details

### Lifecycle Card Component

```typescript
// components/missions/mission-lifecycle-card.tsx

export function MissionLifecycleCard({ 
  mission 
}: { 
  mission: Mission 
}) {
  const templates = useQuery(api.templates.list);
  const updateMission = useMutation(api.missions.update);
  const startSchedule = useMutation(api.schedules.startMissionSchedule);
  
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Schedule Configuration</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Done" : "Edit"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Template Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">
              Schedule Template
            </label>
            {isEditing ? (
              <select
                value={mission.activeTemplateId ?? ""}
                onChange={async (e) => {
                  if (e.target.value) {
                    await startSchedule({
                      missionId: mission._id,
                      templateId: e.target.value as Id<"scheduleTemplates">,
                      anchorDate: mission.cycleAnchorDate ?? Date.now(),
                    });
                  }
                }}
                className="w-full rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2"
              >
                <option value="">Select template...</option>
                {templates?.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            ) : (
              <div className="text-[#f5f5f5]">
                {templates?.find(t => t._id === mission.activeTemplateId)?.name 
                  ?? "Not configured"}
              </div>
            )}
          </div>
          
          {/* Anchor Date */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">
              Cycle Anchor Date
            </label>
            {isEditing ? (
              <input
                type="date"
                value={mission.cycleAnchorDate 
                  ? format(new Date(mission.cycleAnchorDate), "yyyy-MM-dd")
                  : ""
                }
                onChange={async (e) => {
                  const date = new Date(e.target.value);
                  await updateMission({
                    id: mission._id,
                    cycleAnchorDate: date.getTime(),
                  });
                }}
                className="w-full rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2"
              />
            ) : (
              <div className="text-[#f5f5f5]">
                {mission.cycleAnchorDate 
                  ? format(new Date(mission.cycleAnchorDate), "MMM d, yyyy")
                  : "Not set"}
              </div>
            )}
          </div>
          
          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">
              Status
            </label>
            <div className="flex items-center gap-2">
              <Badge tone={
                mission.status === "ACTIVE" ? "green" :
                mission.status === "PAUSED" ? "amber" : "red"
              }>
                {mission.status}
              </Badge>
              {isEditing && mission.status !== "TERMINATED" && (
                <MissionStatusActions mission={mission} />
              )}
            </div>
          </div>
        </div>
        
        {/* Cycle Position Indicator */}
        {mission.activeTemplateId && mission.cycleAnchorDate && (
          <CyclePositionIndicator mission={mission} />
        )}
        
        {/* Mission Dates */}
        <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#a1a1aa]">
                Mission Start
              </label>
              <div className="text-[#f5f5f5]">
                {mission.startDate 
                  ? format(new Date(mission.startDate), "MMM d, yyyy")
                  : "Not set"}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[#a1a1aa]">
                Mission End
              </label>
              <div className="text-[#f5f5f5]">
                {mission.endDate 
                  ? format(new Date(mission.endDate), "MMM d, yyyy")
                  : "Indefinite"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Cycle Position Indicator

```typescript
// components/missions/cycle-position-indicator.tsx

export function CyclePositionIndicator({ mission }: { mission: Mission }) {
  const template = useQuery(api.templates.get, {
    id: mission.activeTemplateId!,
  });
  
  if (!template) return null;
  
  const today = Date.now();
  const daysSinceAnchor = Math.floor(
    (today - mission.cycleAnchorDate!) / (24 * 60 * 60 * 1000)
  );
  const cycleDay = daysSinceAnchor % template.cycleDays;
  const cycleNumber = Math.floor(daysSinceAnchor / template.cycleDays) + 1;
  
  return (
    <div className="mt-4 p-3 rounded-lg bg-[#1a1a1a]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#a1a1aa]">Current Cycle Position</span>
        <span className="text-xs text-[#a1a1aa]">Cycle #{cycleNumber}</span>
      </div>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: template.cycleDays }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-3 flex-1 rounded-sm",
              i < cycleDay ? "bg-emerald-500" :
              i === cycleDay ? "bg-emerald-400 animate-pulse" :
              "bg-[#2a2a2a]"
            )}
          />
        ))}
      </div>
      
      <div className="flex justify-between mt-1 text-xs text-[#a1a1aa]">
        <span>Day {cycleDay + 1} of {template.cycleDays}</span>
        <span>Next cycle: {format(
          addDays(new Date(mission.cycleAnchorDate!), 
            (cycleNumber) * template.cycleDays),
          "MMM d"
        )}</span>
      </div>
    </div>
  );
}
```

### Status Actions

```typescript
// components/missions/mission-status-actions.tsx

export function MissionStatusActions({ mission }: { mission: Mission }) {
  const updateMission = useMutation(api.missions.update);
  const [showTerminate, setShowTerminate] = useState(false);
  
  return (
    <div className="flex gap-2">
      {mission.status === "ACTIVE" && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => updateMission({ 
            id: mission._id, 
            status: "PAUSED" 
          })}
        >
          Pause
        </Button>
      )}
      
      {mission.status === "PAUSED" && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => updateMission({ 
            id: mission._id, 
            status: "ACTIVE" 
          })}
        >
          Resume
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="sm"
        className="text-red-500"
        onClick={() => setShowTerminate(true)}
      >
        Terminate
      </Button>
      
      <TerminateMissionDialog
        mission={mission}
        open={showTerminate}
        onOpenChange={setShowTerminate}
      />
    </div>
  );
}
```

## Files Created

- `components/missions/mission-lifecycle-card.tsx`
- `components/missions/cycle-position-indicator.tsx`
- `components/missions/mission-status-actions.tsx`
- `components/missions/terminate-mission-dialog.tsx`

## Dependencies

- US-1.1: Mission Lifecycle Schema
- US-2.1: startMissionSchedule API

## Estimate

Medium (M)




