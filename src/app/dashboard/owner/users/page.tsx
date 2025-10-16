"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OwnerUsuariosPage } from "@/components/features/usuarios/owner-usuarios-page";

export default function OwnerUsersPage() {
  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/owner" },
          { label: "Usuarios" }
        ]} 
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <OwnerUsuariosPage />
      </div>
    </>
  );
}

