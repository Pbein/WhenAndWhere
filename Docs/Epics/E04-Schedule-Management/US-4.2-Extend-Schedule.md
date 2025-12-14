# US-4.2: Schedules Page - Extend Schedule ✅ COMPLETE

## User Story

**As a** Team Lead  
**I want** to generate more shifts into the future  
**So that** the schedule extends beyond the current generated dates

## Priority

P0 - Core scheduling workflow

## Acceptance Criteria

- [x] "Extend Schedule" button visible when mission has active template
- [x] Shows modal with duration options (2 weeks, 1 month, 3 months, 6 months)
- [x] Displays current "generated through" date
- [x] Preview shows how many shifts will be created
- [x] Progress indicator during generation
- [x] Success message with count of shifts created
- [x] Calendar automatically shows new date range after extension

## Technical Details

### Extend Schedule Modal

```typescript
// components/schedule/extend-schedule-modal.tsx

interface ExtendScheduleModalProps {
  missionId: Id<"zooMissions">;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newEndDate: Date) => void;
}

const DURATION_OPTIONS = [
  { label: "1 Month", days: 30 },
  { label: "3 Months", days: 90 },
  { label: "6 Months", days: 180 },
  { label: "1 Year", days: 365 },
];

export function ExtendScheduleModal({ 
  missionId, 
  isOpen, 
  onClose,
  onSuccess 
}: ExtendScheduleModalProps) {
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[0]);
  const [isExtending, setIsExtending] = useState(false);
  
  const lastGeneratedDate = useQuery(api.schedules.getLastGeneratedDate, {
    missionId,
  });
  
  const extendSchedule = useMutation(api.schedules.extendSchedule);
  
  const startDate = lastGeneratedDate 
    ? new Date(lastGeneratedDate) 
    : new Date();
  
  const endDate = addDays(startDate, selectedDuration.days);
  
  const handleExtend = async () => {
    setIsExtending(true);
    try {
      const result = await extendSchedule({
        missionId,
        endDate: endDate.getTime(),
      });
      
      toast.success(`Generated ${result.generated} shifts`);
      onSuccess(endDate);
      onClose();
    } catch (error) {
      toast.error("Failed to extend schedule");
    } finally {
      setIsExtending(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend Schedule</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current status */}
          <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
            <div className="text-xs text-[#a1a1aa]">Currently generated through</div>
            <div className="text-lg font-medium text-[#f5f5f5]">
              {lastGeneratedDate 
                ? format(new Date(lastGeneratedDate), "MMMM d, yyyy")
                : "No shifts generated yet"
              }
            </div>
          </div>
          
          {/* Duration selection */}
          <div className="space-y-2">
            <label className="text-sm text-[#a1a1aa]">Extend by</label>
            <div className="grid grid-cols-2 gap-2">
              {DURATION_OPTIONS.map(option => (
                <button
                  key={option.days}
                  onClick={() => setSelectedDuration(option)}
                  className={cn(
                    "p-3 rounded-lg border text-sm",
                    selectedDuration.days === option.days
                      ? "border-[#10b981] bg-[#10b981]/10 text-[#10b981]"
                      : "border-[#2a2a2a] text-[#a1a1aa]"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Preview */}
          <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
            <div className="text-xs text-[#a1a1aa]">Will generate through</div>
            <div className="text-lg font-medium text-[#f5f5f5]">
              {format(endDate, "MMMM d, yyyy")}
            </div>
            <div className="text-xs text-[#a1a1aa] mt-1">
              ~{selectedDuration.days * 2} shifts (Day + Night)
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleExtend} 
            disabled={isExtending}
          >
            {isExtending ? (
              <>
                <Spinner className="mr-2" />
                Generating...
              </>
            ) : (
              "Extend Schedule"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Integration in Schedules Page

```typescript
// In app/(app)/schedules/page.tsx

const [showExtendModal, setShowExtendModal] = useState(false);

// In header actions
<Button onClick={() => setShowExtendModal(true)} disabled={!missionId}>
  Extend Schedule
</Button>

// Modal
<ExtendScheduleModal
  missionId={missionId!}
  isOpen={showExtendModal}
  onClose={() => setShowExtendModal(false)}
  onSuccess={(newEndDate) => {
    // Optionally navigate to new date range
    setDateRange(getWeekRange(newEndDate));
  }}
/>
```

### Schedule Status Indicator

Show current generation status in header:

```typescript
// components/schedule/schedule-status.tsx

export function ScheduleStatus({ missionId }: { missionId: Id<"zooMissions"> }) {
  const lastDate = useQuery(api.schedules.getLastGeneratedDate, { missionId });
  
  if (!lastDate) {
    return (
      <div className="text-xs text-amber-500">
        No schedule generated yet
      </div>
    );
  }
  
  const daysAhead = differenceInDays(new Date(lastDate), new Date());
  
  return (
    <div className="text-xs text-[#a1a1aa]">
      Generated through {format(new Date(lastDate), "MMM d")} 
      ({daysAhead} days ahead)
    </div>
  );
}
```

## Files Created

- `components/schedule/extend-schedule-modal.tsx`
- `components/schedule/schedule-status.tsx`

## Dependencies

- US-2.1: Continuous Schedule Generation API

## Estimate

Medium (M)
