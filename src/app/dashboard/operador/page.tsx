"use client";

import { useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OperadorDashboard } from "@/components/dashboard/operador/operador-dashboard";
import { QuickActionsBar } from "@/components/features/shared/quick-actions-bar";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function OperadorDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      startTransition(() => {
        router.replace("/login");
      });
    }
  }, [user, isLoading, router]);

  const isValidUser = user && isCompanyUser(user) && user.user_role === "operador";
  const canRenderContent = isValidUser && !isLoading;

  return (
    <>
      <DashboardHeader 
        breadcrumbs={[{ label: "Dashboard" }]} 
        userRole={user?.user_role || "operador"}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-2 md:pt-3">
        {canRenderContent ? (
          <>
            <QuickActionsBar userRole="operador" />
            <OperadorDashboard user={user} />
          </>
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}
      </div>
    </>
  );
}

