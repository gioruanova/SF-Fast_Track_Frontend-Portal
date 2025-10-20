"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ClientesPage } from "@/components/features/clientes/clientes-page";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";

export default function OperadorClientesPage() {
  const { user, companyConfig } = useAuth();

  if (!user || !isCompanyUser(user) || user.user_role !== "operador") {
    return null;
  }
  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/operador" },
          { label: companyConfig?.plu_heading_solicitante || "Clientes" }
        ]} 
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <ClientesPage userRole="operador" />
      </div>
    </>
  );
}

