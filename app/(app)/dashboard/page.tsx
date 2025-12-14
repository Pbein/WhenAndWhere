"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BasicUserDashboard } from "@/components/dashboard/basic-user-dashboard";
import { TeamLeadDashboard } from "@/components/dashboard/team-lead-dashboard";
import { OpsLeadDashboard } from "@/components/dashboard/ops-lead-dashboard";

/**
 * Role-based dashboard that routes to the appropriate view based on user role.
 * - BasicUser: Personal schedule and PTO status
 * - TeamLead: Mission health, pending PTO, coverage gaps
 * - OperationsLead/Admin: Cross-mission overview and approvals
 */
export default function DashboardPage() {
  const currentUser = useQuery(api.users.current);

  // Loading state
  if (currentUser === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#a1a1aa]">Loading dashboard...</div>
      </div>
    );
  }

  // Not authenticated or user not synced
  if (currentUser === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#a1a1aa]">Please sign in to view your dashboard.</div>
      </div>
    );
  }

  // Route to role-specific dashboard
  switch (currentUser.role) {
    case "OperationsLead":
    case "Admin":
      return <OpsLeadDashboard user={currentUser} />;
    case "TeamLead":
      return <TeamLeadDashboard user={currentUser} />;
    case "BasicUser":
    default:
      return <BasicUserDashboard user={currentUser} />;
  }
}
