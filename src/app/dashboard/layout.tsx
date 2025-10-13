"use client";

import { ProtectedPage } from "@/components/auth/protected-page";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedPage>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ProtectedPage>
  );
}


