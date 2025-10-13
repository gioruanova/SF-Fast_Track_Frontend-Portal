"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedPageProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedPage({ children, allowedRoles }: ProtectedPageProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
      return;
    }

    if (user && allowedRoles && !allowedRoles.includes(user.user_role)) {
      router.replace("/unauthorized");
      return;
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.user_role)) {
    return null;
  }

  return <>{children}</>;
}
