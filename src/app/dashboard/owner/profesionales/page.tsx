"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardProvider } from "@/context/DashboardContext";
import { CompanyProfesionalesPage } from "@/components/dashboard/shared/company-profesionales-page";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";

export default function ProfesionalesPage() {
  const { user, companyConfig } = useAuth();

  if (!user || !isCompanyUser(user) || user.user_role !== "owner") {
    return null;
  }

  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/owner" },
          { label: companyConfig?.plu_heading_profesional || "Profesionales" }
        ]} 
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <DashboardProvider>
          <CompanyProfesionalesPage userRole="owner" />
        </DashboardProvider>
      </div>
    </>
  );
}
