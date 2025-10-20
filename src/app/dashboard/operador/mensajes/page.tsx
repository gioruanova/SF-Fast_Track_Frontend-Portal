"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useAuth } from "@/context/AuthContext";
import { CompanyPlatformMessagesManagement } from "@/components/dashboard/shared/company-platform-messages-management";

export default function OperadorMensajesPage() {
  const { companyConfig } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (companyConfig?.company?.company_estado === 0) {
      router.push("/dashboard/operador");
    }
  }, [companyConfig, router]);

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
        <CompanyPlatformMessagesManagement />
      </div>
    </>
  );
}

