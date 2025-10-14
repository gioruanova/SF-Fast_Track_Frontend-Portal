"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function UsersPage() {
  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/superadmin" },
          { label: "Usuarios" }
        ]} 
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Aca el superadmin puede gestionar todos los usuarios de la plataforma</p>
        </div>
      </div>
    </>
  );
}

