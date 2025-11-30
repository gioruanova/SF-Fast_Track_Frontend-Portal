import { Button } from "@/components/ui/button";
import { Edit, Lock, Unlock, Key } from "lucide-react";
import { User, USER_STATUS } from "@/types/users";
import { useUserPermissions } from "@/hooks/users/useUserPermissions";

interface UserActionsProps {
  user: User;
  currentUserRole?: string;
  allowedActions?: {
    edit?: boolean;
    toggleStatus?: boolean;
    restore?: boolean;
  };
  onEdit: (user: User) => void;
  onToggleStatus: (userId: number, currentStatus: number) => void;
  onRestore?: (user: User) => void;
}

export function UserActions({
  user,
  currentUserRole,
  allowedActions,
  onEdit,
  onToggleStatus,
  onRestore,
}: UserActionsProps) {
  const { canEdit, canToggleStatus, canRestore } = useUserPermissions({
    currentUserRole,
    targetUser: user,
    allowedActions,
  });

  const buttons = [];

  if (canEdit) {
    buttons.push(
      <Button
        key="edit"
        size="sm"
        variant="default"
        onClick={() => onEdit(user)}
        title="Editar usuario"
      >
        <Edit className="h-4 w-4" />
      </Button>
    );
  }

  if (canToggleStatus) {
    buttons.push(
      <Button
        key="toggle"
        size="sm"
        variant="outline"
        onClick={() => onToggleStatus(user.user_id, user.user_status)}
        className={
          user.user_status === USER_STATUS.ACTIVO
            ? "text-destructive hover:text-destructive"
            : "text-green-600 hover:text-green-600"
        }
        title={user.user_status === USER_STATUS.ACTIVO ? "Desactivar usuario" : "Activar usuario"}
      >
        {user.user_status === USER_STATUS.ACTIVO ? (
          <Lock className="h-4 w-4" />
        ) : (
          <Unlock className="h-4 w-4" />
        )}
      </Button>
    );
  }

  if (canRestore && onRestore) {
    buttons.push(
      <Button
        key="restore"
        size="sm"
        variant="outline"
        onClick={() => onRestore(user)}
        title="Restaurar usuario"
      >
        <Key className="h-4 w-4" />
      </Button>
    );
  }

  if (buttons.length === 0) {
    return <span>-</span>;
  }

  return <div className="flex justify-center gap-2">{buttons}</div>;
}

