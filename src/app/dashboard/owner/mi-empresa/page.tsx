"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OwnerCompanySettingsCard } from "@/components/features/empresas/owner-company-settings-card";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";

export default function MiEmpresaPage() {
  const { companyConfig, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (companyConfig?.company?.company_estado === 0) {
      router.push("/dashboard/owner");
    }
  }, [companyConfig, router]);

  if (!user || !isCompanyUser(user) || user.user_role !== "owner") {
    return null;
  }

  if (companyConfig?.company?.company_estado === 0) {
    return null;
  }

  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/owner" },
          { label: "Mi Organización" }
        ]} 
        userRole={user.user_role}
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <OwnerCompanySettingsCard />
      </div>
    </>
  );
}

