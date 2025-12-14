"use client";

import { format } from "date-fns";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MetricCard } from "./metric-card";
import { UpcomingShiftsCard } from "./upcoming-shifts-card";
import { MyPTOStatus } from "./my-pto-status";
import { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Calendar, Clock, FileText } from "lucide-react";

interface BasicUserDashboardProps {
  user: Doc<"users">;
}

/**
 * Dashboard view for basic users showing their shifts and PTO status
 */
export function BasicUserDashboard({ user }: BasicUserDashboardProps) {
  const shifts = useQuery(api.schedules.getUserUpcomingShifts, {
    userId: user._id,
    limit: 7,
  });
  const myPTO = useQuery(api.pto.myRequests);

  const pendingPTO = myPTO?.filter((r) => r.status === "PENDING").length ?? 0;
  const upcomingShiftsCount = shifts?.length ?? 0;

  // Find next shift
  const nextShift = shifts?.[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#f5f5f5]">
          Welcome back, {user.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-sm text-[#a1a1aa]">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Upcoming Shifts" icon={Calendar} accent="emerald">
          <div className="text-2xl font-semibold text-[#f5f5f5]">
            {upcomingShiftsCount}
          </div>
          <div className="text-sm text-[#a1a1aa]">Next 7 days</div>
        </MetricCard>

        <MetricCard title="Next Shift" icon={Clock} accent="blue">
          {nextShift ? (
            <>
              <div className="text-lg font-semibold text-[#f5f5f5]">
                {format(new Date(nextShift.dateStart), "EEE, MMM d")}
              </div>
              <div className="text-sm text-[#a1a1aa]">
                {nextShift.shiftDefinition?.label} •{" "}
                {format(new Date(nextShift.dateStart), "h:mm a")}
              </div>
            </>
          ) : (
            <>
              <div className="text-lg font-semibold text-[#f5f5f5]">None</div>
              <div className="text-sm text-[#a1a1aa]">No shifts scheduled</div>
            </>
          )}
        </MetricCard>

        <MetricCard title="PTO Requests" icon={FileText} accent="amber">
          <div className="text-2xl font-semibold text-[#f5f5f5]">
            {pendingPTO}
          </div>
          <div className="text-sm text-[#a1a1aa]">Pending approval</div>
        </MetricCard>
      </div>

      {/* Content Sections */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming Shifts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Upcoming Shifts</CardTitle>
              <Link
                href="/schedules"
                className="text-sm text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <UpcomingShiftsCard userId={user._id} limit={5} />
          </CardContent>
        </Card>

        {/* PTO Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My PTO Requests</CardTitle>
              <Link
                href="/pto"
                className="text-sm text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors"
              >
                Request PTO
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <MyPTOStatus />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
