"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Solo redirigir si estamos realmente en una ruta del owner
      const currentPath = window.location.pathname;
      const isOwnerRoute = currentPath.startsWith('/dashboard/owner');
      
      if (isOwnerRoute && (!isCompanyUser(user) || user.user_role !== "owner")) {
        router.replace("/dashboard");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!user || !isCompanyUser(user) || user.user_role !== "owner") {
    return null;
  }

  return <>{children}</>;
}

