"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ViewMode = "everyone" | "by-role";
type SortField = "name" | "role" | "status";
type SortDirection = "asc" | "desc";

const ROLE_ORDER = ["Admin", "OperationsLead", "TeamLead", "BasicUser"] as const;
const ROLE_LABELS: Record<string, string> = {
  Admin: "Administrators",
  OperationsLead: "Operations Leads",
  TeamLead: "Team Leads",
  BasicUser: "Staff Members",
};

export default function PersonnelPage() {
  const usersWithDetails = useQuery(api.users.listWithDetails);
  const qualifications = useQuery(api.qualifications.list, {});
  const missions = useQuery(api.missions.list);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("everyone");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [qualificationFilter, setQualificationFilter] = useState<string>("all");
  const [missionFilter, setMissionFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    if (!usersWithDetails) return [];

    let filtered = usersWithDetails.filter((user) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      // Role filter
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (user.status ?? "ACTIVE") === statusFilter;

      // Qualification filter
      const matchesQualification =
        qualificationFilter === "all" ||
        user.qualifications.some(
          (q) => q.qualificationId === qualificationFilter && q.status === "ACTIVE"
        );

      // Mission filter
      const matchesMission =
        missionFilter === "all" ||
        user.crews.some((c) => c.team?.missionId === missionFilter) ||
        user.eligibleMissions.some((e) => e.missionId === missionFilter);

      return matchesSearch && matchesRole && matchesStatus && matchesQualification && matchesMission;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = (a.name ?? "").localeCompare(b.name ?? "");
          break;
        case "role":
          comparison = ROLE_ORDER.indexOf(a.role as any) - ROLE_ORDER.indexOf(b.role as any);
          break;
        case "status":
          comparison = (a.status ?? "ACTIVE").localeCompare(b.status ?? "ACTIVE");
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [usersWithDetails, searchQuery, roleFilter, statusFilter, qualificationFilter, missionFilter, sortField, sortDirection]);

  // Group users by role for "by-role" view
  const usersByRole = useMemo(() => {
    const groups: Record<string, typeof filteredUsers> = {};
    for (const role of ROLE_ORDER) {
      groups[role] = filteredUsers.filter((u) => u.role === role);
    }
    return groups;
  }, [filteredUsers]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-[#3a3a3a] ml-1">↕</span>;
    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  if (usersWithDetails === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2a2a2a] border-t-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">Personnel</h1>
          <p className="text-sm text-[#a1a1aa]">
            View and manage all staff members ({usersWithDetails.length} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "everyone" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("everyone")}
          >
            Everyone
          </Button>
          <Button
            variant={viewMode === "by-role" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("by-role")}
          >
            By Role
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-md border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-[#f5f5f5]"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="OperationsLead">Operations Lead</option>
              <option value="TeamLead">Team Lead</option>
              <option value="BasicUser">Basic User</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-[#f5f5f5]"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            {/* Qualification Filter */}
            <select
              value={qualificationFilter}
              onChange={(e) => setQualificationFilter(e.target.value)}
              className="rounded-md border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-[#f5f5f5]"
            >
              <option value="all">All Qualifications</option>
              {qualifications?.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mission Filter - Second Row */}
          <div className="mt-4 flex items-center gap-4">
            <select
              value={missionFilter}
              onChange={(e) => setMissionFilter(e.target.value)}
              className="rounded-md border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-[#f5f5f5]"
            >
              <option value="all">All Missions</option>
              {missions?.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {(searchQuery || roleFilter !== "all" || statusFilter !== "all" || qualificationFilter !== "all" || missionFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                  setQualificationFilter("all");
                  setMissionFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}

            <span className="text-sm text-[#a1a1aa]">
              {filteredUsers.length} of {usersWithDetails.length} members
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === "everyone" ? (
        <EveryoneView
          users={filteredUsers}
          sortField={sortField}
          toggleSort={toggleSort}
          SortIcon={SortIcon}
        />
      ) : (
        <ByRoleView usersByRole={usersByRole} />
      )}
    </div>
  );
}

// Everyone View Component
function EveryoneView({
  users,
  sortField,
  toggleSort,
  SortIcon,
}: {
  users: any[];
  sortField: SortField;
  toggleSort: (field: SortField) => void;
  SortIcon: React.ComponentType<{ field: SortField }>;
}) {
  return (
    <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-[#2a2a2a]">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider cursor-pointer hover:text-[#f5f5f5]"
              onClick={() => toggleSort("name")}
            >
              Name <SortIcon field="name" />
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider cursor-pointer hover:text-[#f5f5f5]"
              onClick={() => toggleSort("role")}
            >
              Role <SortIcon field="role" />
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider cursor-pointer hover:text-[#f5f5f5]"
              onClick={() => toggleSort("status")}
            >
              Status <SortIcon field="status" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
              Qualifications
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
              Crews
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
              PTO
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2a2a2a]">
          {users.map((user) => (
            <UserRow key={user._id} user={user} />
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-[#a1a1aa]">No members match your filters.</p>
        </div>
      )}
    </div>
  );
}

// By Role View Component
function ByRoleView({ usersByRole }: { usersByRole: Record<string, any[]> }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {ROLE_ORDER.map((role) => {
        const users = usersByRole[role];
        if (users.length === 0) return null;

        return (
          <Card key={role}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{ROLE_LABELS[role]}</CardTitle>
                <Badge tone="blue">{users.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {users.map((user) => (
                  <RoleViewUserCard key={user._id} user={user} />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// User Row Component for table view
function UserRow({ user }: { user: any }) {
  const activeQualifications = user.qualifications.filter(
    (q: any) => q.status === "ACTIVE"
  );

  return (
    <tr className="hover:bg-[#111111] transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <Link
          href={`/personnel/${user._id}`}
          className="flex items-center gap-3 group"
        >
          <div className="h-10 w-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-sm font-medium text-[#f5f5f5]">
            {user.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <div className="text-sm font-medium text-[#f5f5f5] group-hover:text-emerald-400">
              {user.name ?? "Unknown"}
            </div>
            <div className="text-xs text-[#a1a1aa]">{user.email}</div>
          </div>
        </Link>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge tone="blue">{user.role}</Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge
          tone={
            (user.status ?? "ACTIVE") === "ACTIVE"
              ? "green"
              : user.status === "ON_LEAVE"
                ? "amber"
                : "gray"
          }
        >
          {user.status ?? "ACTIVE"}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1 max-w-xs">
          {activeQualifications.length > 0 ? (
            activeQualifications.slice(0, 3).map((q: any) => (
              <Badge key={q._id} tone="green" className="text-xs">
                {q.qualification?.name ?? "Unknown"}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-[#3a3a3a]">None</span>
          )}
          {activeQualifications.length > 3 && (
            <Badge tone="gray" className="text-xs">
              +{activeQualifications.length - 3}
            </Badge>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1 max-w-xs">
          {user.crews.length > 0 ? (
            user.crews.slice(0, 2).map((c: any) => (
              <div key={c._id} className="flex items-center gap-1">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: c.team?.color ?? "#10b981" }}
                />
                <span className="text-xs text-[#a1a1aa]">
                  {c.team?.name}
                  {c.isPrimary && " ★"}
                </span>
              </div>
            ))
          ) : (
            <span className="text-xs text-[#3a3a3a]">Unassigned</span>
          )}
          {user.crews.length > 2 && (
            <span className="text-xs text-[#a1a1aa]">
              +{user.crews.length - 2} more
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {user.pendingPtoCount > 0 ? (
          <Badge tone="amber">{user.pendingPtoCount} pending</Badge>
        ) : user.approvedPtoCount > 0 ? (
          <Badge tone="green">{user.approvedPtoCount} approved</Badge>
        ) : (
          <span className="text-xs text-[#3a3a3a]">-</span>
        )}
      </td>
    </tr>
  );
}

// User Card for role-based view
function RoleViewUserCard({ user }: { user: any }) {
  const activeQualifications = user.qualifications.filter(
    (q: any) => q.status === "ACTIVE"
  );

  return (
    <Link
      href={`/personnel/${user._id}`}
      className="block p-3 rounded-lg bg-[#111111] hover:bg-[#1a1a1a] border border-[#2a2a2a] transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-sm font-medium text-[#f5f5f5] flex-shrink-0">
          {user.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#f5f5f5] truncate">
              {user.name ?? "Unknown"}
            </span>
            <Badge
              tone={
                (user.status ?? "ACTIVE") === "ACTIVE"
                  ? "green"
                  : user.status === "ON_LEAVE"
                    ? "amber"
                    : "gray"
              }
              className="text-xs"
            >
              {user.status ?? "ACTIVE"}
            </Badge>
          </div>
          <div className="text-xs text-[#a1a1aa] truncate">{user.email}</div>

          {/* Qualifications */}
          {activeQualifications.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {activeQualifications.slice(0, 3).map((q: any) => (
                <Badge key={q._id} tone="green" className="text-xs">
                  {q.qualification?.name ?? "Unknown"}
                </Badge>
              ))}
              {activeQualifications.length > 3 && (
                <Badge tone="gray" className="text-xs">
                  +{activeQualifications.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Crews */}
          {user.crews.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {user.crews.slice(0, 2).map((c: any) => (
                <div key={c._id} className="flex items-center gap-1">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: c.team?.color ?? "#10b981" }}
                  />
                  <span className="text-xs text-[#a1a1aa]">
                    {c.team?.name}
                    {c.isPrimary && " ★"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PTO Indicator */}
        {user.pendingPtoCount > 0 && (
          <Badge tone="amber" className="text-xs flex-shrink-0">
            PTO
          </Badge>
        )}
      </div>
    </Link>
  );
}

