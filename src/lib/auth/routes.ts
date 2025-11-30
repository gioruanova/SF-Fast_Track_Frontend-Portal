import { User } from "@/types/auth";

type UserRole = User["user_role"];

export const ROLE_ROUTES: Record<UserRole, string> = {
  superadmin: "/dashboard/superadmin",
  owner: "/dashboard/owner",
  operador: "/dashboard/operador",
  profesional: "/dashboard/profesional",
};

export function getDashboardRoute(role: UserRole): string {
  return ROLE_ROUTES[role] || "/login";
}

export function isDashboardRoute(pathname: string): boolean {
  return pathname.startsWith("/dashboard");
}

export function isPublicRoute(pathname: string): boolean {
  return pathname === "/login" || pathname === "/";
}

