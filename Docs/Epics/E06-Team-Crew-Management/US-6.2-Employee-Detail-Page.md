# US-6.2: Employee Detail Page

## User Story

**As a** Team Lead  
**I want** a detail page for each employee  
**So that** I can view and manage their profile, qualifications, and schedule

## Priority

P0 - Core employee management

## Acceptance Criteria

- [ ] Route: `/crew/[id]` displays employee details
- [ ] Shows profile info (name, email, role, status)
- [ ] Lists crew memberships with primary indicator
- [ ] Shows all qualifications with status
- [ ] Shows upcoming shift assignments
- [ ] Shows PTO history
- [ ] Edit capabilities for authorized users

## Technical Details

### Route Structure

```
app/(app)/crew/
├── page.tsx              # List view (existing)
└── [id]/
    └── page.tsx          # Detail view (new)
```

### Page Layout

```typescript
// app/(app)/crew/[id]/page.tsx

interface Props {
  params: { id: string };
}

export default function EmployeeDetailPage({ params }: Props) {
  const userId = params.id as Id<"users">;
  const user = useQuery(api.users.get, { id: userId });
  const crews = useQuery(api.teams.getUserCrews, { userId });
  const qualifications = useQuery(api.qualifications.getUserQualifications, { userId });
  const upcomingShifts = useQuery(api.schedules.getUserUpcomingShifts, { 
    userId,
    limit: 10,
  });
  const ptoHistory = useQuery(api.pto.getUserHistory, { userId });
  
  if (!user) return <Loading />;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <EmployeeHeader user={user} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crew Memberships */}
        <Card>
          <CardHeader>
            <CardTitle>Crew Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            <CrewMembershipsList crews={crews} userId={userId} />
          </CardContent>
        </Card>
        
        {/* Qualifications */}
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>Qualifications</CardTitle>
              <Button variant="ghost" size="sm">Manage</Button>
            </div>
          </CardHeader>
          <CardContent>
            <QualificationsList 
              qualifications={qualifications} 
              userId={userId} 
            />
          </CardContent>
        </Card>
        
        {/* Upcoming Shifts */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <UpcomingShiftsList shifts={upcomingShifts} />
          </CardContent>
        </Card>
        
        {/* PTO History */}
        <Card>
          <CardHeader>
            <CardTitle>PTO History</CardTitle>
          </CardHeader>
          <CardContent>
            <PTOHistoryList requests={ptoHistory} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### Employee Header

```typescript
// components/crew/employee-header.tsx

export function EmployeeHeader({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-[#2a2a2a] flex items-center justify-center text-2xl">
          {user.name?.[0] ?? "?"}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">
            {user.name ?? "Unknown"}
          </h1>
          <p className="text-sm text-[#a1a1aa]">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge tone="blue">{user.role}</Badge>
            <Badge tone={user.status === "ACTIVE" ? "green" : "amber"}>
              {user.status ?? "ACTIVE"}
            </Badge>
          </div>
        </div>
      </div>
      <Button variant="outline" onClick={() => setIsEditing(true)}>
        Edit Profile
      </Button>
    </div>
  );
}
```

### Qualifications List

```typescript
// components/crew/qualifications-list.tsx

export function QualificationsList({ 
  qualifications, 
  userId 
}: QualificationsListProps) {
  const allQualifications = useQuery(api.qualifications.list, {});
  const grantQual = useMutation(api.qualifications.grantToUser);
  const revokeQual = useMutation(api.qualifications.revokeFromUser);
  const [isAdding, setIsAdding] = useState(false);
  
  const userQualIds = qualifications?.map(q => q.qualificationId) ?? [];
  const availableQuals = allQualifications?.filter(
    q => !userQualIds.includes(q._id)
  );
  
  return (
    <div className="space-y-2">
      {qualifications?.map(uq => (
        <div 
          key={uq._id}
          className="flex items-center justify-between p-2 rounded bg-[#111111]"
        >
          <div className="flex items-center gap-2">
            <Badge 
              tone={uq.status === "ACTIVE" ? "green" : "amber"}
            >
              {uq.status}
            </Badge>
            <span className="text-sm text-[#f5f5f5]">
              {uq.qualification?.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <select
              value={uq.status}
              onChange={async (e) => {
                await grantQual({
                  userId,
                  qualificationId: uq.qualificationId,
                  status: e.target.value as "ACTIVE" | "IN_TRAINING",
                });
              }}
              className="text-xs rounded border border-[#2a2a2a] bg-[#1a1a1a] px-2 py-1"
            >
              <option value="ACTIVE">Active</option>
              <option value="IN_TRAINING">In Training</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500"
              onClick={() => revokeQual({
                userId,
                qualificationId: uq.qualificationId,
              })}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
      
      {(!qualifications || qualifications.length === 0) && (
        <div className="text-sm text-[#a1a1aa] py-4 text-center">
          No qualifications
        </div>
      )}
      
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setIsAdding(true)}
      >
        + Add Qualification
      </Button>
      
      {/* Add qualification dialog */}
    </div>
  );
}
```

### Upcoming Shifts List

```typescript
// components/crew/upcoming-shifts-list.tsx

export function UpcomingShiftsList({ shifts }: { shifts: Shift[] | undefined }) {
  if (!shifts || shifts.length === 0) {
    return (
      <div className="text-sm text-[#a1a1aa] py-4 text-center">
        No upcoming shifts
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {shifts.map(shift => (
        <div 
          key={shift._id}
          className="flex items-center justify-between p-2 rounded bg-[#111111]"
        >
          <div>
            <div className="text-sm font-medium text-[#f5f5f5]">
              {format(new Date(shift.dateStart), "EEE, MMM d")}
            </div>
            <div className="text-xs text-[#a1a1aa]">
              {shift.shiftDefinition.label} • {shift.shiftDefinition.startTime} - {shift.shiftDefinition.endTime}
            </div>
          </div>
          <Badge tone="blue">{shift.role}</Badge>
        </div>
      ))}
    </div>
  );
}
```

## Files Created

- `app/(app)/crew/[id]/page.tsx`
- `components/crew/employee-header.tsx`
- `components/crew/qualifications-list.tsx`
- `components/crew/upcoming-shifts-list.tsx`
- `components/crew/crew-memberships-list.tsx`
- `components/crew/pto-history-list.tsx`

## Dependencies

- US-2.2: Crew Membership APIs
- US-2.3: Qualification APIs
- US-1.2: Qualifications Schema

## Estimate

Medium (M)




