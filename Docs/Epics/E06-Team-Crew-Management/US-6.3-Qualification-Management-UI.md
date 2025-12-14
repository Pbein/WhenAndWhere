# US-6.3: Qualification Management UI

## User Story

**As a** Team Lead  
**I want** to create and manage qualification types  
**So that** I can track which certifications employees have

## Priority

P1 - Important for qualification-based filtering

## Acceptance Criteria

- [ ] Admin page to manage qualification types
- [ ] Create new qualifications (name, description, mission)
- [ ] Edit existing qualifications
- [ ] Delete qualifications (with warning if in use)
- [ ] Mission-specific vs global qualifications

## Technical Details

### Qualifications Admin Page

Add to admin section or as part of mission detail:

```typescript
// app/(app)/admin/qualifications/page.tsx

export default function QualificationsAdminPage() {
  const qualifications = useQuery(api.qualifications.list, {});
  const missions = useQuery(api.missions.list);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<Id<"qualifications"> | null>(null);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">Qualifications</h1>
          <p className="text-sm text-[#a1a1aa]">
            Manage certifications and training requirements
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          Add Qualification
        </Button>
      </div>
      
      {/* Global Qualifications */}
      <Card>
        <CardHeader>
          <CardTitle>Global Qualifications</CardTitle>
        </CardHeader>
        <CardContent>
          <QualificationsList
            qualifications={qualifications?.filter(q => !q.missionId)}
            onEdit={setEditingId}
          />
        </CardContent>
      </Card>
      
      {/* Mission-specific Qualifications */}
      {missions?.map(mission => {
        const missionQuals = qualifications?.filter(
          q => q.missionId === mission._id
        );
        
        if (!missionQuals?.length) return null;
        
        return (
          <Card key={mission._id}>
            <CardHeader>
              <CardTitle>{mission.name} Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <QualificationsList
                qualifications={missionQuals}
                onEdit={setEditingId}
              />
            </CardContent>
          </Card>
        );
      })}
      
      {/* Create Dialog */}
      <QualificationFormDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        missions={missions}
      />
      
      {/* Edit Dialog */}
      {editingId && (
        <QualificationFormDialog
          open={true}
          onOpenChange={() => setEditingId(null)}
          qualification={qualifications?.find(q => q._id === editingId)}
          missions={missions}
        />
      )}
    </div>
  );
}
```

### Qualification Form

```typescript
// components/qualifications/qualification-form-dialog.tsx

interface QualificationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qualification?: Qualification;
  missions?: Mission[];
}

export function QualificationFormDialog({
  open,
  onOpenChange,
  qualification,
  missions,
}: QualificationFormDialogProps) {
  const createQual = useMutation(api.qualifications.create);
  const updateQual = useMutation(api.qualifications.update);
  
  const [form, setForm] = useState({
    name: qualification?.name ?? "",
    description: qualification?.description ?? "",
    missionId: qualification?.missionId ?? "",
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (qualification) {
      await updateQual({
        id: qualification._id,
        name: form.name,
        description: form.description,
      });
    } else {
      await createQual({
        name: form.name,
        description: form.description,
        missionId: form.missionId || undefined,
      });
    }
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {qualification ? "Edit Qualification" : "New Qualification"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Panda-certified, First Aid"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What this qualification means"
            />
          </div>
          
          {!qualification && (
            <div className="space-y-2">
              <Label htmlFor="mission">Mission (optional)</Label>
              <select
                id="mission"
                value={form.missionId}
                onChange={e => setForm({ ...form, missionId: e.target.value })}
                className="w-full rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2"
              >
                <option value="">Global (all missions)</option>
                {missions?.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
              <p className="text-xs text-[#a1a1aa]">
                Mission-specific qualifications only appear for that mission
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {qualification ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

## Files Created

- `app/(app)/admin/qualifications/page.tsx`
- `components/qualifications/qualification-form-dialog.tsx`
- `components/qualifications/qualifications-admin-list.tsx`

## Dependencies

- US-2.3: Qualification APIs
- US-1.2: Qualifications Schema

## Estimate

Small (S)
