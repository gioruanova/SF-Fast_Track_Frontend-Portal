"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardProvider } from "@/context/DashboardContext";
import { CompanyProfesionalesPage } from "@/components/dashboard/shared/company-profesionales-page";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";

export default function ProfesionalesPage() {
  const { user, companyConfig } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (companyConfig?.company?.company_estado === 0) {
      router.push("/dashboard/operador");
    }
  }, [companyConfig, router]);

  if (!user || !isCompanyUser(user) || user.user_role !== "operador") {
    return null;
  }

  if (companyConfig?.company?.company_estado === 0) {
    return null;
  }

  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/operador" },
          { label: companyConfig?.plu_heading_profesional || "Profesionales" }
        ]} 
        userRole={user.user_role}
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <DashboardProvider>
          <CompanyProfesionalesPage userRole="operador" />
        </DashboardProvider>
      </div>
    </>
  );
}
