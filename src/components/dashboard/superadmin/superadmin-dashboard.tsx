"use client";

import { DashboardProvider } from "@/context/DashboardContext";
import { StatsOverview } from "./stats-overview";
import { ReclamosChart } from "./reclamos-chart";
import { SuperadminUpcomingReclamos } from "./upcoming-reclamos";

export function SuperadminDashboard() {
  return (
    <DashboardProvider>
      <div className="space-y-4">
        <StatsOverview />
        <SuperadminUpcomingReclamos />
        <ReclamosChart />
      </div>
    </DashboardProvider>
  );
}

