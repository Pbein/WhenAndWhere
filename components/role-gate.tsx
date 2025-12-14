"use client";

import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type Role = "BasicUser" | "TeamLead" | "OperationsLead" | "Admin";

type Props = {
  allow: Role[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function RoleGate({ allow, children, fallback = null }: Props) {
  const currentUser = useQuery(api.users.current);
  const role = currentUser?.role;
  
  if (role && allow.includes(role)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}

