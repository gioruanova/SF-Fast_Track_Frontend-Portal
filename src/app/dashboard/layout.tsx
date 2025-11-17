"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ShapeLeft, ShapeRight } from "@/components/ui/shape";
import { DashboardProvider } from "@/context/DashboardContext";
import { DashboardFooter } from "@/components/layout/footer/dashboard-footer";

const PROFESIONAL_PATH = "/dashboard/profesional";
const ROLE_PATHS = ["/dashboard/owner", "/dashboard/operador", "/dashboard/superadmin"];

export function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ShapeLeft />
        {children}
        <DashboardFooter />
        <ShapeRight />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const layoutType = useMemo(() => {
    if (pathname?.startsWith(PROFESIONAL_PATH)) {
      return "profesional";
    }
    if (ROLE_PATHS.some(path => pathname?.startsWith(path))) {
      return "role-specific";
    }
    return "default";
  }, [pathname]);
  
  if (layoutType === "profesional") {
    return <>{children}</>;
  }

  if (layoutType === "role-specific") {
    return <DashboardProvider>{children}</DashboardProvider>;
  }

  return (
    <DashboardProvider>
      <DashboardContent>
        {children}
      </DashboardContent>
    </DashboardProvider>
  );
}

