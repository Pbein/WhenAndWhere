"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
  const users = useQuery(api.users.list);
  const updateRole = useMutation(api.users.updateRole);

  const handleRoleChange = async (userId: any, newRole: any) => {
    await updateRole({ id: userId, role: newRole });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#f5f5f5]">User Management</h1>
        <p className="text-sm text-[#a1a1aa]">Manage roles and permissions</p>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
        <table className="w-full">
          <thead className="border-b border-[#2a2a2a]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {users?.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#f5f5f5]">
                  {user.name ?? "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#a1a1aa]">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge tone="blue">{user.role}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="rounded border border-[#2a2a2a] bg-[#111111] px-2 py-1 text-xs text-[#f5f5f5]"
                  >
                    <option value="BasicUser">BasicUser</option>
                    <option value="TeamLead">TeamLead</option>
                    <option value="OperationsLead">OperationsLead</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!users || users.length === 0) && (
        <div className="text-center py-12">
          <p className="text-sm text-[#a1a1aa]">No users yet.</p>
        </div>
      )}
    </div>
  );
}
