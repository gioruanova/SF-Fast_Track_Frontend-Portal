"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SuperadminBannerPage } from "@/components/features/banner/superadmin-banner-page";

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
        <SuperadminBannerPage />
      </div>
    </>
  );
}

