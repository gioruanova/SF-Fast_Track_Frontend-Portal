"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, startTransition } from "react";
import { getDashboardRoute } from "@/lib/auth/routes";
import { isCompanyUser } from "@/types/auth";

interface AuthReadyProps {
  children: React.ReactNode;
  requireCompanyConfig?: boolean;
}

export function AuthReady({ children, requireCompanyConfig = false }: AuthReadyProps) {
  const { user, companyConfig, isLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isLoading || hasRedirected.current) {
      return;
    }

    if (!user) {
      return;
    }

    if (requireCompanyConfig && isCompanyUser(user) && !companyConfig) {
      hasRedirected.current = true;
      startTransition(() => {
        router.replace(getDashboardRoute(user.user_role));
      });
    }
  }, [user, companyConfig, isLoading, requireCompanyConfig, router]);

  return <>{children}</>;
}

