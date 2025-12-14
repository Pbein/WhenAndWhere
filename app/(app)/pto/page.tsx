"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function PTOPage() {
  const currentUser = useQuery(api.users.current);
  const myRequests = useQuery(api.pto.myRequests);
  
  const canApprove = currentUser && ["TeamLead", "OperationsLead", "Admin"].includes(
    currentUser.role
  );
  
  const pendingRequests = useQuery(
    api.pto.pending,
    canApprove ? {} : "skip"
  );
  
  const requestPTO = useMutation(api.pto.request);
  const approvePTO = useMutation(api.pto.approve);
  const denyPTO = useMutation(api.pto.deny);
  
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequest = async () => {
    setIsRequesting(true);
    try {
      const start = new Date();
      start.setDate(start.getDate() + 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 3);
      
      await requestPTO({
        startDate: start.getTime(),
        endDate: end.getTime(),
        reason: "Personal time off",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">PTO Requests</h1>
          <p className="text-sm text-[#a1a1aa]">Request and manage time off</p>
        </div>
        <Button onClick={handleRequest} disabled={isRequesting}>
          New Request
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myRequests?.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between rounded border border-[#2a2a2a] bg-[#111111] px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium text-[#f5f5f5]">
                    {format(new Date(req.startDate), "MMM d")} -{" "}
                    {format(new Date(req.endDate), "MMM d")}
                  </div>
                  {req.reason && (
                    <div className="text-xs text-[#a1a1aa]">{req.reason}</div>
                  )}
                </div>
                <Badge
                  tone={
                    req.status === "APPROVED"
                      ? "green"
                      : req.status === "DENIED"
                      ? "red"
                      : "amber"
                  }
                >
                  {req.status}
                </Badge>
              </div>
            ))}
            {(!myRequests || myRequests.length === 0) && (
              <div className="text-sm text-[#a1a1aa] text-center py-4">
                No requests yet.
              </div>
            )}
          </CardContent>
        </Card>

        {canApprove && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingRequests?.map((req) => (
                <div
                  key={req._id}
                  className="rounded border border-[#2a2a2a] bg-[#111111] px-3 py-2 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-[#f5f5f5]">
                      User ID: {req.userId}
                    </div>
                    <Badge tone="amber">PENDING</Badge>
                  </div>
                  <div className="text-xs text-[#a1a1aa]">
                    {format(new Date(req.startDate), "MMM d")} -{" "}
                    {format(new Date(req.endDate), "MMM d")}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => approvePTO({ requestId: req._id })}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => denyPTO({ requestId: req._id })}
                    >
                      Deny
                    </Button>
                  </div>
                </div>
              ))}
              {(!pendingRequests || pendingRequests.length === 0) && (
                <div className="text-sm text-[#a1a1aa] text-center py-4">
                  No pending requests.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
