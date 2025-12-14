"use client";

import { format } from "date-fns";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MetricCard } from "./metric-card";
import { MissionHealthGrid } from "./mission-health-grid";
import { PendingPTOList } from "./pending-pto-list";
import { CoverageAlertsList } from "./coverage-alerts-list";
import { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Calendar, Clock, AlertTriangle, Users } from "lucide-react";

interface TeamLeadDashboardProps {
  user: Doc<"users">;
}

/**
 * Dashboard view for team leads with mission health and pending actions
 */
export function TeamLeadDashboard({ user }: TeamLeadDashboardProps) {
  const missions = useQuery(api.missions.listActive);
  const pendingPTO = useQuery(api.pto.pending);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#f5f5f5]">
          Welcome back, {user.name?.split(" ")[0] ?? "Team Lead"}
        </h1>
        <p className="text-sm text-[#a1a1aa]">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Active Missions" icon={Calendar} accent="emerald">
          <div className="text-2xl font-semibold text-[#f5f5f5]">
            {missions?.length ?? 0}
          </div>
          <div className="text-sm text-[#a1a1aa]">Currently running</div>
        </MetricCard>

        <MetricCard title="PTO Pending" icon={Clock} accent="blue">
          <div className="text-2xl font-semibold text-[#f5f5f5]">
            {pendingPTO?.length ?? 0}
          </div>
          <div className="text-sm text-[#a1a1aa]">Awaiting review</div>
        </MetricCard>

        <MetricCard title="Coverage Gaps" icon={AlertTriangle} accent="red">
          <CoverageGapsCount missions={missions} />
        </MetricCard>

        <MetricCard title="This Week" icon={Users} accent="amber">
          <WeekShiftCount missions={missions} />
        </MetricCard>
      </div>

      {/* Mission Health */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mission Health</CardTitle>
            <Link
              href="/schedules"
              className="text-sm text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors"
            >
              View Schedules
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <MissionHealthGrid missions={missions} />
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid gap-4 md:grid-cols-2">
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

        {/* Coverage Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Coverage Alerts</CardTitle>
              <Link
                href="/schedules"
                className="text-sm text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors"
              >
                View Schedule
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <CoverageAlertsList missions={missions} limit={5} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Aggregates coverage gap counts across all missions
 */
function CoverageGapsCount({
  missions,
}: {
  missions: (Doc<"zooMissions"> & { status: "ACTIVE" | "PAUSED" | "TERMINATED" })[] | undefined;
}) {
  // Get health for each mission and sum gaps
  const healthQueries = missions?.map((m) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery(api.schedules.getMissionCoverageHealth, { missionId: m._id })
  );

  const totalGaps =
    healthQueries?.reduce((sum, h) => sum + (h?.gapCount ?? 0), 0) ?? 0;

  return (
    <>
      <div className="text-2xl font-semibold text-[#f5f5f5]">{totalGaps}</div>
      <div className="text-sm text-[#a1a1aa]">Next 7 days</div>
    </>
  );
}

/**
 * Aggregates shift counts across all missions for the week
 */
function WeekShiftCount({
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
      <div className="text-sm text-[#a1a1aa]">Shifts scheduled</div>
    </>
  );
}
