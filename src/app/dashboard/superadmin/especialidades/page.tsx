"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SuperadminEspecialidadesPage } from "@/components/features/especialidades/superadmin-especialidades-page";

export default function EspecialidadesPage() {
  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/superadmin" },
          { label: "Especialidades" }
        ]} 
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <SuperadminEspecialidadesPage />
      </div>
    </>
  );
}

