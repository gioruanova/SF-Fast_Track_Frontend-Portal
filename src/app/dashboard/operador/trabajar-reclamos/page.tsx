"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardProvider } from "@/context/DashboardContext";
import { CompanyReclamosActivosPage } from "@/components/dashboard/shared/company-reclamos-activos-page";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";

export default function TrabajarReclamosPage() {
  const { user, companyConfig } = useAuth();

  if (!user || !isCompanyUser(user) || user.user_role !== "operador") {
    return null;
  }

  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/operador" },
          { label: `${companyConfig?.plu_heading_reclamos || "Reclamos"} en curso` }
        ]} 
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <DashboardProvider>
          <CompanyReclamosActivosPage userRole="operador" />
        </DashboardProvider>
      </div>
    </>
  );
}

