"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";

interface EmployeeHeaderProps {
  user: Doc<"users">;
}

export function EmployeeHeader({ user }: EmployeeHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-[#2a2a2a] flex items-center justify-center text-2xl font-medium text-[#f5f5f5]">
          {user.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">
            {user.name ?? "Unknown"}
          </h1>
          <p className="text-sm text-[#a1a1aa]">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge tone="blue">{user.role}</Badge>
            <Badge
              tone={
                user.status === "ACTIVE" || !user.status
                  ? "green"
                  : user.status === "ON_LEAVE"
                    ? "amber"
                    : "gray"
              }
            >
              {user.status ?? "ACTIVE"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
