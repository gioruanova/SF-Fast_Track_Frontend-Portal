"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";
import { TutorialesVideosList } from "@/components/dashboard/shared/tutoriales-videos-list";

export default function OperadorTutorialesPage() {
  const { companyConfig, user } = useAuth();
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
          { label: "Tutoriales" }
        ]}
        userRole={user.user_role}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <div className="space-y-4">
          <TutorialesVideosList role={user.user_role} />
        </div>
      </div>
    </>
  );
}

