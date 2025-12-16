"use client";

import { format } from "date-fns";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MetricCard } from "./metric-card";
import { MissionStatusCard } from "./mission-status-card";
import { PendingApprovalsTable } from "./pending-approvals-table";
import { PendingPTOList } from "./pending-pto-list";
import { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Calendar, Clock, AlertTriangle, CheckSquare } from "lucide-react";

interface OpsLeadDashboardProps {
  user: Doc<"users">;
}

/**
 * Dashboard view for Operations Leads and Admins showing cross-mission overview and approvals
 */
export function OpsLeadDashboard({ user }: OpsLeadDashboardProps) {
  const missions = useQuery(api.missions.listActive);
  const pendingPTO = useQuery(api.pto.pending);
  const pendingApprovals = useQuery(api.schedules.getPendingApprovals);
  const coverageHealth = useQuery(api.schedules.getAllMissionsCoverageHealth);

  // Calculate aggregate metrics
  const activeMissionsCount = missions?.length ?? 0;
  const pendingPTOCount = pendingPTO?.length ?? 0;
  const pendingApprovalsCount = pendingApprovals?.length ?? 0;
  const totalCoverageGaps = coverageHealth?.totalGaps ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#f5f5f5]">
          Operations Overview
        </h1>
        <p className="text-sm text-[#a1a1aa]">
          {format(new Date(), "EEEE, MMMM d, yyyy")} • Welcome back,{" "}
          {user.name?.split(" ")[0] ?? "there"}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Active Missions" icon={Calendar} accent="emerald">
          <div className="text-2xl font-semibold text-[#f5f5f5]">
            {activeMissionsCount}
          </div>
          <div className="text-sm text-[#a1a1aa]">Currently running</div>
        </MetricCard>

        <MetricCard title="PTO Pending" icon={Clock} accent="blue">
          <div className="text-2xl font-semibold text-[#f5f5f5]">
            {pendingPTOCount}
          </div>
          <div className="text-sm text-[#a1a1aa]">Awaiting review</div>
        </MetricCard>

        <MetricCard title="Schedule Approvals" icon={CheckSquare} accent="amber">
          <div className="text-2xl font-semibold text-[#f5f5f5]">
            {pendingApprovalsCount}
          </div>
          <div className="text-sm text-[#a1a1aa]">Pending approval</div>
        </MetricCard>

        <MetricCard title="Coverage Gaps" icon={AlertTriangle} accent="red">
          <div className="text-2xl font-semibold text-[#f5f5f5]">
            {totalCoverageGaps}
          </div>
          <div className="text-sm text-[#a1a1aa]">Next 7 days</div>
        </MetricCard>
      </div>

      {/* Mission Status Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mission Status</CardTitle>
            <Link
              href="/missions"
              className="text-sm text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors"
            >
              View All Missions
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {missions && missions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {missions.slice(0, 6).map((mission) => (
                <MissionStatusCard key={mission._id} mission={mission} />
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-[#a1a1aa]">
              No active missions
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approvals Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Schedule Approvals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Schedule Approvals</CardTitle>
              <Link
                href="/schedules"
                className="text-sm text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <PendingApprovalsTable approvals={pendingApprovals?.slice(0, 5)} />
          </CardContent>
        </Card>

        {/* Pending PTO */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending PTO Requests</CardTitle>
              <Link
                href="/pto"
                className="text-sm text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <PendingPTOList requests={pendingPTO?.slice(0, 5)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

