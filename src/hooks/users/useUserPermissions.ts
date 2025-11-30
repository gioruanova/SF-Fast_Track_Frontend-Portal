import { USER_ROLES, USER_STATUS, User } from "@/types/users";

interface UseUserPermissionsOptions {
  currentUserRole?: string;
  targetUser: User;
  allowedActions?: {
    edit?: boolean;
    toggleStatus?: boolean;
    restore?: boolean;
  };
}

export function useUserPermissions({
  currentUserRole,
  targetUser,
  allowedActions = { edit: true, toggleStatus: true, restore: true },
}: UseUserPermissionsOptions) {
  const isSuperAdmin = currentUserRole === USER_ROLES.SUPERADMIN;
  const isOwner = currentUserRole === USER_ROLES.OWNER;
  const isOperador = currentUserRole === USER_ROLES.OPERADOR;
  const isTargetOperador = targetUser.user_role === USER_ROLES.OPERADOR;
  const isTargetBlocked = targetUser.user_status === USER_STATUS.BLOQUEADO;

  const canEdit = isSuperAdmin || 
                  (allowedActions.edit && 
                   (isOwner || (isOperador && !isTargetOperador)));

  const canToggleStatus = isSuperAdmin ||
                          (allowedActions.toggleStatus && 
                           (isOwner || (isOperador && !isTargetOperador)));

  const canRestore = allowedActions.restore && 
                     isTargetBlocked &&
                     (isSuperAdmin || isOwner || (isOperador && !isTargetOperador));

  const isTargetSuperAdmin = targetUser.user_role === USER_ROLES.SUPERADMIN;
  const canChangeRole = (isSuperAdmin || isOwner || isOperador) && !isTargetSuperAdmin;

  return {
    canEdit,
    canToggleStatus,
    canRestore,
    canChangeRole,
  };
}

