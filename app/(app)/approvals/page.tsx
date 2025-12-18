"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PendingApprovalsTable } from "@/components/dashboard/pending-approvals-table";
import { PendingPTOList } from "@/components/dashboard/pending-pto-list";
import { RoleGate } from "@/components/role-gate";
import { CheckSquare, Clock } from "lucide-react";

export default function ApprovalsPage() {
  const pendingPTO = useQuery(api.pto.pending);
  const pendingApprovals = useQuery(api.schedules.getPendingApprovals);

  const pendingPTOCount = pendingPTO?.length ?? 0;
  const pendingApprovalsCount = pendingApprovals?.length ?? 0;

  return (
    <RoleGate allow={["OperationsLead", "Admin"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">Approvals</h1>
          <p className="text-sm text-[#a1a1aa]">
            Review and approve schedules and PTO requests
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-[#2a2a2a] bg-[#111111]">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                <CheckSquare className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-[#f5f5f5]">
                  {pendingApprovalsCount}
                </div>
                <div className="text-sm text-[#a1a1aa]">Schedule Approvals</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#2a2a2a] bg-[#111111]">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-[#f5f5f5]">
                  {pendingPTOCount}
                </div>
                <div className="text-sm text-[#a1a1aa]">PTO Requests</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-amber-500" />
              Schedule Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PendingApprovalsTable approvals={pendingApprovals} />
          </CardContent>
        </Card>

        {/* PTO Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Pending PTO Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PendingPTOList requests={pendingPTO} />
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}

