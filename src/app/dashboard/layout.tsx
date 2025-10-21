"use client";

import { ProtectedPage } from "@/components/auth/protected-page";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ShapeLeft, ShapeRight } from "@/components/ui/shape";
import { SiteBannerUsers } from "@/components/dashboard/shared/site-banner-users";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedPage>
      <SiteBannerUsers />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
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

    </ProtectedPage>
  );
}


