"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardContent } from "../layout";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["owner"]}>
      <DashboardContent>
        {children}
      </DashboardContent>
    </RouteGuard>
  );
}

