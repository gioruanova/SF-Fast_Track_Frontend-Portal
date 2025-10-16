"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OwnerEspecialidadesPage } from "@/components/dashboard/owner/owner-especialidades-page";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";

export default function EspecialidadesPage() {
  const { user, companyConfig } = useAuth();

  if (!user || !isCompanyUser(user) || user.user_role !== "owner") {
    return null;
  }

  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/owner" },
          { label: companyConfig?.plu_heading_especialidad || "Especialidades" }
        ]} 
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-2 md:pt-3">
        <OwnerEspecialidadesPage />
      </div>
    </>
  );
}