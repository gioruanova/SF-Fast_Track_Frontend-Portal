"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { User } from "@/types/auth";

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles?: User["user_role"][];
  redirectTo?: string;
}

export function RouteGuard({ 
  children, 
  allowedRoles,
  redirectTo 
}: RouteGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const hasAccess = useMemo(() => {
    if (isLoading) return null;
    if (!user) return false;
    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles.includes(user.user_role);
    }
    return true;
  }, [user, isLoading, allowedRoles]);

  useEffect(() => {
    if (hasAccess === false) {
      if (!user) {
        router.replace(redirectTo || "/login");
      } else {
        router.replace("/");
      }
    }
  }, [hasAccess, user, router, redirectTo]);

  if (isLoading || hasAccess === null) {
    return <LoadingScreen message="Verificando permisos..." />;
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}

