"use client";

import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, startTransition } from "react";
import { getDashboardRoute } from "@/lib/auth/routes";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: Array<"superadmin" | "owner" | "operador" | "profesional">;
  requireCompanyConfig?: boolean;
}

export function RouteGuard({ 
  children, 
  allowedRoles, 
  requireCompanyConfig = false 
}: RouteGuardProps) {
  const { user, companyConfig, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  const lastPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== lastPathname.current) {
      hasRedirected.current = false;
      lastPathname.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    if (isLoading || hasRedirected.current) {
      return;
    }

    if (!user) {
      hasRedirected.current = true;
      startTransition(() => {
        router.replace("/login");
      });
      return;
    }

    if (!allowedRoles.includes(user.user_role)) {
      hasRedirected.current = true;
      startTransition(() => {
        router.replace(getDashboardRoute(user.user_role));
      });
      return;
    }

    if (requireCompanyConfig && isCompanyUser(user) && !companyConfig) {
      hasRedirected.current = true;
      startTransition(() => {
        router.replace(getDashboardRoute(user.user_role));
      });
      return;
    }
  }, [user, companyConfig, isLoading, allowedRoles, requireCompanyConfig, router]);

  return <>{children}</>;
}
