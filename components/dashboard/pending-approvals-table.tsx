"use client";

import { format } from "date-fns";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";

interface PendingApproval {
  mission: Doc<"zooMissions"> | null;
  shiftCount: number;
  dateRange: {
    start: number;
    end: number;
  };
}

interface PendingApprovalsTableProps {
  approvals: PendingApproval[] | undefined;
}

/**
 * Table displaying schedules pending approval with quick actions
 */
export function PendingApprovalsTable({
  approvals,
}: PendingApprovalsTableProps) {
  const approveSchedule = useMutation(api.schedules.approveSchedule);

  if (!approvals || approvals.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-[#a1a1aa]">
        No schedules pending approval
      </div>
    );
  }

  const handleApprove = async (approval: PendingApproval) => {
    if (!approval.mission) return;
    await approveSchedule({
      missionId: approval.mission._id,
      startDate: approval.dateRange.start,
      endDate: approval.dateRange.end,
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#2a2a2a] text-left text-xs text-[#a1a1aa]">
            <th className="pb-2 font-medium">Mission</th>
            <th className="pb-2 font-medium">Date Range</th>
            <th className="pb-2 font-medium">Shifts</th>
            <th className="pb-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {approvals.map((approval, idx) => (
            <tr key={idx} className="border-b border-[#2a2a2a] last:border-0">
              <td className="py-3 font-medium text-[#f5f5f5]">
                {approval.mission?.name ?? "Unknown Mission"}
              </td>
              <td className="py-3 text-[#a1a1aa]">
                {format(new Date(approval.dateRange.start), "MMM d")} -{" "}
                {format(new Date(approval.dateRange.end), "MMM d")}
              </td>
              <td className="py-3 text-[#a1a1aa]">
                {approval.shiftCount} shifts
              </td>
              <td className="py-3">
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(approval)}>
                    Approve
                  </Button>
                  {approval.mission && (
                    <Link
                      href={`/schedules?mission=${approval.mission._id}`}
                      className="rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-xs text-[#f5f5f5] transition-colors hover:bg-[#2a2a2a]"
                    >
                      Review
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



