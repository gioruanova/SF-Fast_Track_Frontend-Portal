"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CreateReclamoForm } from "@/components/features/reclamos/create-reclamo-form";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useEffect, startTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CrearReclamoOwnerPage() {
  const { user, companyConfig, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && isCompanyUser(user) && companyConfig?.company?.company_estado === 0) {
      startTransition(() => {
        router.replace("/dashboard/owner");
      });
    }
  }, [user, companyConfig, router, isLoading]);

  const isValidUser = user && isCompanyUser(user) && user.user_role === "owner";
  const isCompanyActive = companyConfig?.company?.company_estado === 1;
  const canRenderContent = isValidUser && isCompanyActive && !isLoading;

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/owner" },
          { label: `Crear ${companyConfig?.sing_heading_reclamos || "Reclamo"}` }
        ]}
        userRole={user?.user_role || "owner"}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5 w-full">
        {canRenderContent ? (
          <CreateReclamoForm />
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

