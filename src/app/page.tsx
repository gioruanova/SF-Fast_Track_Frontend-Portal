"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { getDashboardRoute } from "@/hooks/useRoleRouting";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        const dashboardRoute = getDashboardRoute(user.user_role);
        router.replace(dashboardRoute);
      } else {
        router.replace("/login");
      }
    }
  }, [user, isLoading, router]);

  return <LoadingScreen message="Cargando..." />;
}
