"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OperadorUsuariosPage } from "@/components/features/usuarios/operador-usuarios-page";

export default function OperadorUsersPage() {
  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/operador" },
          { label: "Usuarios" }
        ]} 
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <OperadorUsuariosPage />
      </div>
    </>
  );
}

