"use client";

import { format } from "date-fns";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { Check, X } from "lucide-react";

interface PTORequest {
  _id: Id<"ptoRequests">;
  userId: Id<"users">;
  startDate: number;
  endDate: number;
  reason?: string;
  status: "PENDING" | "APPROVED" | "DENIED";
}

interface PendingPTOListProps {
  requests: PTORequest[] | undefined;
  showActions?: boolean;
}

/**
 * Displays a list of pending PTO requests with optional approve/deny actions
 */
export function PendingPTOList({
  requests,
  showActions = true,
}: PendingPTOListProps) {
  const approvePTO = useMutation(api.pto.approve);
  const denyPTO = useMutation(api.pto.deny);

  if (!requests || requests.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-[#a1a1aa]">
        No pending PTO requests
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {requests.map((request) => (
        <PTORequestRow
          key={request._id}
          request={request}
          showActions={showActions}
          onApprove={() => approvePTO({ requestId: request._id })}
          onDeny={() => denyPTO({ requestId: request._id })}
        />
      ))}
    </div>
  );
}

interface PTORequestRowProps {
  request: PTORequest;
  showActions: boolean;
  onApprove: () => void;
  onDeny: () => void;
}

function PTORequestRow({
  request,
  showActions,
  onApprove,
  onDeny,
}: PTORequestRowProps) {
  const user = useQuery(api.users.get, { id: request.userId });

  return (
    <div className="flex items-center justify-between rounded-lg border border-[#2a2a2a] bg-[#111111] p-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-[#f5f5f5]">
          {user?.name ?? user?.email ?? "Loading..."}
        </div>
        <div className="text-xs text-[#a1a1aa]">
          {format(new Date(request.startDate), "MMM d")} -{" "}
          {format(new Date(request.endDate), "MMM d, yyyy")}
        </div>
        {request.reason && (
          <div className="mt-1 truncate text-xs text-[#71717a]">
            {request.reason}
          </div>
        )}
      </div>
      {showActions && (
        <div className="ml-3 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onApprove}
            className="h-8 w-8 p-0 text-[#10b981] hover:bg-[#10b981]/10"
            title="Approve"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeny}
            className="h-8 w-8 p-0 text-[#ef4444] hover:bg-[#ef4444]/10"
            title="Deny"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}




