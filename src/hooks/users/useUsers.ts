import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/api_routes";
import { useDashboard } from "@/context/DashboardContext";
import {
  getUserStatusToggleEndpoint,
  getUserRestoreEndpoint,
  getUserEditEndpoint,
  generateDefaultPassword,
} from "@/lib/apiHelpers";
import { User, UserStatus, USER_STATUS } from "@/types/users";
import { applyUserFilters } from "@/lib/utils/userFilters";

interface UseUsersOptions {
  allowedRoles?: string[];
  excludeCurrentUser?: boolean;
  currentUserId?: number;
}

export function useUsers(options: UseUsersOptions = {}) {
  const { allowedRoles, excludeCurrentUser = false, currentUserId } = options;
  const { refreshTrigger } = useDashboard();
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<User[]>(API_ROUTES.GET_USERS);
      setAllUsers(response.data || []);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      toast.error("Error al cargar usuarios");
      setAllUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const users = useMemo(() => {
    return applyUserFilters(allUsers, {
      allowedRoles,
      excludeCurrentUser,
      currentUserId,
    });
  }, [allUsers, allowedRoles, excludeCurrentUser, currentUserId]);

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger, fetchUsers]);

  const toggleUserStatus = useCallback(
    async (userId: number, currentStatus: UserStatus): Promise<void> => {
      try {
        const newStatus =
          currentStatus === USER_STATUS.ACTIVO
            ? USER_STATUS.BLOQUEADO
            : USER_STATUS.ACTIVO;
        const url = getUserStatusToggleEndpoint(userId, currentStatus);
        await apiClient.post(url);

        setAllUsers((prev) =>
          prev.map((user) =>
            user.user_id === userId
              ? { ...user, user_status: newStatus }
              : user
          )
        );

        toast.success(
          newStatus === USER_STATUS.ACTIVO
            ? "Usuario activado"
            : "Usuario desactivado"
        );
      } catch (error) {
        console.error("Error al cambiar estado del usuario:", error);
        toast.error("Error al cambiar estado del usuario");
      }
    },
    []
  );

  const changePassword = useCallback(
    async (userId: number, newPassword: string): Promise<boolean> => {
      try {
        const url = getUserRestoreEndpoint(userId);
        await apiClient.put(url, { new_password: newPassword });
        toast.success("Contraseña cambiada correctamente");
        return true;
      } catch (error) {
        console.error("Error al cambiar contraseña:", error);
        toast.error("Error al cambiar contraseña");
        return false;
      }
    },
    []
  );

  const createUser = useCallback(
    async (userData: {
      user_complete_name: string;
      user_dni: string;
      user_phone: string;
      user_email: string;
      user_role: string;
      user_password?: string;
      company_id?: number | null;
    }): Promise<boolean> => {
      try {
        const dni = userData.user_dni.trim();
        const formData = {
          ...userData,
          user_password:
            userData.user_password || generateDefaultPassword(dni),
        };

        await apiClient.post(API_ROUTES.USERS_CREATE, formData);
        toast.success("Usuario creado correctamente");
        await fetchUsers();
        return true;
      } catch (error: unknown) {
        const axiosError = error as {
          response?: { data?: { error?: string }; status?: number };
          message?: string;
        };
        const errorMessage =
          axiosError?.response?.data?.error ||
          axiosError?.message ||
          "Error al crear el usuario";
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchUsers]
  );

  const updateUser = useCallback(
    async (
      userId: number,
      userData: {
        user_complete_name?: string;
        user_dni?: string;
        user_phone?: string;
        user_email?: string;
        user_role?: string;
        user_password?: string;
        company_id?: number | null;
      }
    ): Promise<boolean> => {
      try {
        const url = getUserEditEndpoint(userId);
        const editData: Record<string, unknown> = { ...userData };

        if (!editData.user_password || editData.user_password === "") {
          delete editData.user_password;
        }

        await apiClient.put(url, editData);
        toast.success("Usuario actualizado correctamente");
        await fetchUsers();
        return true;
      } catch (error: unknown) {
        const axiosError = error as {
          response?: { data?: { error?: string }; status?: number };
          message?: string;
        };
        const errorMessage =
          axiosError?.response?.data?.error ||
          axiosError?.message ||
          "Error al actualizar el usuario";
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchUsers]
  );

  return {
    users,
    isLoading,
    fetchUsers,
    toggleUserStatus,
    changePassword,
    createUser,
    updateUser,
  };
}
