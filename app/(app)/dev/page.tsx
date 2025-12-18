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
  const seedDatabase = useMutation(api.seed.seedDatabase);
  const clearSeedData = useMutation(api.seed.clearSeedData);
  const hasSeedData = useMutation(api.seed.hasSeedData);
  
  const [promoting, setPromoting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState("");
  const [seedStatus, setSeedStatus] = useState<{
    hasSeedData: boolean;
    counts: { totalUsers: number; seedUsers: number; missions: number; teams: number };
  } | null>(null);

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

  const handleSeed = async () => {
    setSeeding(true);
    setMessage("");
    try {
      const result = await seedDatabase({});
      setMessage(
        `✅ ${result.message}: ${result.counts.totalUsers} users (${result.counts.opsLeads} ops leads, ${result.counts.teamLeads} team leads, ${result.counts.basicUsers} basic), ${result.counts.missions} missions, ${result.counts.teams} teams, ${result.counts.qualifications} qualifications`
      );
      await checkSeedStatus();
    } catch (error: any) {
      setMessage("❌ " + error.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleClear = async () => {
    if (!confirm("Are you sure you want to clear all seed data? This will delete all seeded users, missions, teams, and related data.")) {
      return;
    }
    setClearing(true);
    setMessage("");
    try {
      const result = await clearSeedData({});
      const counts = Object.entries(result.deletedCounts)
        .filter(([_, count]) => count > 0)
        .map(([table, count]) => `${table}: ${count}`)
        .join(", ");
      setMessage(`✅ ${result.message}. Deleted: ${counts}`);
      await checkSeedStatus();
    } catch (error: any) {
      setMessage("❌ " + error.message);
    } finally {
      setClearing(false);
    }
  };

  const checkSeedStatus = async () => {
    try {
      const result = await hasSeedData({});
      setSeedStatus(result);
    } catch (error) {
      // Silently fail
    }
  };

  // Check seed status on mount
  useState(() => {
    if (currentUser?.role === "Admin") {
      checkSeedStatus();
    }
  });

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
          {currentUser?.role === "Admin" && (
            <div className="text-sm text-[#10b981]">
              ✓ You&apos;re already an Admin! Go to Admin → Users to manage all roles.
            </div>
          )}
        </CardContent>
      </Card>

      {currentUser?.role === "Admin" && (
        <Card accent="emerald">
          <CardHeader>
            <CardTitle>🌱 Database Seeding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-[#a1a1aa]">
              Populate the database with realistic test data including:
            </div>
            <ul className="text-sm text-[#a1a1aa] list-disc list-inside space-y-1">
              <li>2 Zoo Missions (African Savanna, Tropical Rainforest)</li>
              <li>6 Teams (3 per mission with different shift preferences)</li>
              <li>8 Qualifications (global and mission-specific)</li>
              <li>50 Basic Users (distributed across teams)</li>
              <li>5 Team Leads (assigned to teams)</li>
              <li>2 Operations Leads (one per mission)</li>
              <li>Crew memberships, mission eligibility, and qualification assignments</li>
            </ul>

            {seedStatus && (
              <div className="p-3 bg-[#111111] rounded border border-[#2a2a2a]">
                <div className="text-xs text-[#a1a1aa] mb-2">Current Database Status:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-[#a1a1aa]">Total Users:</span>{" "}
                    <span className="text-[#f5f5f5]">{seedStatus.counts.totalUsers}</span>
                  </div>
                  <div>
                    <span className="text-[#a1a1aa]">Seeded Users:</span>{" "}
                    <span className="text-[#f5f5f5]">{seedStatus.counts.seedUsers}</span>
                  </div>
                  <div>
                    <span className="text-[#a1a1aa]">Missions:</span>{" "}
                    <span className="text-[#f5f5f5]">{seedStatus.counts.missions}</span>
                  </div>
                  <div>
                    <span className="text-[#a1a1aa]">Teams:</span>{" "}
                    <span className="text-[#f5f5f5]">{seedStatus.counts.teams}</span>
                  </div>
                </div>
                {seedStatus.hasSeedData && (
                  <div className="mt-2 text-xs text-[#f59e0b]">
                    ⚠️ Seed data already exists. Clear before re-seeding.
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={handleSeed} 
                disabled={seeding || clearing}
                variant="primary"
              >
                {seeding ? "Seeding..." : "🌱 Seed Database"}
              </Button>
              <Button 
                onClick={handleClear} 
                disabled={seeding || clearing}
                variant="secondary"
              >
                {clearing ? "Clearing..." : "🗑️ Clear Seed Data"}
              </Button>
              <Button 
                onClick={checkSeedStatus} 
                disabled={seeding || clearing}
                variant="ghost"
              >
                🔄 Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {message && (
        <div className="text-sm text-[#f5f5f5] p-4 bg-[#111111] rounded border border-[#2a2a2a]">
          {message}
        </div>
      )}

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

