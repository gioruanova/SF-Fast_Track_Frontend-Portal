import { useCallback } from "react";
import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/api_routes";
import { toast } from "sonner";

interface UpdateConfigPayload {
  [key: string]: string | number;
}

export function useCompanyConfig() {
  const updateConfig = useCallback(async (payload: UpdateConfigPayload): Promise<void> => {
    try {
      await apiClient.put(API_ROUTES.COMPANY_CONFIG_UPDATE, payload);
      toast.success("Configuración actualizada");
    } catch (error: unknown) {
      const err = error as { 
        response?: { 
          status?: number; 
          data?: { message?: string; error?: string };
        };
      };
      
      if (err?.response?.status === 403) {
        toast.error("No tienes permisos para actualizar esta configuración");
      } else if (err?.response?.status === 401) {
        toast.error("Sesión expirada. Por favor, inicia sesión nuevamente");
      } else {
        toast.error(err?.response?.data?.message || err?.response?.data?.error || "No se pudo actualizar. Intente nuevamente");
      }
      throw error;
    }
  }, []);

  const updateToggle = useCallback(async (key: string, value: boolean): Promise<void> => {
    const payload: UpdateConfigPayload = { [key]: value ? 1 : 0 };
    await updateConfig(payload);
  }, [updateConfig]);

  const updateField = useCallback(async (key: string, value: string): Promise<void> => {
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("El valor no puede estar vacío");
      return;
    }
    const payload: UpdateConfigPayload = { [key]: trimmed };
    await updateConfig(payload);
  }, [updateConfig]);

  return {
    updateConfig,
    updateToggle,
    updateField,
  };
}

