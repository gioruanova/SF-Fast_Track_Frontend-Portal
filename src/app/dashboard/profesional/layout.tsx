"use client";

import { RouteGuard } from "@/components/auth/route-guard";

export default function ProfesionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["profesional"]}>
      {children}
    </RouteGuard>
  );
}

