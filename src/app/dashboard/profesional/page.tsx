"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProfesionalDashboard } from "@/components/dashboard/profesional/profesional-dashboard";
import { GestionarEstadoDisponibilidad } from "@/components/features/shared/gestionar-estado-disponibilidad";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";

export default function ProfesionalDashboardPage() {
  const { user } = useAuth();

  if (!user || !isCompanyUser(user) || user.user_role !== "profesional") {
    return null;
  }

  const isCompanyActive = user.company_status === 1;

  return (
    <>
      <DashboardHeader 
        breadcrumbs={[{ label: "Dashboard" }]} 
        rightContent={isCompanyActive ? <GestionarEstadoDisponibilidad /> : undefined}
        userRole={user.user_role}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <ProfesionalDashboard user={user} />
      </div>
    </>
  );
}

