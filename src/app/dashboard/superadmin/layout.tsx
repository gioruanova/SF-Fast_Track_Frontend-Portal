"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardContent } from "../layout";

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["superadmin"]}>
      <DashboardContent>
        {children}
      </DashboardContent>
    </RouteGuard>
  );
}

