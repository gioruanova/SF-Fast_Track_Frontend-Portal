"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useAuth } from "@/context/AuthContext";

export default function OwnerTutorialesPage() {
  const { companyConfig } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si la empresa está inactiva, redirigir al dashboard
    if (companyConfig?.company?.company_estado === 0) {
      router.push("/dashboard/owner");
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

