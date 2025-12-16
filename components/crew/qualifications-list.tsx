"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UserQualification {
  _id: Id<"userQualifications">;
  qualificationId: Id<"qualifications">;
  status: "ACTIVE" | "IN_TRAINING" | "EXPIRED";
  qualification: { name: string; description: string } | null;
}

interface QualificationsListProps {
  qualifications: UserQualification[] | undefined;
  userId: Id<"users">;
}

export function QualificationsList({
  qualifications,
  userId,
}: QualificationsListProps) {
  const allQualifications = useQuery(api.qualifications.list, {});
  const grantQual = useMutation(api.qualifications.grantToUser);
  const revokeQual = useMutation(api.qualifications.revokeFromUser);
  const updateStatus = useMutation(api.qualifications.updateUserQualificationStatus);
  const [isAdding, setIsAdding] = useState(false);

  const userQualIds = qualifications?.map((q) => q.qualificationId) ?? [];
  const availableQuals = allQualifications?.filter(
    (q) => !userQualIds.includes(q._id)
  );

  const handleStatusChange = async (
    qualificationId: Id<"qualifications">,
    status: "ACTIVE" | "IN_TRAINING"
  ) => {
    await updateStatus({ userId, qualificationId, status });
  };

  const handleRemove = async (qualificationId: Id<"qualifications">) => {
    if (confirm("Remove this qualification?")) {
      await revokeQual({ userId, qualificationId });
    }
  };

  const handleAdd = async (qualificationId: Id<"qualifications">) => {
    await grantQual({ userId, qualificationId, status: "IN_TRAINING" });
    setIsAdding(false);
  };

  return (
    <div className="space-y-2">
      {qualifications?.map((uq) => (
        <div
          key={uq._id}
          className="flex items-center justify-between p-2 rounded bg-[#111111]"
        >
          <div className="flex items-center gap-2">
            <Badge
              tone={
                uq.status === "ACTIVE"
                  ? "green"
                  : uq.status === "IN_TRAINING"
                    ? "amber"
                    : "gray"
              }
            >
              {uq.status}
            </Badge>
            <span className="text-sm text-[#f5f5f5]">
              {uq.qualification?.name ?? "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <select
              value={uq.status}
              onChange={(e) =>
                handleStatusChange(
                  uq.qualificationId,
                  e.target.value as "ACTIVE" | "IN_TRAINING"
                )
              }
              className="text-xs rounded border border-[#2a2a2a] bg-[#1a1a1a] px-2 py-1 text-[#f5f5f5]"
            >
              <option value="ACTIVE">Active</option>
              <option value="IN_TRAINING">In Training</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500"
              onClick={() => handleRemove(uq.qualificationId)}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}

      {(!qualifications || qualifications.length === 0) && !isAdding && (
        <div className="text-sm text-[#a1a1aa] py-4 text-center">
          No qualifications
        </div>
      )}

      {isAdding && (
        <div className="p-3 rounded bg-[#111111] space-y-2">
          <p className="text-sm text-[#a1a1aa]">Select a qualification to add:</p>
          <div className="space-y-1">
            {availableQuals?.map((qual) => (
              <button
                key={qual._id}
                onClick={() => handleAdd(qual._id)}
                className="w-full text-left p-2 rounded hover:bg-[#1a1a1a] text-sm text-[#f5f5f5]"
              >
                {qual.name}
                <span className="text-xs text-[#a1a1aa] ml-2">
                  {qual.description}
                </span>
              </button>
            ))}
            {(!availableQuals || availableQuals.length === 0) && (
              <p className="text-sm text-[#a1a1aa]">
                All qualifications already assigned
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      {!isAdding && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsAdding(true)}
        >
          + Add Qualification
        </Button>
      )}
    </div>
  );
}



