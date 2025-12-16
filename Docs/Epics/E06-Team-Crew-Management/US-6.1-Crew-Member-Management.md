# US-6.1: Crew Member Management

## User Story

**As a** Team Lead  
**I want** to add and remove employees from crews  
**So that** I can organize my team into rotating groups

## Priority

P0 - Core crew management

## Acceptance Criteria

- [ ] Teams page shows crews with expandable member lists
- [ ] "Add Member" button opens employee picker
- [ ] Can remove members from crews
- [ ] Can set which crew is primary for each member
- [ ] Member count displayed on each crew card
- [ ] Shows member's qualifications inline

## Technical Details

### Enhanced Teams Page

```typescript
// app/(app)/teams/page.tsx

export default function TeamsPage() {
  const teams = useQuery(api.teams.list);
  const missions = useQuery(api.missions.list);
  const [expandedTeamId, setExpandedTeamId] = useState<Id<"teams"> | null>(null);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">Teams</h1>
          <p className="text-sm text-[#a1a1aa]">Manage crew teams and members</p>
        </div>
        <Button>Create Team</Button>
      </div>
      
      <div className="space-y-4">
        {teams?.map(team => (
          <CrewCard
            key={team._id}
            team={team}
            mission={missions?.find(m => m._id === team.missionId)}
            isExpanded={expandedTeamId === team._id}
            onToggle={() => setExpandedTeamId(
              expandedTeamId === team._id ? null : team._id
            )}
          />
        ))}
      </div>
    </div>
  );
}
```

### Crew Card Component

```typescript
// components/crew/crew-card.tsx

interface CrewCardProps {
  team: Team;
  mission: Mission | undefined;
  isExpanded: boolean;
  onToggle: () => void;
}

export function CrewCard({ team, mission, isExpanded, onToggle }: CrewCardProps) {
  const members = useQuery(api.teams.getCrewMembers, { teamId: team._id });
  const [isAddingMember, setIsAddingMember] = useState(false);
  
  return (
    <Card>
      <CardHeader 
        className="cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: team.color ?? "#10b981" }}
            />
            <CardTitle>{team.name}</CardTitle>
            <Badge tone="blue">{members?.length ?? 0} members</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#a1a1aa]">
              {mission?.name}
            </span>
            <ChevronIcon direction={isExpanded ? "up" : "down"} />
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="space-y-2">
            {members?.map(member => (
              <CrewMemberRow
                key={member._id}
                membership={member}
                teamId={team._id}
              />
            ))}
            
            {(!members || members.length === 0) && (
              <div className="text-sm text-[#a1a1aa] py-4 text-center">
                No members yet
              </div>
            )}
            
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => setIsAddingMember(true)}
            >
              + Add Member
            </Button>
          </div>
          
          <AddMemberDialog
            teamId={team._id}
            existingMemberIds={members?.map(m => m.userId) ?? []}
            open={isAddingMember}
            onOpenChange={setIsAddingMember}
          />
        </CardContent>
      )}
    </Card>
  );
}
```

### Crew Member Row

```typescript
// components/crew/crew-member-row.tsx

interface CrewMemberRowProps {
  membership: CrewMembership & { user: User };
  teamId: Id<"teams">;
}

export function CrewMemberRow({ membership, teamId }: CrewMemberRowProps) {
  const removeMember = useMutation(api.teams.removeCrewMember);
  const setPrimary = useMutation(api.teams.setPrimaryCrew);
  
  const qualifications = useQuery(api.qualifications.getUserQualifications, {
    userId: membership.userId,
  });
  
  return (
    <div className="flex items-center justify-between p-2 rounded bg-[#111111]">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-[#2a2a2a] flex items-center justify-center">
          {membership.user.name?.[0] ?? "?"}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#f5f5f5]">
              {membership.user.name ?? membership.user.email}
            </span>
            {membership.isPrimary && (
              <Badge tone="green" size="sm">Primary</Badge>
            )}
          </div>
          <div className="flex gap-1 mt-0.5">
            {qualifications?.slice(0, 3).map(q => (
              <Badge 
                key={q._id} 
                tone={q.status === "ACTIVE" ? "blue" : "amber"}
                size="sm"
              >
                {q.qualification?.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {!membership.isPrimary && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPrimary({
              userId: membership.userId,
              teamId,
            })}
          >
            Set Primary
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500"
          onClick={() => removeMember({
            teamId,
            userId: membership.userId,
          })}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
```

### Add Member Dialog

```typescript
// components/crew/add-member-dialog.tsx

export function AddMemberDialog({ 
  teamId, 
  existingMemberIds,
  open, 
  onOpenChange 
}: AddMemberDialogProps) {
  const allUsers = useQuery(api.users.list);
  const addMember = useMutation(api.teams.addCrewMember);
  const [search, setSearch] = useState("");
  
  const availableUsers = useMemo(() => 
    allUsers?.filter(u => 
      !existingMemberIds.includes(u._id) &&
      (u.name?.toLowerCase().includes(search.toLowerCase()) ||
       u.email.toLowerCase().includes(search.toLowerCase()))
    ),
    [allUsers, existingMemberIds, search]
  );
  
  const handleAdd = async (userId: Id<"users">) => {
    await addMember({ teamId, userId });
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        
        <Input
          placeholder="Search employees..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        
        <div className="max-h-64 overflow-y-auto space-y-1">
          {availableUsers?.map(user => (
            <button
              key={user._id}
              onClick={() => handleAdd(user._id)}
              className="w-full flex items-center gap-3 p-2 rounded hover:bg-[#1a1a1a]"
            >
              <div className="h-8 w-8 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                {user.name?.[0] ?? "?"}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-[#f5f5f5]">
                  {user.name ?? "Unknown"}
                </div>
                <div className="text-xs text-[#a1a1aa]">{user.email}</div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## Files Created/Modified

- `app/(app)/teams/page.tsx` - Enhanced
- `components/crew/crew-card.tsx` - New
- `components/crew/crew-member-row.tsx` - New
- `components/crew/add-member-dialog.tsx` - New

## Dependencies

- US-2.2: Crew Membership APIs
- US-1.3: Crew Membership Schema

## Estimate

Medium (M)



