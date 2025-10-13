"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";

export default function ProfesionalDashboardPage() {
  const { user } = useAuth();

  if (!user || !isCompanyUser(user) || user.user_role !== "profesional") {
    return null;
  }

  const getDisplayName = () => {
    const userName = user.user_name;
    if (userName) {
      return userName;
    }
    return user.user_email?.split('@')[0] || "Usuario";
  };

  const isCompanyActive = user.company_status === 1;

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "Dashboard" }]} />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Bienvenido, {getDisplayName()}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              {user.company_name}
              <span className="text-muted-foreground">•</span>
              <span className="flex items-center gap-1.5">
                Estado:
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                    isCompanyActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {isCompanyActive ? 'Activa' : 'Inactiva'}
                </span>
              </span>
            </CardDescription>
          </CardHeader>
        </Card>

        {!isCompanyActive && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-muted-foreground">
                Empresa Inactiva
              </CardTitle>
              <CardDescription>
                Tu empresa está actualmente inactiva. Contacta al administrador para obtener más información.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </>
  );
}

