"use client";

import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "@/components/auth/login-form";
import { LoginLayout } from "@/components/auth/login-layout";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { AuthFlow } from "@/components/auth/auth-flow";

export default function LoginPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Cerrando sesión..." />;
  }

  if (user) {
    return <AuthFlow />;
  }

  return (
    <LoginLayout>
      <LoginForm />
    </LoginLayout>
  );
}
