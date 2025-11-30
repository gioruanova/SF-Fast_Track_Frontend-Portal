"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OwnerDashboard } from "@/components/dashboard/owner/owner-dashboard";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";
import { QuickActionsBar } from "@/components/features/shared/quick-actions-bar";
import { Skeleton } from "@/components/ui/skeleton";

export default function OwnerDashboardPage() {
  const { user, isLoading } = useAuth();

  const isValidUser = user && isCompanyUser(user) && user.user_role === "owner";
  const canRenderContent = isValidUser && !isLoading;

  return (
    <>
      <DashboardHeader 
        breadcrumbs={[{ label: "Dashboard" }]} 
        userRole={user?.user_role || "owner"}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-2 md:pt-3">
        {canRenderContent ? (
          <>
            <QuickActionsBar userRole="owner" />
            <OwnerDashboard user={user} />
          </>
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}
      </div>
    </>
  );
}

