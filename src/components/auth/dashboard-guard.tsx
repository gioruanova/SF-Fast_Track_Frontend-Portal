"use client";

import { ReactNode } from "react";
import { RouteGuard } from "./route-guard";
import { User } from "@/types/auth";

interface DashboardGuardProps {
  children: ReactNode;
  allowedRoles: User["user_role"][];
}

export function DashboardGuard({ children, allowedRoles }: DashboardGuardProps) {
  return (
    <RouteGuard allowedRoles={allowedRoles}>
      {children}
    </RouteGuard>
  );
}

