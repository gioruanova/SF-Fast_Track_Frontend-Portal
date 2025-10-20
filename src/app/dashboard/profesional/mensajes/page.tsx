"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProfessionalPlatformMessagesManagement } from "@/components/dashboard/shared/professional-platform-messages-management";

export default function ProfesionalMensajesPage() {
  const { companyConfig } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (companyConfig?.company?.company_estado === 0) {
      router.push("/dashboard/profesional");
    }
  }, [companyConfig, router]);


  if (companyConfig?.company?.company_estado === 0) {
    return null;
  }
  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/profesional" },
          { label: "Mensajes" }
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <ProfessionalPlatformMessagesManagement />
      </div>
    </>
  );
}

