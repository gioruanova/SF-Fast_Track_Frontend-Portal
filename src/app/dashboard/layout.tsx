"use client";

import { usePathname } from "next/navigation";
import { RouteGuard } from "@/components/auth/route-guard";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ShapeLeft, ShapeRight } from "@/components/ui/shape";
import { SiteBannerUsers } from "@/components/dashboard/shared/site-banner-users";
import { DashboardProvider } from "@/context/DashboardContext";

const PROFESIONAL_PATH = "/dashboard/profesional";

function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
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
  );
}

/**
 * Layout del dashboard
 * Aplica sidebar y estructura completa para todos los roles excepto profesional
 * Profesional tiene su propio layout mínimo en /dashboard/profesional/layout.tsx
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Profesional tiene su propio layout mínimo, no aplicar este layout
  if (pathname?.startsWith(PROFESIONAL_PATH)) {
    return <>{children}</>;
  }

  return (
    <RouteGuard>
      <DashboardProvider>
        <DashboardContent>
          {children}
        </DashboardContent>
      </DashboardProvider>
    </RouteGuard>
  );
}


