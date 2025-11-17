"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "@/components/auth/login-form";
import { LoginLayout } from "@/components/auth/login-layout";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { getDashboardRoute } from "@/hooks/useRoleRouting";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const dashboardRoute = getDashboardRoute(user.user_role);
      router.replace(dashboardRoute);
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen message="Verificando sesión..." />;
  }

  if (user) {
    return null; 
  }

  return (
    <LoginLayout>
      <LoginForm />
    </LoginLayout>
  );
}
