"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function MensajesPublicosPage() {
  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/superadmin" },
          { label: "Mensajes Públicos" }
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Mensajes Públicos</h2>
          <p className="text-muted-foreground">El superadmin puede ver los mensajes que recibio desde la pagina institucional como asi tambien los feedbacks internos de los clientes. (crear una logica para mostrar esto en 2 tablas distintas)</p>
        </div>
      </div>
    </>
  );
}

