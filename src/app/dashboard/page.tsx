"use client";

import { useRoleRouting } from "@/hooks/useRoleRouting";
import { LoadingScreen } from "@/components/ui/loading-screen";

/**
 * Página de dashboard raíz
 * Redirige automáticamente al dashboard correspondiente según el rol del usuario
 */
export default function DashboardPage() {
  useRoleRouting();

  return <LoadingScreen message="Redirigiendo al dashboard..." />;
}
