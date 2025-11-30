"use client";

import { useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OperadorEspecialidadesPage } from "@/components/dashboard/operador/operador-especialidades-page";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function EspecialidadesPage() {
  const { user, companyConfig, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && companyConfig?.company?.company_estado === 0) {
      startTransition(() => {
        router.push("/dashboard/operador");
      });
    }
  }, [companyConfig, router, isLoading]);

  const isValidUser = user && isCompanyUser(user) && user.user_role === "operador";
  const isCompanyActive = companyConfig?.company?.company_estado === 1;
  const canRenderContent = isValidUser && isCompanyActive && !isLoading;

  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/operador" },
          { label: companyConfig?.plu_heading_especialidad || "Especialidades" }
        ]} 
        userRole={user?.user_role || "operador"}
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        {canRenderContent ? (
          <OperadorEspecialidadesPage />
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

