"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CreateReclamoForm } from "@/components/features/reclamos/create-reclamo-form";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CrearReclamoOwnerPage() {
  const { user, companyConfig } = useAuth();
  const router = useRouter();

useEffect(() => {
    if (user && isCompanyUser(user) && companyConfig?.company?.company_estado === 0) {
      router.replace("/dashboard/owner");
    }
  }, [user, companyConfig, router]);

if (companyConfig?.company?.company_estado === 0) {
    return null;
  }

  return (
    <RouteGuard allowedRoles={["owner"]}>
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/owner" },
          { label: `Crear ${companyConfig?.sing_heading_reclamos || "Reclamo"}` }
        ]}
        userRole={user?.user_role || "owner"}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5 w-full">
        <CreateReclamoForm />
      </div>
    </RouteGuard>
  );
}

