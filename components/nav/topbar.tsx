"use client";

import { UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function Topbar() {
  const currentUser = useQuery(api.users.current);

  // Handle loading (undefined) and syncing (null) states
  const displayName = currentUser === undefined 
    ? "Loading..." 
    : currentUser === null 
      ? "Setting up..." 
      : (currentUser.name ?? currentUser.email);

  return (
    <header className="flex items-center justify-between border-b border-[#2a2a2a] bg-[#0a0a0a] px-6 py-3">
      <div>
        <div className="text-sm font-semibold text-[#f5f5f5]">
          Welcome back, {displayName}
        </div>
        <div className="text-xs text-[#a1a1aa]">
          {currentUser?.role}
          {currentUser?.defaultMissionId && " • Mission assigned"}
        </div>
      </div>
      <UserButton afterSignOutUrl="/sign-in" />
    </header>
  );
}

