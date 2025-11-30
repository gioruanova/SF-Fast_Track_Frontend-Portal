import { USER_ROLES } from "@/types/users";

interface UseUserFormPermissionsOptions {
  currentUserRole?: string;
  isEditing: boolean;
  showCompanySelect?: boolean;
}

export function useUserFormPermissions({
  currentUserRole,
  isEditing,
  showCompanySelect = false,
}: UseUserFormPermissionsOptions) {
  const isSuperAdmin = currentUserRole === USER_ROLES.SUPERADMIN;

  const shouldIncludeCompanyIdInSubmit = isSuperAdmin || 
    (showCompanySelect && !isEditing);

  return {
    shouldIncludeCompanyIdInSubmit,
    isSuperAdmin,
  };
}

