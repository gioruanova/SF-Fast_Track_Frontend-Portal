"use client";

import { useAuth } from "@/context/AuthContext";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getDashboardRoute, isPublicRoute } from "@/lib/auth/routes";

export function AuthFlow() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsRedirecting(true);
      return;
    }

    if (user) {
      const dashboardRoute = getDashboardRoute(user.user_role);
      if (pathname !== dashboardRoute) {
        setIsRedirecting(true);
        router.replace(dashboardRoute);
      } else {
        setIsRedirecting(false);
      }
    } else {
      if (pathname === "/") {
        setIsRedirecting(true);
        router.replace("/login");
      } else if (!isPublicRoute(pathname)) {
        setIsRedirecting(true);
        router.replace("/login");
      } else {
        setIsRedirecting(false);
      }
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading || isRedirecting) {
    if (isLoading) {
      return <LoadingScreen message="Por favor espera unos momentos...Lo vale..." />;
    }
    if (user && (pathname === "/login" || pathname === "/")) {
      return <LoadingScreen message="Ingresando..." />;
    }
    return <LoadingScreen message="Redirigiendo..." />;
  }

  return null;
}

