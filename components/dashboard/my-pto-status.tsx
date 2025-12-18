"use client";

import { format } from "date-fns";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

/**
 * Displays the current user's PTO request history and status
 */
export function MyPTOStatus() {
  const requests = useQuery(api.pto.myRequests);
  const cancelPTO = useMutation(api.pto.cancel);

  if (!requests || requests.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-[#a1a1aa]">
        No PTO requests
      </div>
    );
  }

  // Sort by date descending and limit to recent
  const sortedRequests = [...requests]
    .sort((a, b) => b.startDate - a.startDate)
    .slice(0, 5);

  const statusTone = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "green";
      case "DENIED":
        return "red";
      default:
        return "amber";
    }
  };

  return (
    <div className="space-y-2">
      {sortedRequests.map((request) => (
        <div
          key={request._id}
          className="flex items-center justify-between rounded-lg border border-[#2a2a2a] bg-[#111111] p-3"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#f5f5f5]">
                {format(new Date(request.startDate), "MMM d")} -{" "}
                {format(new Date(request.endDate), "MMM d, yyyy")}
              </span>
              <Badge tone={statusTone(request.status)}>{request.status}</Badge>
            </div>
            {request.reason && (
              <div className="mt-1 text-xs text-[#71717a]">{request.reason}</div>
            )}
          </div>
          {request.status === "PENDING" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cancelPTO({ requestId: request._id })}
              className="h-8 w-8 p-0 text-[#a1a1aa] hover:text-[#ef4444]"
              title="Cancel request"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}




