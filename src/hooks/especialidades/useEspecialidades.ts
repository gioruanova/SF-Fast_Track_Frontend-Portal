import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/api_routes";
import { useDashboard } from "@/context/DashboardContext";
import {
  getEspecialidadEditEndpoint,
  getEspecialidadStatusToggleEndpoint,
} from "@/lib/apiHelpers";
import {
  Especialidad,
  CreateEspecialidadRequest,
  UpdateEspecialidadRequest,
  ESPECIALIDAD_STATUS,
} from "@/types/especialidades";

interface UseEspecialidadesOptions {
  companyId?: number;
  autoFetch?: boolean;
}

export function useEspecialidades(options: UseEspecialidadesOptions = {}) {
  const { companyId, autoFetch = true } = options;
  const { refreshTrigger } = useDashboard();
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEspecialidades = useCallback(async () => {
    try {
      setIsLoading(true);
      const endpoint = companyId
        ? API_ROUTES.GET_ESPECIALIDADES_BY_COMPANY.replace("{company_id}", String(companyId))
        : API_ROUTES.GET_ESPECIALIDADES;

      const response = await apiClient.get<Especialidad[]>(endpoint);
      setEspecialidades(response.data || []);
    } catch (error) {
      console.error("Error al cargar especialidades:", error);
      toast.error("Error al cargar las especialidades");
      setEspecialidades([]);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (autoFetch) {
      fetchEspecialidades();
    }
  }, [refreshTrigger, fetchEspecialidades, autoFetch]);

  const createEspecialidad = useCallback(
    async (data: CreateEspecialidadRequest): Promise<boolean> => {
      try {
        await apiClient.post(API_ROUTES.CREATE_ESPECIALIDADES, data);
        toast.success("Especialidad creada correctamente");
        await fetchEspecialidades();
        return true;
      } catch (error: unknown) {
        const errorMessage =
          (error as { response?: { data?: { error?: string }; status?: number } })?.response
            ?.data?.error ||
          (error as { message?: string })?.message ||
          "Error al crear la especialidad";
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchEspecialidades]
  );

  const updateEspecialidad = useCallback(
    async (
      especialidadId: number,
      data: UpdateEspecialidadRequest
    ): Promise<boolean> => {
      try {
        const endpoint = getEspecialidadEditEndpoint(especialidadId);
        await apiClient.put(endpoint, data);
        toast.success("Especialidad actualizada correctamente");
        await fetchEspecialidades();
        return true;
      } catch (error: unknown) {
        const errorMessage =
          (error as { response?: { data?: { error?: string }; status?: number } })?.response
            ?.data?.error ||
          (error as { message?: string })?.message ||
          "Error al actualizar la especialidad";
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchEspecialidades]
  );

  const toggleEspecialidadStatus = useCallback(
    async (especialidadId: number, currentStatus: number): Promise<boolean> => {
      try {
        const endpoint = getEspecialidadStatusToggleEndpoint(
          especialidadId,
          currentStatus
        );
        await apiClient.put(endpoint);

        const newStatus =
          currentStatus === ESPECIALIDAD_STATUS.ACTIVA
            ? ESPECIALIDAD_STATUS.INACTIVA
            : ESPECIALIDAD_STATUS.ACTIVA;

        setEspecialidades((prev) =>
          prev.map((esp) =>
            esp.id_especialidad === especialidadId
              ? { ...esp, estado_especialidad: newStatus }
              : esp
          )
        );

        toast.success(
          newStatus === ESPECIALIDAD_STATUS.ACTIVA
            ? "Especialidad activada"
            : "Especialidad desactivada"
        );
        return true;
      } catch (error) {
        console.error("Error al cambiar estado de la especialidad:", error);
        toast.error("Error al cambiar el estado");
        return false;
      }
    },
    []
  );

  return {
    especialidades,
    isLoading,
    fetchEspecialidades,
    createEspecialidad,
    updateEspecialidad,
    toggleEspecialidadStatus,
  };
}

