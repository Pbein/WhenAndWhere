"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function DevPage() {
  const currentUser = useQuery(api.users.current);
  const promoteToAdmin = useMutation(api.users.promoteToAdmin);
  const [promoting, setPromoting] = useState(false);
  const [message, setMessage] = useState("");

  const handlePromote = async () => {
    setPromoting(true);
    setMessage("");
    try {
      const result = await promoteToAdmin({});
      setMessage("✅ " + result.message);
    } catch (error: any) {
      setMessage("❌ " + error.message);
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#f5f5f5]">Development Tools</h1>
        <p className="text-sm text-[#a1a1aa]">
          Testing utilities (remove in production)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current User Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-xs text-[#a1a1aa]">Name</div>
            <div className="text-sm text-[#f5f5f5]">{currentUser?.name ?? "N/A"}</div>
          </div>
          <div>
            <div className="text-xs text-[#a1a1aa]">Email</div>
            <div className="text-sm text-[#f5f5f5]">{currentUser?.email}</div>
          </div>
          <div>
            <div className="text-xs text-[#a1a1aa]">Current Role</div>
            <div className="mt-1">
              <Badge tone="blue">{currentUser?.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card accent="amber">
        <CardHeader>
          <CardTitle>⚠️ Role Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-[#a1a1aa]">
            Use this to promote yourself to Admin, then access the Admin Users page
            to manage all user roles including creating test accounts with different roles.
          </div>
          <div>
            <Button 
              onClick={handlePromote} 
              disabled={promoting || currentUser?.role === "Admin"}
              variant="primary"
            >
              {promoting ? "Promoting..." : "Promote Me to Admin"}
            </Button>
          </div>
          {message && (
            <div className="text-sm text-[#f5f5f5] p-3 bg-[#111111] rounded border border-[#2a2a2a]">
              {message}
            </div>
          )}
          {currentUser?.role === "Admin" && (
            <div className="text-sm text-[#10b981]">
              ✓ You're already an Admin! Go to Admin → Users to manage all roles.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-[#f5f5f5]">
            <strong>BasicUser:</strong> Can view schedules and request PTO
          </div>
          <div className="text-sm text-[#f5f5f5]">
            <strong>TeamLead:</strong> Can manage teams and approve PTO
          </div>
          <div className="text-sm text-[#f5f5f5]">
            <strong>OperationsLead:</strong> Can manage missions and operations
          </div>
          <div className="text-sm text-[#f5f5f5]">
            <strong>Admin:</strong> Full access to all features including user management
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




