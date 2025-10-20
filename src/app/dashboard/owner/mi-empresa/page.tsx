"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OwnerCompanySettingsCard } from "@/components/features/empresas/owner-company-settings-card";
 

export default function MiEmpresaPage() {
  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/owner" },
          { label: "Mi Organización" }
        ]} 
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <OwnerCompanySettingsCard />
      </div>
    </>
  );
}

