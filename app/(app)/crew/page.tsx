"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";

export default function CrewPage() {
  const users = useQuery(api.users.list);
  const missions = useQuery(api.missions.list);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#f5f5f5]">Crew</h1>
        <p className="text-sm text-[#a1a1aa]">View and manage staff members</p>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
        <table className="w-full">
          <thead className="border-b border-[#2a2a2a]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
                Mission
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {users?.map((user) => {
              const mission = user.defaultMissionId
                ? missions?.find((m) => m._id === user.defaultMissionId)
                : null;
              return (
                <tr
                  key={user._id}
                  className="hover:bg-[#111111] transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/crew/${user._id}`}
                      className="text-[#f5f5f5] hover:text-emerald-400"
                    >
                      {user.name ?? "N/A"}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#a1a1aa]">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge tone="blue">{user.role}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#a1a1aa]">
                    {mission?.name ?? "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(!users || users.length === 0) && (
        <div className="text-center py-12">
          <p className="text-sm text-[#a1a1aa]">No crew members yet.</p>
        </div>
      )}
    </div>
  );
}
