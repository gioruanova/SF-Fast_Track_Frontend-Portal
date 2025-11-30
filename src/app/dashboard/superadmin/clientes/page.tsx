"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SuperadminClientesPage } from "@/components/features/clientes/superadmin-clientes-page";
import { useAuth } from "@/context/AuthContext";
import { isSuperAdmin } from "@/types/auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientesRecurrentesPage() {
  const { user, isLoading } = useAuth();

  const isValidUser = user && isSuperAdmin(user);
  const canRenderContent = isValidUser && !isLoading;

  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/superadmin" },
          { label: "Clientes Recurrentes" }
        ]} 
        userRole="superadmin"
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        {canRenderContent ? (
          <SuperadminClientesPage />
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

