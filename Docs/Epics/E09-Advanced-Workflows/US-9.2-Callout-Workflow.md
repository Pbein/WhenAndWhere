# US-9.2: Call-out Workflow

## User Story

**As a** Team Lead  
**I want** to handle day-of call-outs efficiently  
**So that** I can quickly find replacements for missing employees

## Priority

P1 - Important for real-time operations

## Acceptance Criteria

- [ ] "Mark Call-out" action on assigned shifts
- [ ] Slot panel shows call-out interface
- [ ] Shift visually marked as call-out (red indicator)
- [ ] Recommended replacements shown immediately
- [ ] One-click replacement assignment
- [ ] Call-out history tracked
- [ ] Dashboard shows pending call-outs

## Technical Details

### Call-out Panel in Slot Panel

```typescript
// components/schedule/callout-section.tsx

interface CalloutSectionProps {
  shiftId: Id<"shiftInstances">;
  assignments: ShiftAssignment[];
}

export function CalloutSection({ shiftId, assignments }: CalloutSectionProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<Id<"shiftAssignments"> | null>(null);
  const [showCalloutForm, setShowCalloutForm] = useState(false);
  const reportCallout = useMutation(api.callouts.report);
  
  // Get any existing call-outs for this shift
  const callouts = useQuery(api.callouts.getForShift, { shiftId });
  
  const handleCallout = async (assignmentId: Id<"shiftAssignments">, reason: string) => {
    await reportCallout({
      shiftAssignmentId: assignmentId,
      reason,
    });
    setShowCalloutForm(false);
  };
  
  return (
    <div className="space-y-3">
      {/* Active Call-outs */}
      {callouts?.filter(c => c.status === "PENDING").map(callout => (
        <div 
          key={callout._id}
          className="p-3 rounded-lg bg-red-500/10 border border-red-500/30"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-400">
              Call-out: {callout.user?.name}
            </span>
            <Badge tone="red" size="sm">PENDING</Badge>
          </div>
          {callout.reason && (
            <p className="text-xs text-[#a1a1aa] mb-2">{callout.reason}</p>
          )}
          <FindReplacementSection callout={callout} shiftId={shiftId} />
        </div>
      ))}
      
      {/* Mark Call-out Button */}
      {assignments.length > 0 && !showCalloutForm && (
        <Button
          variant="outline"
          size="sm"
          className="w-full text-red-500 border-red-500/30"
          onClick={() => setShowCalloutForm(true)}
        >
          Report Call-out
        </Button>
      )}
      
      {/* Call-out Form */}
      {showCalloutForm && (
        <CalloutForm
          assignments={assignments}
          onSubmit={handleCallout}
          onCancel={() => setShowCalloutForm(false)}
        />
      )}
    </div>
  );
}
```

### Find Replacement Section

```typescript
// components/schedule/find-replacement-section.tsx

interface FindReplacementSectionProps {
  callout: CallOut;
  shiftId: Id<"shiftInstances">;
}

export function FindReplacementSection({ callout, shiftId }: FindReplacementSectionProps) {
  const replacements = useQuery(api.schedules.getEligibleReplacements, {
    shiftInstanceId: shiftId,
  });
  const assignReplacement = useMutation(api.callouts.assignReplacement);
  
  const handleAssign = async (userId: Id<"users">) => {
    await assignReplacement({
      calloutId: callout._id,
      replacementUserId: userId,
      role: "PRIMARY",  // Or match original role
    });
  };
  
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-[#f5f5f5]">
        Recommended Replacements
      </div>
      
      {replacements?.slice(0, 5).map(candidate => (
        <div 
          key={candidate.user._id}
          className="flex items-center justify-between p-2 rounded bg-[#111111]"
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs">
              {candidate.user.name?.[0]}
            </div>
            <div>
              <div className="text-sm text-[#f5f5f5]">
                {candidate.user.name}
              </div>
              <div className="flex gap-1">
                {candidate.qualifications?.slice(0, 2).map(q => (
                  <Badge key={q._id} size="sm" tone="blue">
                    {q.name}
                  </Badge>
                ))}
                {candidate.isCrewMember && (
                  <Badge size="sm" tone="green">Crew</Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => handleAssign(candidate.user._id)}
          >
            Assign
          </Button>
        </div>
      ))}
      
      {(!replacements || replacements.length === 0) && (
        <div className="text-xs text-[#a1a1aa] text-center py-2">
          No eligible replacements available
        </div>
      )}
      
      <Button variant="outline" size="sm" className="w-full">
        View All Candidates
      </Button>
    </div>
  );
}
```

### Call-out Form

```typescript
// components/schedule/callout-form.tsx

export function CalloutForm({
  assignments,
  onSubmit,
  onCancel,
}: CalloutFormProps) {
  const [selectedId, setSelectedId] = useState<Id<"shiftAssignments"> | null>(null);
  const [reason, setReason] = useState("");
  
  return (
    <div className="p-3 rounded-lg border border-[#2a2a2a] space-y-3">
      <div className="text-sm font-medium text-[#f5f5f5]">
        Report Call-out
      </div>
      
      <div className="space-y-2">
        <label className="text-xs text-[#a1a1aa]">Who is calling out?</label>
        <div className="space-y-1">
          {assignments.map(a => (
            <button
              key={a._id}
              onClick={() => setSelectedId(a._id)}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded",
                selectedId === a._id 
                  ? "bg-red-500/10 border border-red-500/30"
                  : "bg-[#111111] hover:bg-[#1a1a1a]"
              )}
            >
              <span className="text-sm">{a.user?.name}</span>
              <Badge size="sm">{a.role}</Badge>
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-xs text-[#a1a1aa]">Reason (optional)</label>
        <Input
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g., Sick, Emergency"
        />
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={!selectedId}
          onClick={() => selectedId && onSubmit(selectedId, reason)}
          className="bg-red-500 hover:bg-red-600"
        >
          Report Call-out
        </Button>
      </div>
    </div>
  );
}
```

### Visual Indicators

```typescript
// In shift-cell.tsx

// Add visual indicator for call-outs
const hasCallout = shift.hasActiveCallout;

<div className={cn(
  "shift-cell",
  hasCallout && "ring-2 ring-red-500 bg-red-500/10"
)}>
  {hasCallout && (
    <AlertTriangle className="h-3 w-3 text-red-500 absolute top-1 right-1" />
  )}
  {/* ... rest of cell */}
</div>
```

## Files Created/Modified

- `convex/callouts.ts` - Enhanced (from US-2.5)
- `components/schedule/callout-section.tsx` - New
- `components/schedule/find-replacement-section.tsx` - New
- `components/schedule/callout-form.tsx` - New
- `components/schedule/slot-panel.tsx` - Add callout section
- `components/schedule/shift-cell.tsx` - Add callout indicator

## Dependencies

- US-2.5: Call-out APIs
- US-3.3: Slot Assignment Panel

## Estimate

Large (L)



