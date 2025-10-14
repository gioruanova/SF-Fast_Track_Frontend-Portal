"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function ProfesionalMensajesPage() {
  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/profesional" },
          { label: "Mensajes" }
        ]} 
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Mensajes</h2>
          <p className="text-muted-foreground">Aca el profesional va a poder ver todos sus mensajes y mensajes generales enviados por la empresa o la plataforma</p>
        </div>
      </div>
    </>
  );
}

