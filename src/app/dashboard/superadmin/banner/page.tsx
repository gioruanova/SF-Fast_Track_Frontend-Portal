"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function BannerGeneralPage() {
  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/superadmin" },
          { label: "Banner General" }
        ]} 
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Banner General</h2>
          <p className="text-muted-foreground">Desde aca se va a gestionar un banner temporal que aplica para todo el site (falta armar el endpoint especifico, pero es simple)</p>
        </div>
      </div>
    </>
  );
}

