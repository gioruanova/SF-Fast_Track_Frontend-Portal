"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";

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
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Desde aca el operador puede dar de alta nuevos profesionales (unicamente)</p>
        </div>
      </div>
    </>
  );
}

