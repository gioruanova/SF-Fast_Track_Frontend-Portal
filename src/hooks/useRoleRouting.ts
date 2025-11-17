"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/types/auth";

type UserRole = User["user_role"];

const ROLE_ROUTES: Record<UserRole, string> = {
  superadmin: "/dashboard/superadmin",
  owner: "/dashboard/owner",
  operador: "/dashboard/operador",
  profesional: "/dashboard/profesional",
};

export function useRoleRouting() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const route = ROLE_ROUTES[user.user_role];
      if (route) {
        router.replace(route);
      } else {
        router.replace("/login");
      }
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}

export function getDashboardRoute(role: UserRole): string {
  return ROLE_ROUTES[role] || "/login";
}

