"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";

export default function OperadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (!isCompanyUser(user) || user.user_role !== "operador") {
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

  if (!user || !isCompanyUser(user) || user.user_role !== "operador") {
    return null;
  }

  return <>{children}</>;
}

