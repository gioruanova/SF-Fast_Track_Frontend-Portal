"use client";

import { ReactNode } from "react";
import { RouteGuard } from "./route-guard";
import { User } from "@/types/auth";

interface ProtectedPageProps {
  children: ReactNode;
  allowedRoles?: User["user_role"][];
}

/**
 * Componente wrapper para páginas protegidas
 * Utiliza RouteGuard internamente para manejar la protección de rutas
 * 
 * @deprecated Considera usar RouteGuard directamente para mayor flexibilidad
 */
export function ProtectedPage({ children, allowedRoles }: ProtectedPageProps) {
  return (
    <RouteGuard allowedRoles={allowedRoles}>
      {children}
    </RouteGuard>
  );
}
