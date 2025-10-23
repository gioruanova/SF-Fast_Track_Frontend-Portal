"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OwnerDashboard } from "@/components/dashboard/owner/owner-dashboard";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";
import { QuickActionsBar } from "@/components/features/shared/quick-actions-bar";

export default function OwnerDashboardPage() {
  const { user } = useAuth();

  if (!user || !isCompanyUser(user) || user.user_role !== "owner") {
    return null;
  }

  return (
    <>
      <DashboardHeader 
        breadcrumbs={[{ label: "Dashboard" }]} 
        userRole={user.user_role}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-2 md:pt-3">
        <QuickActionsBar userRole="owner" />
        <OwnerDashboard user={user} />
      </div>
    </>
  );
}

