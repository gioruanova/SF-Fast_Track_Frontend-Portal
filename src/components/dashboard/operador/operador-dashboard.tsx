"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardProvider } from "@/context/DashboardContext";
import { CompanyStatsOverview } from "../shared/company-stats-overview";
import { CompanyUpcomingReclamos } from "../shared/company-upcoming-reclamos";
import { CompanyFinalizedReclamos } from "../shared/company-finalized-reclamos";
import { CompanyUser } from "@/types/auth";

interface OperadorDashboardProps {
  user: CompanyUser;
}

export function OperadorDashboard({ user }: OperadorDashboardProps) {
  const getDisplayName = () => {
    const userName = user.user_name;
    if (userName) {
      return userName;
    }
    return user.user_email?.split('@')[0] || "Usuario";
  };

  const isCompanyActive = user.company_status === 1;

  return (
    <DashboardProvider>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Bienvenido, {getDisplayName()}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              {user.company_name}
              <span className="text-muted-foreground">•</span>
              <span className="flex items-center gap-1.5">
              Estado Suscripcion:
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


        {isCompanyActive ? (
          <>
            <CompanyStatsOverview />
            <CompanyUpcomingReclamos userRole="operador" />
            <CompanyFinalizedReclamos userRole="operador" />
          </>
        ) : (
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
    </DashboardProvider>
  );
}

