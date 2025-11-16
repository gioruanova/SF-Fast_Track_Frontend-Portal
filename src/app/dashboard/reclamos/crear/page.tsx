"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CreateReclamoForm } from "@/components/features/reclamos/create-reclamo-form";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Página para crear reclamos
 * Ruta compartida por owner y operador
 * Protegida por RouteGuard (solo owner y operador)
 */
export default function CrearReclamoPage() {
  const { user, companyConfig } = useAuth();
  const router = useRouter();

  // Si la empresa está inactiva, redirigir al dashboard
  useEffect(() => {
    if (user && isCompanyUser(user) && companyConfig?.company?.company_estado === 0) {
      const dashboardRoute = user.user_role === "owner" ? "/dashboard/owner" : "/dashboard/operador";
      router.replace(dashboardRoute);
    }
  }, [user, companyConfig, router]);

  // Si la empresa está inactiva, no renderizar nada
  if (companyConfig?.company?.company_estado === 0) {
    return null;
  }

  const getDashboardRoute = () => {
    if (!user || !isCompanyUser(user)) return "/dashboard";
    return user.user_role === "owner" ? "/dashboard/owner" : "/dashboard/operador";
  };

  return (
    <RouteGuard allowedRoles={["owner", "operador"]}>
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: getDashboardRoute() },
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

