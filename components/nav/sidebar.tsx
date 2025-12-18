"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

type Role = "BasicUser" | "TeamLead" | "OperationsLead" | "Admin";

type NavItem = {
  label: string;
  href: string;
  roles?: Role[];
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Missions", href: "/missions", roles: ["TeamLead", "OperationsLead", "Admin"] },
  { label: "Crews", href: "/crew", roles: ["TeamLead", "OperationsLead", "Admin"] },
  { label: "Personnel", href: "/personnel", roles: ["TeamLead", "OperationsLead", "Admin"] },
  {
    label: "Schedules",
    href: "/schedules",
    roles: ["BasicUser", "TeamLead", "OperationsLead", "Admin"],
  },
  { label: "Templates", href: "/templates", roles: ["TeamLead", "OperationsLead", "Admin"] },
  {
    label: "PTO",
    href: "/pto",
    roles: ["BasicUser", "TeamLead", "OperationsLead", "Admin"],
  },
  { label: "Approvals", href: "/approvals", roles: ["OperationsLead", "Admin"] },
  { label: "Users", href: "/admin/users", roles: ["Admin"] },
  { label: "🔧 Dev Tools", href: "/dev" },
];

export function Sidebar() {
  const pathname = usePathname();
  const currentUser = useQuery(api.users.current);
  
  // Handle loading state (undefined) and user not yet synced (null)
  const isLoading = currentUser === undefined;
  const isUserSyncing = currentUser === null;
  const role = currentUser?.role;
  
  const filtered = navItems.filter(
    (item) => !item.roles || (role && item.roles.includes(role)),
  );

  return (
    <aside className="flex h-full min-h-screen w-64 flex-col border-r border-[#2a2a2a] bg-[#111111] px-4 py-6">
      <div className="mb-8 flex items-center gap-2">
        <span className="text-2xl">🐾</span>
        <div>
          <div className="text-lg font-semibold text-[#f5f5f5]">Zoo Scheduler</div>
          <div className="text-xs text-[#a1a1aa]">Operations Scheduler</div>
        </div>
      </div>
      {isLoading || isUserSyncing ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2a2a2a] border-t-[#10b981]" />
          <p className="mt-2 text-sm text-[#a1a1aa]">
            {isUserSyncing ? "Setting up your account..." : "Loading..."}
          </p>
        </div>
      ) : (
        <>
          <nav className="flex-1 space-y-1">
            {filtered.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium text-[#a1a1aa] transition-colors hover:bg-[#1a1a1a] hover:text-[#f5f5f5]",
                    active && "bg-[#10b981]/10 text-[#10b981]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-[#2a2a2a] pt-4">
            <div className="rounded-lg bg-[#1a1a1a] px-3 py-2">
              <div className="text-xs font-medium text-[#a1a1aa]">ROLE</div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#10b981]"></div>
                <div className="text-sm font-medium text-[#f5f5f5]">{role}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

