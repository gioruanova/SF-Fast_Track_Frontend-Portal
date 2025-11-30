import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { User, USER_STATUS, USER_ROLES } from "@/types/users";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserActions } from "./UserActions";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onToggleStatus: (userId: number, currentStatus: number) => void;
  onRestore?: (user: User) => void;
  showCompany?: boolean;
  showAptoRecibir?: boolean;
  currentUserRole?: string;
  allowedActions?: {
    edit?: boolean;
    toggleStatus?: boolean;
    restore?: boolean;
  };
}

export function UserTable({
  users,
  onEdit,
  onToggleStatus,
  onRestore,
  showCompany = false,
  showAptoRecibir = false,
  currentUserRole,
  allowedActions = { edit: true, toggleStatus: true, restore: true },
}: UserTableProps) {

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {showCompany && <TableHead className="w-[80px]">ID</TableHead>}
            <TableHead className="min-w-[250px]">Nombre</TableHead>
            {!showCompany && <TableHead>Email</TableHead>}
            {!showCompany && <TableHead>Teléfono</TableHead>}
            {!showCompany && <TableHead>DNI</TableHead>}
            <TableHead className="w-[120px] text-center">Rol</TableHead>
            <TableHead className="w-[100px] text-center">Estado</TableHead>
            {showCompany && <TableHead className="min-w-[200px]">Empresa</TableHead>}
            {showAptoRecibir && <TableHead className="w-[120px] text-center">Recibiendo?</TableHead>}
            <TableHead className="w-[120px] text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.user_id}>
              {showCompany && (
                <TableCell className="font-medium">#{user.user_id}</TableCell>
              )}
              <TableCell>
                {showCompany ? (
                  <div className="max-w-[230px]">
                    <p className="font-medium truncate">{user.user_complete_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.user_email}</p>
                  </div>
                ) : (
                  <span className="font-medium">{user.user_complete_name}</span>
                )}
              </TableCell>
              {!showCompany && (
                <>
                  <TableCell>
                    <a href={`mailto:${user.user_email}`} className="text-primary hover:underline">
                      {user.user_email}
                    </a>
                  </TableCell>
                  <TableCell>
                    <a href={`tel:${user.user_phone}`} className="text-primary hover:underline">
                      {user.user_phone}
                    </a>
                  </TableCell>
                  <TableCell>{user.user_dni}</TableCell>
                </>
              )}
              <TableCell className="text-center">
                <UserRoleBadge role={user.user_role} showAllRoles={showCompany} />
              </TableCell>
              <TableCell className="text-center">
                <UserStatusBadge status={user.user_status} />
              </TableCell>
              {showCompany && (
                <TableCell>
                  <div className="flex items-center gap-1 text-sm max-w-[180px]">
                    <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{user.company_nombre || "N/A"}</span>
                  </div>
                </TableCell>
              )}
              {showAptoRecibir && (
                <TableCell className="text-center">
                  {user.user_role !== USER_ROLES.OPERADOR ? (
                    user.apto_recibir === USER_STATUS.ACTIVO ? (
                      <Badge variant="default" className="bg-green-500 text-white px-2 py-1 rounded-md">
                        Si
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-red-500 text-white px-2 py-1 rounded-md">
                        No
                      </Badge>
                    )
                  ) : (
                    <span>-</span>
                  )}
                </TableCell>
              )}
              <TableCell className="text-center">
                <UserActions
                  user={user}
                  currentUserRole={currentUserRole}
                  allowedActions={allowedActions}
                  onEdit={onEdit}
                  onToggleStatus={onToggleStatus}
                  onRestore={onRestore}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
