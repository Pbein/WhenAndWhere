# US-9.3: Schedule Approval Flow

## User Story

**As an** Operations Lead  
**I want** a dedicated page to review and approve schedules  
**So that** I can ensure schedules are complete before they go live

## Priority

P0 - Critical for operational sign-off

## Acceptance Criteria

- [ ] Approvals page shows pending schedules by mission
- [ ] Calendar preview of pending schedule
- [ ] Coverage summary and gap indicators
- [ ] Approve button finalizes schedule
- [ ] Reject button returns to draft with comment
- [ ] Email/notification to Team Lead on decision
- [ ] Approval history tracked

## Technical Details

### Approvals Page

```typescript
// app/(app)/approvals/page.tsx

export default function ApprovalsPage() {
  const currentUser = useQuery(api.users.current);
  const pendingApprovals = useQuery(api.schedules.getPendingApprovals);
  const [selectedMissionId, setSelectedMissionId] = useState<Id<"zooMissions"> | null>(null);
  
  // Check authorization
  if (currentUser && !["OperationsLead", "Admin"].includes(currentUser.role)) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#f5f5f5]">Access Denied</h2>
          <p className="text-[#a1a1aa]">Only Operations Leads can access this page.</p>
        </div>
      </div>
    );
  }
  
  const selectedApproval = pendingApprovals?.find(
    a => a.mission._id === selectedMissionId
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#f5f5f5]">
          Schedule Approvals
        </h1>
        <p className="text-sm text-[#a1a1aa]">
          Review and approve pending schedules
        </p>
      </div>
      
      {(!pendingApprovals || pendingApprovals.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#f5f5f5]">All caught up!</h3>
            <p className="text-[#a1a1aa]">No schedules pending approval.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pending List */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-[#a1a1aa]">
              Pending ({pendingApprovals.length})
            </h2>
            {pendingApprovals.map(approval => (
              <ApprovalCard
                key={approval.mission._id}
                approval={approval}
                isSelected={selectedMissionId === approval.mission._id}
                onClick={() => setSelectedMissionId(approval.mission._id)}
              />
            ))}
          </div>
          
          {/* Preview Panel */}
          <div className="lg:col-span-2">
            {selectedApproval ? (
              <ApprovalPreview approval={selectedApproval} />
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-[#a1a1aa]">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a schedule to preview</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Approval Card

```typescript
// components/approvals/approval-card.tsx

interface ApprovalCardProps {
  approval: PendingApproval;
  isSelected: boolean;
  onClick: () => void;
}

export function ApprovalCard({ approval, isSelected, onClick }: ApprovalCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-lg border transition-colors",
        isSelected 
          ? "border-emerald-500 bg-emerald-500/10"
          : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="font-medium text-[#f5f5f5]">{approval.mission.name}</div>
        <Badge tone="amber">{approval.shiftCount} shifts</Badge>
      </div>
      <div className="text-sm text-[#a1a1aa]">
        {format(new Date(approval.dateRange.start), "MMM d")} - 
        {format(new Date(approval.dateRange.end), "MMM d")}
      </div>
    </button>
  );
}
```

### Approval Preview

```typescript
// components/approvals/approval-preview.tsx

interface ApprovalPreviewProps {
  approval: PendingApproval;
}

export function ApprovalPreview({ approval }: ApprovalPreviewProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const approveSchedule = useMutation(api.schedules.approveSchedule);
  const rejectSchedule = useMutation(api.schedules.rejectSchedule);
  
  const coverage = useQuery(api.schedules.validateCoverage, {
    missionId: approval.mission._id,
    startDate: approval.dateRange.start,
    endDate: approval.dateRange.end,
  });
  
  const handleApprove = async () => {
    await approveSchedule({
      missionId: approval.mission._id,
      startDate: approval.dateRange.start,
      endDate: approval.dateRange.end,
    });
    toast.success("Schedule approved");
  };
  
  const handleReject = async (reason: string) => {
    await rejectSchedule({
      missionId: approval.mission._id,
      startDate: approval.dateRange.start,
      endDate: approval.dateRange.end,
      reason,
    });
    toast.success("Schedule returned to Team Lead");
    setShowRejectDialog(false);
  };
  
  const hasGaps = coverage && coverage.length > 0;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{approval.mission.name}</CardTitle>
            <p className="text-sm text-[#a1a1aa]">
              {format(new Date(approval.dateRange.start), "MMMM d")} - 
              {format(new Date(approval.dateRange.end), "MMMM d, yyyy")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowRejectDialog(true)}
            >
              Reject
            </Button>
            <Button onClick={handleApprove}>
              Approve
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Coverage Summary */}
        <div className={cn(
          "p-3 rounded-lg",
          hasGaps ? "bg-amber-500/10 border border-amber-500/30" : "bg-emerald-500/10 border border-emerald-500/30"
        )}>
          <div className="flex items-center gap-2">
            {hasGaps ? (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="font-medium text-amber-400">
                  {coverage.length} coverage gap(s) detected
                </span>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="font-medium text-emerald-400">
                  Full coverage achieved
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Gap List */}
        {hasGaps && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[#f5f5f5]">Coverage Gaps</h3>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {coverage.map(gap => (
                <div 
                  key={gap.shiftInstanceId}
                  className="flex justify-between text-sm p-2 rounded bg-[#111111]"
                >
                  <span className="text-[#a1a1aa]">
                    {format(new Date(gap.date), "EEE, MMM d")} - {gap.shiftType}
                  </span>
                  <span className="text-red-400">{gap.details.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Calendar Preview */}
        <div className="border-t border-[#2a2a2a] pt-4">
          <h3 className="text-sm font-medium text-[#f5f5f5] mb-3">
            Schedule Preview
          </h3>
          <WeekGrid
            missionId={approval.mission._id}
            startDate={new Date(approval.dateRange.start)}
            endDate={new Date(approval.dateRange.end)}
            readOnly
          />
        </div>
      </CardContent>
      
      {/* Reject Dialog */}
      <RejectScheduleDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onReject={handleReject}
      />
    </Card>
  );
}
```

### Reject Dialog

```typescript
// components/approvals/reject-schedule-dialog.tsx

export function RejectScheduleDialog({
  open,
  onOpenChange,
  onReject,
}: RejectScheduleDialogProps) {
  const [reason, setReason] = useState("");
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Schedule</DialogTitle>
          <DialogDescription>
            The schedule will be returned to the Team Lead for revision.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2">
          <Label>Reason for rejection</Label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Please explain what needs to be fixed..."
            className="w-full h-24 rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-sm"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => onReject(reason)}
            disabled={!reason.trim()}
            className="bg-red-500 hover:bg-red-600"
          >
            Reject Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Files Created

- `app/(app)/approvals/page.tsx` - New
- `components/approvals/approval-card.tsx` - New
- `components/approvals/approval-preview.tsx` - New
- `components/approvals/reject-schedule-dialog.tsx` - New

## Dependencies

- US-2.6: Schedule Approval APIs
- US-2.4: Coverage Validation API
- US-3.1: Week Grid Calendar (read-only mode)

## Estimate

Medium (M)




