import { useMemo } from "react";
import { USER_ROLES } from "@/types/users";

interface UseUserFormConfigOptions {
  currentUserRole?: string;
  isEditing: boolean;
}

export function useUserFormConfig({
  currentUserRole,
  isEditing,
}: UseUserFormConfigOptions) {
  const isSuperAdmin = currentUserRole === USER_ROLES.SUPERADMIN;
  const isOwner = currentUserRole === USER_ROLES.OWNER;
  const isOperador = currentUserRole === USER_ROLES.OPERADOR;

  const allowedRoles = useMemo(() => {
    if (isSuperAdmin) {
      if (isEditing) {
        return [USER_ROLES.OWNER, USER_ROLES.OPERADOR, USER_ROLES.PROFESIONAL];
      }
      return [USER_ROLES.SUPERADMIN, USER_ROLES.OWNER, USER_ROLES.OPERADOR, USER_ROLES.PROFESIONAL];
    }
    
    if (isOwner) {
      return [USER_ROLES.OPERADOR, USER_ROLES.PROFESIONAL];
    }
    
    if (isOperador) {
      return [USER_ROLES.PROFESIONAL];
    }
    
    return [];
  }, [isSuperAdmin, isOwner, isOperador, isEditing]);

  const shouldShowCompanyField = isSuperAdmin;

  return {
    allowedRoles,
    shouldShowCompanyField,
    isSuperAdmin,
    isOwner,
    isOperador,
  };
}

