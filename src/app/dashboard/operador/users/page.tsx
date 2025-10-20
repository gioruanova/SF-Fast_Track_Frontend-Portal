"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OperadorUsuariosPage } from "@/components/features/usuarios/operador-usuarios-page";
import { useAuth } from "@/context/AuthContext";

export default function OperadorUsersPage() {
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
          { label: "Usuarios" }
        ]} 
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <OperadorUsuariosPage />
      </div>
    </>
  );
}

