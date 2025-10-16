"use client";

import { SuperadminUsuariosPage } from "@/components/features/usuarios/superadmin-usuarios-page";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardProvider } from "@/context/DashboardContext";
import { useAuth } from "@/context/AuthContext";
import { isSuperAdmin } from "@/types/auth";

export default function UsersPage() {
  const { user } = useAuth();

  if (!user || !isSuperAdmin(user)) {
    return null;
  }

  return (
    <>
        <DashboardHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard/superadmin" },
            { label: "Usuarios" }
          ]}
        />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <DashboardProvider>
          <SuperadminUsuariosPage />
        </DashboardProvider>
      </div>
    </>
  );
}

