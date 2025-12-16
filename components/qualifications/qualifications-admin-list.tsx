"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

interface QualificationsAdminListProps {
  qualifications: Doc<"qualifications">[] | undefined;
  onEdit: (id: Id<"qualifications">) => void;
}

export function QualificationsAdminList({
  qualifications,
  onEdit,
}: QualificationsAdminListProps) {
  const deleteQual = useMutation(api.qualifications.remove);

  const handleDelete = async (id: Id<"qualifications">) => {
    if (
      confirm(
        "Delete this qualification? This will also remove it from all users."
      )
    ) {
      await deleteQual({ id });
    }
  };

  if (!qualifications || qualifications.length === 0) {
    return (
      <div className="text-sm text-[#a1a1aa] py-4 text-center">
        No qualifications in this category
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {qualifications.map((qual) => (
        <div
          key={qual._id}
          className="flex items-center justify-between p-3 rounded bg-[#111111]"
        >
          <div>
            <div className="font-medium text-[#f5f5f5]">{qual.name}</div>
            <div className="text-xs text-[#a1a1aa]">{qual.description}</div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(qual._id)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500"
              onClick={() => handleDelete(qual._id)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}



