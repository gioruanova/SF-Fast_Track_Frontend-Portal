import { useMemo } from "react";
import { User, USER_STATUS } from "@/types/users";

interface UseUserFiltersOptions {
  users: User[];
  searchTerm: string;
  filterRole: string;
  filterStatus: string;
  filterCompany?: string;
  excludeUserId?: number;
}

export function useUserFilters(options: UseUserFiltersOptions) {
  const { users, searchTerm, filterRole, filterStatus, filterCompany, excludeUserId } = options;

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (excludeUserId && user.user_id === excludeUserId) {
        return false;
      }

      const matchesSearch =
        user.user_complete_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_dni.includes(searchTerm) ||
        (filterCompany && user.company_nombre?.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRole = filterRole === "all" || user.user_role === filterRole;
      
      const matchesStatus = filterStatus === "all" ||
        (filterStatus === "active" && user.user_status === USER_STATUS.ACTIVO) ||
        (filterStatus === "blocked" || filterStatus === "inactive") && user.user_status === USER_STATUS.BLOQUEADO;

      const matchesCompany = !filterCompany || filterCompany === "all" || user.company_nombre === filterCompany;

      return matchesSearch && matchesRole && matchesStatus && matchesCompany;
    });
  }, [users, searchTerm, filterRole, filterStatus, filterCompany, excludeUserId]);

  return { filteredUsers };
}

