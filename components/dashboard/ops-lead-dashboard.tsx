"use client";

import { format } from "date-fns";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MetricCard } from "./metric-card";
import { MissionStatusCard } from "./mission-status-card";
import { PendingApprovalsTable } from "./pending-approvals-table";
import { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Target, CheckCircle, AlertTriangle, Users } from "lucide-react";

interface OpsLeadDashboardProps {
  user: Doc<"users">;
}

/**
 * Dashboard view for operations leads with cross-mission oversight
 */
export function OpsLeadDashboard({ user }: OpsLeadDashboardProps) {
  const missions = useQuery(api.missions.listActive);
  const pendingApprovals = useQuery(api.schedules.getPendingApprovals);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#f5f5f5]">
          Operations Overview
        </h1>
        <p className="text-sm text-[#a1a1aa]">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Active Missions" icon={Target} accent="emerald">
          <div className="text-2xl font-semibold text-[#f5f5f5]">
            {missions?.length ?? 0}
          </div>
          <div className="text-sm text-[#a1a1aa]">Currently running</div>
        </MetricCard>

        <MetricCard title="Pending Approvals" icon={CheckCircle} accent="amber">
          <div className="text-2xl font-semibold text-[#f5f5f5]">
            {pendingApprovals?.length ?? 0}
          </div>
          <div className="text-sm text-[#a1a1aa]">Schedules to review</div>
        </MetricCard>

        <MetricCard title="Coverage Gaps" icon={AlertTriangle} accent="red">
          <CrossMissionGapsCount missions={missions} />
        </MetricCard>

        <MetricCard title="Staff Scheduled" icon={Users} accent="blue">
          <TotalStaffCount missions={missions} />
        </MetricCard>
      </div>

      {/* Mission Status Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Missions Status</CardTitle>
            <Link
              href="/missions"
              className="text-sm text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors"
            >
              Manage Missions
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {missions && missions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {missions.map((mission) => (
                <MissionStatusCard key={mission._id} mission={mission} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-[#a1a1aa]">
              No active missions. Create a mission to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      {(pendingApprovals?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Schedules Pending Approval</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <PendingApprovalsTable approvals={pendingApprovals} />
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard
          title="View All Schedules"
          description="Review and manage shift schedules"
          href="/schedules"
        />
        <QuickActionCard
          title="Manage Teams"
          description="View crews and team assignments"
          href="/teams"
        />
        <QuickActionCard
          title="PTO Requests"
          description="Review pending time-off requests"
          href="/pto"
        />
        <QuickActionCard
          title="Templates"
          description="Manage schedule templates"
          href="/templates"
        />
      </div>
    </div>
  );
}

/**
 * Aggregates coverage gap counts across all missions
 */
function CrossMissionGapsCount({
  missions,
}: {
  missions: (Doc<"zooMissions"> & { status: "ACTIVE" | "PAUSED" | "TERMINATED" })[] | undefined;
}) {
  const healthQueries = missions?.map((m) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery(api.schedules.getMissionCoverageHealth, { missionId: m._id })
  );

  const totalGaps =
    healthQueries?.reduce((sum, h) => sum + (h?.gapCount ?? 0), 0) ?? 0;

  return (
    <>
      <div className="text-2xl font-semibold text-[#f5f5f5]">{totalGaps}</div>
      <div className="text-sm text-[#a1a1aa]">Across all missions</div>
    </>
  );
}

/**
 * Aggregates total scheduled shifts across all missions
 */
function TotalStaffCount({
  missions,
}: {
  missions: (Doc<"zooMissions"> & { status: "ACTIVE" | "PAUSED" | "TERMINATED" })[] | undefined;
}) {
  const healthQueries = missions?.map((m) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery(api.schedules.getMissionCoverageHealth, { missionId: m._id })
  );

  const totalShifts =
    healthQueries?.reduce((sum, h) => sum + (h?.totalShifts ?? 0), 0) ?? 0;

  return (
    <>
      <div className="text-2xl font-semibold text-[#f5f5f5]">{totalShifts}</div>
      <div className="text-sm text-[#a1a1aa]">Shifts this week</div>
    </>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
}

function QuickActionCard({ title, description, href }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-4 transition-colors hover:border-[#3a3a3a] hover:bg-[#222222]"
    >
      <div className="font-medium text-[#f5f5f5]">{title}</div>
      <div className="mt-1 text-sm text-[#a1a1aa]">{description}</div>
    </Link>
  );
}
