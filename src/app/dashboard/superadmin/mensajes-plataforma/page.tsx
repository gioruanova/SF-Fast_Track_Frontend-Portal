"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function MensajesPlataformaPage() {
  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/superadmin" },
          { label: "Mensajes Plataforma" }
        ]} 
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Mensajes de Plataforma</h2>
          <p className="text-muted-foreground">Aca el superadmin puede gestionar mensajes dentro de la plataforma para todos, por empresa o por usuario puntual</p>
        </div>
      </div>
    </>
  );
}

