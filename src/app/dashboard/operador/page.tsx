"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OperadorDashboard } from "@/components/dashboard/operador/operador-dashboard";
import { QuickActionsBar } from "@/components/features/shared/quick-actions-bar";

import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";

export default function OperadorDashboardPage() {
  const { user } = useAuth();

  if (!user || !isCompanyUser(user) || user.user_role !== "operador") {
    return null;
  }

  return (
    <>
      <DashboardHeader 
        breadcrumbs={[{ label: "Dashboard" }]} 
        userRole={user.user_role}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-2 md:pt-3">
        <QuickActionsBar userRole="operador" />
        <OperadorDashboard user={user} />
      </div>
    </>
  );
}

