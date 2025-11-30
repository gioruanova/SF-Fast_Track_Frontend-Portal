import { Badge } from "@/components/ui/badge";
import { UserRole, USER_ROLES } from "@/types/users";
import { useAuth } from "@/context/AuthContext";

interface UserRoleBadgeProps {
  role: UserRole;
  showAllRoles?: boolean;
}

export function UserRoleBadge({ role, showAllRoles = false }: UserRoleBadgeProps) {
  const { companyConfig } = useAuth();

  const roleColors: Partial<Record<UserRole, string>> = {
    superadmin: "bg-red-100 text-red-800",
    owner: "bg-blue-100 text-blue-800",
    operador: "bg-purple-100 text-purple-800",
    profesional: "bg-orange-100 text-orange-800"
  };

  const roleNames: Partial<Record<UserRole, string>> = {
    superadmin: "Superadmin",
    owner: "Owner",
    operador: companyConfig?.sing_heading_operador || "Operador",
    profesional: companyConfig?.sing_heading_profesional || "Profesional"
  };

  if (!showAllRoles && role !== USER_ROLES.OPERADOR && role !== USER_ROLES.PROFESIONAL) {
    roleNames[role] = role;
  }

  return (
    <Badge variant="secondary" className={roleColors[role] || "bg-gray-100 text-gray-800"}>
      {roleNames[role] || role}
    </Badge>
  );
}

