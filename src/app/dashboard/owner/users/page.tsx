"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OwnerUsuariosPage } from "@/components/features/usuarios/owner-usuarios-page";
import { useAuth } from "@/context/AuthContext";

export default function OwnerUsersPage() {
  const { companyConfig } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // si la empresa esta inactiva, redirigir al dashboard
    if (companyConfig?.company?.company_estado === 0) {
      router.push("/dashboard/owner");
    }
  }, [companyConfig, router]);

  // si la empresa esta inactiva, no renderizar nada
  if (companyConfig?.company?.company_estado === 0) {
    return null;
  }

  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/owner" },
          { label: "Usuarios" }
        ]} 
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <OwnerUsuariosPage />
      </div>
    </>
  );
}

