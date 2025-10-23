"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardProvider } from "@/context/DashboardContext";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";
import { ProfesionalReclamosActivosPage } from "@/components/dashboard/profesional/profesional-reclamos-activos-page";

export default function TrabajarReclamosPage() {
  const { user, companyConfig } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (companyConfig?.company?.company_estado === 0) {
      router.push("/dashboard/profesional");
    }
  }, [companyConfig, router]);

  if (!user || !isCompanyUser(user) || user.user_role !== "profesional") {
    return null;
  }

  if (companyConfig?.company?.company_estado === 0) {
    return null;
  }

  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/profesional" },
          { label: `Trabajar ${companyConfig?.plu_heading_reclamos || "Reclamos"}` }
        ]} 
        userRole={user.user_role}
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <DashboardProvider>
          <ProfesionalReclamosActivosPage />
        </DashboardProvider>
      </div>
    </>
  );
}

