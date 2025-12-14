# US-7.1: Template List & CRUD

## User Story

**As a** Team Lead  
**I want** to create, view, edit, and delete schedule templates  
**So that** I can manage rotation patterns for my missions

## Priority

P0 - Required for schedule generation

## Acceptance Criteria

- [ ] Templates page lists all templates
- [ ] Create new template with basic info
- [ ] Edit template name and description
- [ ] Delete template (with warning if in use)
- [ ] Shows which missions use each template
- [ ] Template presets for common patterns

## Technical Details

### Enhanced Templates Page

```typescript
// app/(app)/templates/page.tsx

export default function TemplatesPage() {
  const templates = useQuery(api.templates.list);
  const missions = useQuery(api.missions.list);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<Id<"scheduleTemplates"> | null>(null);
  
  // Find which missions use each template
  const templateUsage = useMemo(() => {
    const usage = new Map<string, Mission[]>();
    templates?.forEach(t => usage.set(t._id, []));
    missions?.forEach(m => {
      if (m.activeTemplateId) {
        const list = usage.get(m.activeTemplateId) ?? [];
        list.push(m);
        usage.set(m.activeTemplateId, list);
      }
    });
    return usage;
  }, [templates, missions]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">
            Schedule Templates
          </h1>
          <p className="text-sm text-[#a1a1aa]">
            Manage rotation patterns like Panama 2-2-3
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          Create Template
        </Button>
      </div>
      
      {/* Preset Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start with Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => createPreset("panama")}>
              + Panama 2-2-3
            </Button>
            <Button variant="outline" onClick={() => createPreset("dupont")}>
              + DuPont Schedule
            </Button>
            <Button variant="outline" onClick={() => setIsCreating(true)}>
              + Custom
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Template List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates?.map(template => (
          <TemplateCard
            key={template._id}
            template={template}
            usedBy={templateUsage.get(template._id) ?? []}
            onEdit={() => setEditingId(template._id)}
          />
        ))}
      </div>
      
      {/* Create/Edit Dialog */}
      <TemplateFormDialog
        open={isCreating || !!editingId}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setEditingId(null);
          }
        }}
        template={editingId ? templates?.find(t => t._id === editingId) : undefined}
      />
    </div>
  );
}
```

### Template Card

```typescript
// components/templates/template-card.tsx

interface TemplateCardProps {
  template: ScheduleTemplate;
  usedBy: Mission[];
  onEdit: () => void;
}

export function TemplateCard({ template, usedBy, onEdit }: TemplateCardProps) {
  const deleteTemplate = useMutation(api.templates.remove);
  const [showDelete, setShowDelete] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{template.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">•••</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onEdit}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-500"
                onClick={() => setShowDelete(true)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[#a1a1aa] mb-3">
          {template.description}
        </p>
        
        <div className="grid grid-cols-2 gap-2 text-xs text-[#a1a1aa] mb-3">
          <div>Shift Length: {template.shiftLengthHours}h</div>
          <div>Cycle: {template.cycleDays} days</div>
        </div>
        
        {usedBy.length > 0 && (
          <div className="pt-3 border-t border-[#2a2a2a]">
            <div className="text-xs text-[#a1a1aa] mb-1">Used by:</div>
            <div className="flex gap-1 flex-wrap">
              {usedBy.map(m => (
                <Badge key={m._id} tone="blue" size="sm">
                  {m.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Delete Confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              {usedBy.length > 0 
                ? `This template is used by ${usedBy.length} mission(s). Deleting it may affect their schedules.`
                : "This action cannot be undone."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500"
              onClick={() => deleteTemplate({ id: template._id })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
```

### Template Form Dialog

```typescript
// components/templates/template-form-dialog.tsx

export function TemplateFormDialog({
  open,
  onOpenChange,
  template,
}: TemplateFormDialogProps) {
  const createTemplate = useMutation(api.templates.create);
  const updateTemplate = useMutation(api.templates.update);
  
  const [form, setForm] = useState({
    name: template?.name ?? "",
    description: template?.description ?? "",
    cycleDays: template?.cycleDays ?? 14,
    shiftLengthHours: template?.shiftLengthHours ?? 12,
    patternJson: template?.patternJson ?? "[]",
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (template) {
      await updateTemplate({ id: template._id, ...form });
    } else {
      await createTemplate(form);
    }
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Template" : "New Template"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Panama 2-2-3"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the rotation pattern"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cycle Length (days)</Label>
              <Input
                type="number"
                min={1}
                value={form.cycleDays}
                onChange={e => setForm({ 
                  ...form, 
                  cycleDays: parseInt(e.target.value) 
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Shift Length (hours)</Label>
              <Input
                type="number"
                min={1}
                max={24}
                value={form.shiftLengthHours}
                onChange={e => setForm({ 
                  ...form, 
                  shiftLengthHours: parseInt(e.target.value) 
                })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {template ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

## Files Modified

- `app/(app)/templates/page.tsx` - Enhanced
- `components/templates/template-card.tsx` - New
- `components/templates/template-form-dialog.tsx` - New
- `lib/template-presets.ts` - New (preset pattern data)

## Dependencies

- Existing templates.ts APIs

## Estimate

Small (S)
