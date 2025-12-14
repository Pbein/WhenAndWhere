"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TemplatesPage() {
  const templates = useQuery(api.templates.list);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#f5f5f5]">Schedule Templates</h1>
        <p className="text-sm text-[#a1a1aa]">
          Manage rotation patterns (e.g., Panama 2-2-3)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates?.map((template) => (
          <Card key={template._id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#a1a1aa] mb-2">{template.description}</p>
              <div className="text-xs text-[#a1a1aa] space-y-1">
                <div>Shift Length: {template.shiftLengthHours}h</div>
                <div>Cycle: {template.cycleDays} days</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!templates || templates.length === 0) && (
        <div className="text-center py-12">
          <p className="text-sm text-[#a1a1aa]">
            No templates yet. Add a Panama 2-2-3 or custom template!
          </p>
        </div>
      )}
    </div>
  );
}
