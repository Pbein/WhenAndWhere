"use client";

import { Badge } from "@/components/ui/badge";
import { Doc, Id } from "@/convex/_generated/dataModel";

interface PTORequest extends Doc<"ptoRequests"> {}

interface PTOHistoryListProps {
  requests: PTORequest[] | undefined;
}

export function PTOHistoryList({ requests }: PTOHistoryListProps) {
  if (!requests || requests.length === 0) {
    return (
      <div className="text-sm text-[#a1a1aa] py-4 text-center">
        No PTO requests
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateRange = (start: number, end: number) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (startDate.toDateString() === endDate.toDateString()) {
      return formatDate(start);
    }
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <div className="space-y-2">
      {requests.slice(0, 5).map((request) => (
        <div
          key={request._id}
          className="flex items-center justify-between p-2 rounded bg-[#111111]"
        >
          <div>
            <div className="text-sm font-medium text-[#f5f5f5]">
              {formatDateRange(request.startDate, request.endDate)}
            </div>
            {request.reason && (
              <div className="text-xs text-[#a1a1aa] mt-0.5">
                {request.reason}
              </div>
            )}
          </div>
          <Badge
            tone={
              request.status === "APPROVED"
                ? "green"
                : request.status === "PENDING"
                  ? "amber"
                  : "gray"
            }
          >
            {request.status}
          </Badge>
        </div>
      ))}
      {requests.length > 5 && (
        <div className="text-xs text-[#a1a1aa] text-center pt-2">
          +{requests.length - 5} more requests
        </div>
      )}
    </div>
  );
}
