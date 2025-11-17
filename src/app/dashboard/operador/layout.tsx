"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardContent } from "../layout";

export default function OperadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["operador"]}>
      <DashboardContent>
        {children}
      </DashboardContent>
    </RouteGuard>
  );
}

