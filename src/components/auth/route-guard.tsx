"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { User } from "@/types/auth";

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles?: User["user_role"][];
  redirectTo?: string;
}

/**
 * Componente que protege rutas basándose en autenticación y roles
 * - Verifica si el usuario está autenticado
 * - Verifica si el usuario tiene el rol permitido
 * - Redirige según corresponda
 */
export function RouteGuard({ 
  children, 
  allowedRoles,
  redirectTo 
}: RouteGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Si no hay usuario, redirigir a login
      if (!user) {
        router.replace(redirectTo || "/login");
        return;
      }

      // Si hay roles permitidos y el usuario no tiene uno de esos roles
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.user_role)) {
          router.replace("/unauthorized");
          return;
        }
      }
    }
  }, [user, isLoading, allowedRoles, router, redirectTo]);

  // Mostrar loading mientras se verifica
  if (isLoading) {
    return <LoadingScreen message="Verificando permisos..." />;
  }

  // Si no hay usuario, no renderizar nada (la redirección está en proceso)
  if (!user) {
    return null;
  }

  // Si hay roles permitidos y el usuario no tiene acceso
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.user_role)) {
      return null;
    }
  }

  return <>{children}</>;
}

