"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type Role = "BasicUser" | "TeamLead" | "OperationsLead" | "Admin";
const leaderRoles: Role[] = ["TeamLead", "OperationsLead", "Admin"];

export default function DashboardPage() {
  const currentUser = useQuery(api.users.current);
  const missions = useQuery(api.missions.listActive);
  
  // Only fetch pending PTO if user has permission
  const canViewPendingPto = currentUser && leaderRoles.includes(currentUser.role);
  const ptoRequests = useQuery(
    api.pto.pending,
    canViewPendingPto ? {} : "skip"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#f5f5f5]">Dashboard</h1>
        <p className="text-sm text-[#a1a1aa]">
          Cross-mission health, open gaps, and approvals.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card accent="emerald">
          <CardHeader>
            <CardTitle>Active Missions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-[#f5f5f5]">
              {missions?.length ?? "..."}
            </div>
            <div className="text-sm text-[#a1a1aa]">Currently active</div>
          </CardContent>
        </Card>
        {canViewPendingPto && (
          <Card accent="amber">
            <CardHeader>
              <CardTitle>PTO Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-[#f5f5f5]">
                {ptoRequests?.length ?? "..."}
              </div>
              <div className="text-sm text-[#a1a1aa]">Awaiting review</div>
            </CardContent>
          </Card>
        )}
        <Card accent="blue">
          <CardHeader>
            <CardTitle>Open Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-[#f5f5f5]">-</div>
            <div className="text-sm text-[#a1a1aa]">Coming soon</div>
          </CardContent>
        </Card>
        <Card accent="emerald">
          <CardHeader>
            <CardTitle>Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-[#f5f5f5]">-</div>
            <div className="text-sm text-[#a1a1aa]">Coming soon</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Mission Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {missions?.map((mission) => (
            <div
              key={mission._id}
              className="flex items-center justify-between rounded-lg border border-[#2a2a2a] bg-[#111111] px-3 py-2"
            >
              <div className="text-sm font-semibold text-[#f5f5f5]">{mission.name}</div>
              <div className="text-sm text-[#a1a1aa]">
                {mission.status === "ACTIVE"
                  ? "Active"
                  : mission.status === "PAUSED"
                    ? "Paused"
                    : "Terminated"}
              </div>
            </div>
          ))}
          {(!missions || missions.length === 0) && (
            <div className="text-sm text-[#a1a1aa]">No missions yet. Add one to get started!</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

