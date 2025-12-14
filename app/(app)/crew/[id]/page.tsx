"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeHeader } from "@/components/crew/employee-header";
import { CrewMembershipsList } from "@/components/crew/crew-memberships-list";
import { QualificationsList } from "@/components/crew/qualifications-list";
import { UpcomingShiftsList } from "@/components/crew/upcoming-shifts-list";
import { PTOHistoryList } from "@/components/crew/pto-history-list";

interface Props {
  params: { id: string };
}

export default function EmployeeDetailPage({ params }: Props) {
  const userId = params.id as Id<"users">;

  const user = useQuery(api.users.get, { id: userId });
  const crews = useQuery(api.teams.getUserCrews, { userId });
  const qualifications = useQuery(api.qualifications.getUserQualifications, {
    userId,
  });
  const upcomingShifts = useQuery(api.schedules.getUserUpcomingShifts, {
    userId,
    limit: 10,
  });
  const ptoHistory = useQuery(api.pto.getUserHistory, { userId });

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#a1a1aa]">Loading...</div>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-[#a1a1aa]">Employee not found</div>
        <Link href="/crew" className="text-emerald-500 hover:underline">
          Back to Crew
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
        <Link href="/crew" className="hover:text-[#f5f5f5]">
          Crew
        </Link>
        <span>/</span>
        <span className="text-[#f5f5f5]">{user.name ?? user.email}</span>
      </div>

      {/* Header */}
      <EmployeeHeader user={user} />

      {/* Content Grid */}
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
            <CardTitle>Qualifications</CardTitle>
          </CardHeader>
          <CardContent>
            <QualificationsList qualifications={qualifications} userId={userId} />
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
