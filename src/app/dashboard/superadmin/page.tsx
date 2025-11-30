"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SuperadminDashboard } from "@/components/dashboard/superadmin/superadmin-dashboard";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { isSuperAdmin } from "@/types/auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function SuperadminDashboardPage() {
  const { user, isLoading } = useAuth();

  const getDisplayName = () => {
    if (!user) return "Usuario";
    const userName = 'user_name' in user ? user.user_name : undefined;
    if (userName) {
      return userName;
    }
    return user.user_email?.split('@')[0] || "Usuario";
  };

  const isValidUser = user && isSuperAdmin(user);
  const canRenderContent = isValidUser && !isLoading;

  return (
    <>
      <DashboardHeader 
        breadcrumbs={[{ label: "Dashboard" }]} 
        userRole={user?.user_role || 'superadmin'}
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        {canRenderContent ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Bienvenido, {getDisplayName()}</CardTitle>
              </CardHeader>
            </Card>

            <SuperadminDashboard />
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

