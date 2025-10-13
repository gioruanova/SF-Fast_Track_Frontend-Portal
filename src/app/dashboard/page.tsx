"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      switch (user.user_role) {
        case "superadmin":
          router.replace("/dashboard/superadmin");
          break;
        case "owner":
          router.replace("/dashboard/owner");
          break;
        case "operador":
          router.replace("/dashboard/operador");
          break;
        case "profesional":
          router.replace("/dashboard/profesional");
          break;
        default:
          router.replace("/login");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    </div>
  );
}
