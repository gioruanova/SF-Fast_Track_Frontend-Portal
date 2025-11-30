"use client";

import { DashboardProvider } from "@/context/DashboardContext";
import { StatsOverview } from "./stats-overview";
import { CompanyStatsTable } from "./company-stats-table";
import { ReclamosChart } from "./reclamos-chart";

export function SuperadminDashboard() {
  return (
    <DashboardProvider>
      <div className="space-y-4">
        <StatsOverview />
        <CompanyStatsTable />
        <ReclamosChart />
      </div>
    </DashboardProvider>
  );
}

