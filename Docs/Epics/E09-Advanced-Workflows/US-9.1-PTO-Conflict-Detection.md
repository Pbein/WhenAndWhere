# US-9.1: PTO Conflict Detection

## User Story

**As a** Team Lead  
**I want** to see which shifts will be affected when approving PTO  
**So that** I can plan for coverage gaps before they happen

## Priority

P1 - Important for proactive scheduling

## Acceptance Criteria

- [ ] When approving PTO, system checks for conflicting shifts
- [ ] Modal shows list of affected shifts if conflicts exist
- [ ] Options: "Approve anyway" or "Find replacements first"
- [ ] If approved with conflicts, shifts marked as gaps
- [ ] Notification/prompt to find replacements
- [ ] Conflict count shown on pending PTO card

## Technical Details

### Conflict Detection API

```typescript
// convex/pto.ts

export const getConflicts = query({
  args: { requestId: v.id("ptoRequests") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");
    
    // Find shifts assigned to this user during PTO period
    const userAssignments = await ctx.db
      .query("shiftAssignments")
      .withIndex("by_user", q => q.eq("userId", request.userId))
      .collect();
    
    const conflicts = [];
    
    for (const assignment of userAssignments) {
      const shift = await ctx.db.get(assignment.shiftInstanceId);
      if (!shift) continue;
      
      // Check if shift overlaps with PTO dates
      if (shift.dateStart >= request.startDate && 
          shift.dateStart <= request.endDate) {
        const shiftDef = await ctx.db.get(shift.shiftDefinitionId);
        const mission = await ctx.db.get(shift.missionId);
        
        conflicts.push({
          assignment,
          shift,
          shiftDefinition: shiftDef,
          mission,
        });
      }
    }
    
    return conflicts;
  },
});

// Enhanced approve mutation
export const approveWithConflictHandling = mutation({
  args: {
    requestId: v.id("ptoRequests"),
    handleConflicts: v.union(
      v.literal("mark_as_gaps"),
      v.literal("keep_assigned")  // For temporary/partial PTO
    ),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireRole(ctx, ["TeamLead", "OperationsLead", "Admin"]);
    
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");
    
    // Approve the request
    await ctx.db.patch(args.requestId, {
      status: "APPROVED",
      decidedBy: currentUser._id,
    });
    
    if (args.handleConflicts === "mark_as_gaps") {
      // Remove user from conflicting shifts
      const userAssignments = await ctx.db
        .query("shiftAssignments")
        .withIndex("by_user", q => q.eq("userId", request.userId))
        .collect();
      
      for (const assignment of userAssignments) {
        const shift = await ctx.db.get(assignment.shiftInstanceId);
        if (!shift) continue;
        
        if (shift.dateStart >= request.startDate && 
            shift.dateStart <= request.endDate) {
          // Delete assignment (creates gap)
          await ctx.db.delete(assignment._id);
        }
      }
    }
    
    return { success: true };
  },
});
```

### Conflict Modal Component

```typescript
// components/pto/conflict-modal.tsx

interface ConflictModalProps {
  requestId: Id<"ptoRequests">;
  request: PTORequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
}

export function PTOConflictModal({
  requestId,
  request,
  open,
  onOpenChange,
  onApprove,
}: ConflictModalProps) {
  const conflicts = useQuery(api.pto.getConflicts, { requestId });
  const approveWithHandling = useMutation(api.pto.approveWithConflictHandling);
  const [isApproving, setIsApproving] = useState(false);
  
  const handleApprove = async (handling: "mark_as_gaps" | "keep_assigned") => {
    setIsApproving(true);
    try {
      await approveWithHandling({
        requestId,
        handleConflicts: handling,
      });
      onApprove();
      onOpenChange(false);
    } finally {
      setIsApproving(false);
    }
  };
  
  if (!conflicts?.length) {
    // No conflicts - simple approval
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve PTO Request</AlertDialogTitle>
            <AlertDialogDescription>
              No scheduling conflicts found. Approve this request?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleApprove("keep_assigned")}>
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
  
  // Has conflicts
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Scheduling Conflicts Detected
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-[#a1a1aa]">
            This employee is assigned to {conflicts.length} shift(s) during 
            their requested PTO period:
          </p>
          
          <div className="max-h-48 overflow-y-auto space-y-2">
            {conflicts.map(conflict => (
              <div 
                key={conflict.assignment._id}
                className="p-2 rounded bg-[#111111] border border-[#2a2a2a]"
              >
                <div className="flex justify-between">
                  <span className="font-medium text-[#f5f5f5]">
                    {format(new Date(conflict.shift.dateStart), "EEE, MMM d")}
                  </span>
                  <Badge tone="blue">{conflict.assignment.role}</Badge>
                </div>
                <div className="text-xs text-[#a1a1aa]">
                  {conflict.mission?.name} • {conflict.shiftDefinition?.label}
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-[#2a2a2a] space-y-2">
            <p className="text-sm font-medium text-[#f5f5f5]">
              How would you like to handle these conflicts?
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleApprove("mark_as_gaps")}
            disabled={isApproving}
          >
            Approve & Create Gaps
          </Button>
          <Button asChild>
            <Link href={`/schedules?highlight=${conflicts.map(c => c.shift._id).join(",")}`}>
              Find Replacements First
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Enhanced PTO Approval UI

```typescript
// In PTO page pending approvals section

{pendingRequests?.map((req) => {
  const conflicts = useQuery(api.pto.getConflicts, { requestId: req._id });
  
  return (
    <div key={req._id} className="...">
      {/* ... existing content ... */}
      
      {conflicts && conflicts.length > 0 && (
        <Badge tone="amber" size="sm">
          {conflicts.length} conflict(s)
        </Badge>
      )}
      
      <Button onClick={() => setApprovingRequest(req)}>
        Review & Approve
      </Button>
    </div>
  );
})}

{approvingRequest && (
  <PTOConflictModal
    requestId={approvingRequest._id}
    request={approvingRequest}
    open={!!approvingRequest}
    onOpenChange={() => setApprovingRequest(null)}
    onApprove={() => setApprovingRequest(null)}
  />
)}
```

## Files Created/Modified

- `convex/pto.ts` - Add getConflicts and approveWithConflictHandling
- `components/pto/conflict-modal.tsx` - New
- `app/(app)/pto/page.tsx` - Enhanced with conflict checking

## Dependencies

- Existing PTO APIs
- US-2.4: Coverage validation (for gap indication)

## Estimate

Medium (M)
