"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function OwnerEspecialidadesPage() {
  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/owner" },
          { label: "Especialidades" }
        ]} 
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Especialidades</h2>
          <p className="text-muted-foreground">Aca el owner va a poder gestionar las especialidades de su empresa (con contador de cuantas resntantes le quedan en base a su plan) y tambien asignarlas a profesionales</p>
          <p className="text-muted-foreground">Esta parte va a tener que ser un mix entre profesionales y especialidades para buscar esa relacion con condiciones que no permita asignar mas de 1 especialidad al usuario (tengo que validar esto en el endpoint)</p>
        </div>
      </div>
    </>
  );
}

