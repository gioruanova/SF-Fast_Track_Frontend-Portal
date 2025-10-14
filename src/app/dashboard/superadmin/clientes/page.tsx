"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function ClientesRecurrentesPage() {
  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/superadmin" },
          { label: "Clientes Recurrentes" }
        ]} 
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Clientes Recurrentes</h2>
          <p className="text-muted-foreground">Desde aca se gestionan los clientes recurrentes que piden asisetencia o la asignacion de algun profesional(todavia no tengo decidido como mostrar la info aca) </p>
        </div>
      </div>
    </>
  );
}

