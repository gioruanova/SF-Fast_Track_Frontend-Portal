"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function OwnerTutorialesPage() {
  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/owner" },
          { label: "Tutoriales" }
        ]} 
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Tutoriales</h2>
          <p className="text-muted-foreground">Aca va a una seccion de tutoriales sobre el uso del portal (algunos componentes van a ser compartidos entre los roles, y otros dedicados por perfil) - tengo que evaluar la logica y componentizacion todavia</p>
        </div>
      </div>
    </>
  );
}

