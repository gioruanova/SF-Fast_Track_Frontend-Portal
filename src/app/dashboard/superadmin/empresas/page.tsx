"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { EmpresasPage } from "@/components/features/empresas/empresas-page";

export default function SuperadminEmpresasPage() {
  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/superadmin" },
          { label: "Empresas" }
        ]} 
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <EmpresasPage />
      </div>
    </>
  );
}

