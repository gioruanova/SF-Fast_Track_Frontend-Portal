"use client";

import { useState, useEffect } from "react";
import { ProtectedPage } from "@/components/auth/protected-page";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ShapeLeft, ShapeRight } from "@/components/ui/shape";
import { SiteBannerUsers } from "@/components/dashboard/shared/site-banner-users";
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";
import { CreateReclamoSheet } from "@/components/features/reclamos/create-reclamo-sheet";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { shouldOpenCreateReclamo, setShouldOpenCreateReclamo } = useDashboard();
  const [isCreateReclamoOpen, setIsCreateReclamoOpen] = useState(false);

  useEffect(() => {
    if (shouldOpenCreateReclamo) {
      setIsCreateReclamoOpen(true);
      setShouldOpenCreateReclamo(false);
    }
  }, [shouldOpenCreateReclamo, setShouldOpenCreateReclamo]);

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteBannerUsers />
          <ShapeLeft />
          {children}
          <div className="text-foreground flex justify-center gap-1 text-center pb-4 text-sm">
            {new Date().getFullYear()}
            <div className="italic flex-col">
              <span className="font-bold">Fast</span>
              <span className="font-extralight">Track</span>
            </div>.
            <span>Todos los derechos reservados.</span>
          </div>
          <ShapeRight />
        </SidebarInset>
      </SidebarProvider>
      
      <CreateReclamoSheet 
        isOpen={isCreateReclamoOpen} 
        onClose={() => setIsCreateReclamoOpen(false)} 
      />
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedPage>
      <DashboardProvider>
        <DashboardContent>
          {children}
        </DashboardContent>
      </DashboardProvider>
    </ProtectedPage>
  );
}


