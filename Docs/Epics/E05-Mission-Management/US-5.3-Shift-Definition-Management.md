# US-5.3: Shift Definition Management

## User Story

**As a** Team Lead  
**I want** to configure Day/Night shift times and coverage requirements  
**So that** shifts are generated with the correct parameters

## Priority

P1 - Important for proper schedule generation

## Acceptance Criteria

- [ ] Create new shift definitions (Day, Night, Custom)
- [ ] Set start/end times for each shift type
- [ ] Set minimum primary and backup counts
- [ ] Edit existing shift definitions
- [ ] Delete unused shift definitions
- [ ] Validation prevents overlapping times

## Technical Details

### Shift Definition Form

```typescript
// components/missions/shift-definition-form.tsx

interface ShiftDefinitionFormProps {
  missionId: Id<"zooMissions">;
  shiftDef?: ShiftDefinition;  // For editing
  onSuccess: () => void;
  onCancel: () => void;
}

export function ShiftDefinitionForm({ 
  missionId, 
  shiftDef, 
  onSuccess, 
  onCancel 
}: ShiftDefinitionFormProps) {
  const createShiftDef = useMutation(api.shiftDefinitions.create);
  const updateShiftDef = useMutation(api.shiftDefinitions.update);
  
  const [form, setForm] = useState({
    label: shiftDef?.label ?? "",
    startTime: shiftDef?.startTime ?? "07:00",
    endTime: shiftDef?.endTime ?? "19:00",
    minPrimary: shiftDef?.minPrimary ?? 2,
    minBackup: shiftDef?.minBackup ?? 1,
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (shiftDef) {
      await updateShiftDef({
        id: shiftDef._id,
        ...form,
      });
    } else {
      await createShiftDef({
        missionId,
        ...form,
      });
    }
    
    onSuccess();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Label */}
      <div className="space-y-2">
        <Label htmlFor="label">Shift Name</Label>
        <Input
          id="label"
          value={form.label}
          onChange={e => setForm({ ...form, label: e.target.value })}
          placeholder="e.g., Day, Night, Morning"
        />
      </div>
      
      {/* Times */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={form.startTime}
            onChange={e => setForm({ ...form, startTime: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={form.endTime}
            onChange={e => setForm({ ...form, endTime: e.target.value })}
          />
        </div>
      </div>
      
      {/* Coverage Requirements */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minPrimary">Minimum Primary</Label>
          <Input
            id="minPrimary"
            type="number"
            min={1}
            value={form.minPrimary}
            onChange={e => setForm({ 
              ...form, 
              minPrimary: parseInt(e.target.value) 
            })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minBackup">Minimum Backup</Label>
          <Input
            id="minBackup"
            type="number"
            min={0}
            value={form.minBackup}
            onChange={e => setForm({ 
              ...form, 
              minBackup: parseInt(e.target.value) 
            })}
          />
        </div>
      </div>
      
      {/* Presets */}
      <div className="space-y-2">
        <Label>Quick Presets</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setForm({
              ...form,
              label: "Day",
              startTime: "07:00",
              endTime: "19:00",
            })}
          >
            Day (7am-7pm)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setForm({
              ...form,
              label: "Night",
              startTime: "19:00",
              endTime: "07:00",
            })}
          >
            Night (7pm-7am)
          </Button>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {shiftDef ? "Update" : "Create"} Shift
        </Button>
      </div>
    </form>
  );
}
```

### Enhanced Shift Definitions Card

```typescript
// components/missions/shift-definitions-card.tsx (updated)

export function ShiftDefinitionsCard({ 
  shiftDefs, 
  missionId 
}: ShiftDefinitionsCardProps) {
  const [editingId, setEditingId] = useState<Id<"shiftDefinitions"> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const deleteShiftDef = useMutation(api.shiftDefinitions.remove);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Shift Definitions</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsAdding(true)}
          >
            + Add Shift
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {shiftDefs?.map(def => (
          <div 
            key={def._id}
            className="flex items-center justify-between p-3 rounded bg-[#111111]"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#f5f5f5]">{def.label}</span>
                <span className="text-xs text-[#a1a1aa]">
                  {def.startTime} - {def.endTime}
                </span>
              </div>
              <div className="text-xs text-[#a1a1aa] mt-1">
                Required: {def.minPrimary} primary, {def.minBackup} backup
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingId(def._id)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500"
                onClick={() => deleteShiftDef({ id: def._id })}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
        
        {isAdding && (
          <ShiftDefinitionForm
            missionId={missionId}
            onSuccess={() => setIsAdding(false)}
            onCancel={() => setIsAdding(false)}
          />
        )}
        
        {editingId && (
          <Dialog open onOpenChange={() => setEditingId(null)}>
            <DialogContent>
              <ShiftDefinitionForm
                missionId={missionId}
                shiftDef={shiftDefs?.find(d => d._id === editingId)}
                onSuccess={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
```

## Files Created/Modified

- `components/missions/shift-definition-form.tsx` - New
- `components/missions/shift-definitions-card.tsx` - Enhanced

## Dependencies

- E01: Schema (shiftDefinitions table)
- Existing shiftDefinitions.ts APIs

## Estimate

Small (S)



