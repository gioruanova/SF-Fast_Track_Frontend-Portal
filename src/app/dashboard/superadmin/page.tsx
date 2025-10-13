"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SuperadminDashboard } from "@/components/dashboard/superadmin/superadmin-dashboard";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export default function SuperadminDashboardPage() {
  const { user } = useAuth();

  const getDisplayName = () => {
    if (!user) return "Usuario";
    const userName = 'user_name' in user ? user.user_name : undefined;
    if (userName) {
      return userName;
    }
    return user.user_email?.split('@')[0] || "Usuario";
  };

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "Dashboard" }]} />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Bienvenido, {getDisplayName()}</CardTitle>
          </CardHeader>
        </Card>

        <SuperadminDashboard />
      </div>
    </>
  );
}

