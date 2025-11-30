"use client";

import { AuthReady } from "./auth-ready";
import { RouteGuard } from "./route-guard";

interface ProtectedPageProps {
  children: React.ReactNode;
  allowedRoles: Array<"superadmin" | "owner" | "operador" | "profesional">;
  requireCompanyConfig?: boolean;
}

export function ProtectedPage({
  children,
  allowedRoles,
  requireCompanyConfig = false,
}: ProtectedPageProps) {
  return (
    <AuthReady requireCompanyConfig={requireCompanyConfig}>
      <RouteGuard
        allowedRoles={allowedRoles}
        requireCompanyConfig={requireCompanyConfig}
      >
        {children}
      </RouteGuard>
    </AuthReady>
  );
}

