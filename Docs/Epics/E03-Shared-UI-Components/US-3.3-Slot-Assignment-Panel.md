# US-3.3: Shift Slot Assignment Panel

## User Story

**As a** Team Lead  
**I want** a side panel to view and manage shift assignments  
**So that** I can quickly assign, change, or remove employees from shifts

## Priority

P0 - Core assignment interaction

## Acceptance Criteria

- [ ] Panel slides in from the right when a shift is selected
- [ ] Shows shift details (date, time, type, crew)
- [ ] Shows current assignments (Primary, Backup, On-Call)
- [ ] "Add" button for each role opens employee picker
- [ ] Employee list is filtered and sorted by eligibility/qualification
- [ ] Search and filter controls in employee picker
- [ ] Qualification badges shown next to employee names
- [ ] "Remove" action for existing assignments

## Technical Details

### Component Props

```typescript
// components/schedule/slot-panel.tsx

interface SlotPanelProps {
  shiftId: Id<"shiftInstances"> | null;
  isOpen: boolean;
  onClose: () => void;
}
```

### Panel Layout

```
┌─────────────────────────────────────┐
│ ← Shift Details                 [X] │
├─────────────────────────────────────┤
│ Monday, December 16, 2024           │
│ Day Shift: 07:00 - 19:00            │
│ Crew A • Lion Mission               │
│                                     │
│ Coverage: 🟡 1/2 Primary            │
├─────────────────────────────────────┤
│ PRIMARY (1/2 required)              │
│ ┌─────────────────────────────────┐ │
│ │ 👤 John Smith                 ✕ │ │
│ │    Lion-certified               │ │
│ └─────────────────────────────────┘ │
│ [+ Add Primary]                     │
├─────────────────────────────────────┤
│ BACKUP (0/1 required)               │
│ (No backups assigned)               │
│ [+ Add Backup]                      │
├─────────────────────────────────────┤
│ ON-CALL                             │
│ (No on-call assigned)               │
│ [+ Add On-Call]                     │
├─────────────────────────────────────┤
│ HISTORY                             │
│ • Dec 14: John assigned by Admin    │
│ • Dec 13: Created from template     │
└─────────────────────────────────────┘
```

### Employee Picker Component

```typescript
// components/schedule/employee-list.tsx

interface EmployeeListProps {
  shiftId: Id<"shiftInstances">;
  role: "PRIMARY" | "BACKUP" | "ON_CALL";
  onSelect: (userId: Id<"users">) => void;
  onClose: () => void;
}

export function EmployeeList({ shiftId, role, onSelect }: EmployeeListProps) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ crewOnly: true });
  
  const candidates = useQuery(api.schedules.getEligibleReplacements, {
    shiftInstanceId: shiftId,
  });
  
  // Filter and sort candidates
  const filtered = useMemo(() => {
    return candidates
      ?.filter(c => 
        c.user.name?.toLowerCase().includes(search.toLowerCase())
      )
      .filter(c => 
        !filters.crewOnly || c.isCrewMember
      )
      .sort((a, b) => {
        // Sort order: qualified > in-training > unqualified
        // Then by crew membership
        // Then alphabetically
      });
  }, [candidates, search, filters]);
  
  return (
    <div className="employee-picker">
      <div className="p-3 border-b border-[#2a2a2a]">
        <Input
          placeholder="Search employees..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <label className="flex items-center gap-2 mt-2 text-xs">
          <input
            type="checkbox"
            checked={filters.crewOnly}
            onChange={e => setFilters({ ...filters, crewOnly: e.target.checked })}
          />
          Show crew members only
        </label>
      </div>
      
      <div className="employee-list max-h-64 overflow-y-auto">
        {filtered?.map(candidate => (
          <EmployeeRow
            key={candidate.user._id}
            user={candidate.user}
            qualifications={candidate.qualifications}
            availability={candidate.availability}
            onClick={() => onSelect(candidate.user._id)}
          />
        ))}
      </div>
    </div>
  );
}
```

### Component Architecture

```typescript
export function SlotPanel({ shiftId, isOpen, onClose }: SlotPanelProps) {
  const shift = useQuery(
    api.schedules.getShiftWithAssignments,
    shiftId ? { shiftId } : "skip"
  );
  
  const [addingRole, setAddingRole] = useState<Role | null>(null);
  const assignUser = useMutation(api.schedules.assignUser);
  const removeAssignment = useMutation(api.schedules.removeAssignment);
  
  const handleAssign = async (userId: Id<"users">) => {
    if (!shiftId || !addingRole) return;
    await assignUser({
      shiftInstanceId: shiftId,
      userId,
      role: addingRole,
    });
    setAddingRole(null);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-96">
        {shift && (
          <>
            <ShiftHeader shift={shift} />
            <CoverageStatus shiftId={shiftId} />
            
            <AssignmentSection
              title="Primary"
              role="PRIMARY"
              assignments={shift.assignments.filter(a => a.role === "PRIMARY")}
              required={shift.shiftDefinition.minPrimary}
              onAdd={() => setAddingRole("PRIMARY")}
              onRemove={removeAssignment}
            />
            
            <AssignmentSection
              title="Backup"
              role="BACKUP"
              assignments={shift.assignments.filter(a => a.role === "BACKUP")}
              required={shift.shiftDefinition.minBackup}
              onAdd={() => setAddingRole("BACKUP")}
              onRemove={removeAssignment}
            />
            
            <AssignmentSection
              title="On-Call"
              role="ON_CALL"
              assignments={shift.assignments.filter(a => a.role === "ON_CALL")}
              required={0}
              onAdd={() => setAddingRole("ON_CALL")}
              onRemove={removeAssignment}
            />
          </>
        )}
        
        {addingRole && (
          <EmployeeList
            shiftId={shiftId!}
            role={addingRole}
            onSelect={handleAssign}
            onClose={() => setAddingRole(null)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
```

## Files Created

- `components/schedule/slot-panel.tsx`
- `components/schedule/employee-list.tsx`
- `components/schedule/employee-row.tsx`
- `components/schedule/assignment-section.tsx`

## Dependencies

- US-2.4: getEligibleReplacements API
- US-3.4: Coverage Status Indicators
- shadcn/ui Sheet component (or similar)

## Estimate

Large (L)



