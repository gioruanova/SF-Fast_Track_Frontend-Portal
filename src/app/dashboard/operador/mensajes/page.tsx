"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useAuth } from "@/context/AuthContext";

export default function OperadorMensajesPage() {
  const { companyConfig } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si la empresa está inactiva, redirigir al dashboard
    if (companyConfig?.company?.company_estado === 0) {
      router.push("/dashboard/operador");
    }
  }, [companyConfig, router]);

  // Si la empresa está inactiva, no renderizar nada
  if (companyConfig?.company?.company_estado === 0) {
    return null;
  }

  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/operador" },
          { label: "Mensajes" }
        ]} 
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Mensajes</h2>
          <p className="text-muted-foreground">Aca se van a ver los mensajes y gestionar envios persolaizados</p>
        </div>
      </div>
    </>
  );
}

