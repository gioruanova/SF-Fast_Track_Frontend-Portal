import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";
import { getDashboardRoute } from "@/lib/auth/routes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface UseRouteAccessOptions {
  allowedRoles: Array<"superadmin" | "owner" | "operador" | "profesional">;
  requireCompanyConfig?: boolean;
  redirectOnInvalid?: boolean;
}

interface UseRouteAccessResult {
  hasAccess: boolean;
  isLoading: boolean;
  user: ReturnType<typeof useAuth>["user"];
  companyConfig: ReturnType<typeof useAuth>["companyConfig"];
}

export function useRouteAccess({
  allowedRoles,
  requireCompanyConfig = false,
  redirectOnInvalid = true,
}: UseRouteAccessOptions): UseRouteAccessResult {
  const { user, companyConfig, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    const hasValidRole = allowedRoles.includes(user.user_role);
    
    if (!hasValidRole && redirectOnInvalid) {
      router.replace(getDashboardRoute(user.user_role));
      return;
    }

    if (
      requireCompanyConfig &&
      isCompanyUser(user) &&
      !companyConfig &&
      redirectOnInvalid
    ) {
      router.replace(getDashboardRoute(user.user_role));
      return;
    }
  }, [user, companyConfig, isLoading, allowedRoles, requireCompanyConfig, redirectOnInvalid, router]);

  const hasAccess = (() => {
    if (isLoading || !user) {
      return false;
    }

    if (!allowedRoles.includes(user.user_role)) {
      return false;
    }

    if (requireCompanyConfig && isCompanyUser(user) && !companyConfig) {
      return false;
    }

    return true;
  })();

  return {
    hasAccess,
    isLoading,
    user,
    companyConfig,
  };
}

