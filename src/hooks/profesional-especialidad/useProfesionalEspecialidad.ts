import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/api_routes";
import {
  getProfesionalEspecialidadUpdateEndpoint,
  getProfesionalEspecialidadDeleteEndpoint,
} from "@/lib/apiHelpers";
import {
  ProfesionalEspecialidad,
  CreateProfesionalEspecialidadRequest,
  UpdateProfesionalEspecialidadRequest,
} from "@/types/profesional-especialidad";

interface UseProfesionalEspecialidadOptions {
  autoFetch?: boolean;
}

export function useProfesionalEspecialidad(
  options: UseProfesionalEspecialidadOptions = {}
) {
  const { autoFetch = true } = options;
  const [asignaciones, setAsignaciones] = useState<ProfesionalEspecialidad[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchAsignaciones = useCallback(async (): Promise<ProfesionalEspecialidad[]> => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<ProfesionalEspecialidad[]>(
        API_ROUTES.GET_PROFESIONAL_ESPECIALIDAD
      );
      const data = response.data || [];
      setAsignaciones(data);
      return data;
    } catch (error) {
      console.error("Error al cargar asignaciones:", error);
      toast.error("Error al cargar las asignaciones");
      setAsignaciones([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchAsignaciones();
    }
  }, [fetchAsignaciones, autoFetch]);

  const createAsignacion = useCallback(
    async (
      data: CreateProfesionalEspecialidadRequest
    ): Promise<boolean> => {
      try {
        await apiClient.post(API_ROUTES.CREATE_PROFESIONAL_ESPECIALIDAD, data);
        toast.success("Especialidad asignada correctamente");
        await fetchAsignaciones();
        return true;
      } catch (error: unknown) {
        const axiosError = error as {
          response?: { data?: { error?: string }; status?: number };
          message?: string;
        };

        if (axiosError.response?.status === 400) {
          const errorMessage =
            axiosError.response?.data?.error || "Datos inválidos";
          toast.error(errorMessage);
        } else if (axiosError.response?.status === 404) {
          const errorMessage =
            axiosError.response?.data?.error ||
            "Profesional o especialidad no encontrados";
          toast.error(errorMessage);
        } else if (axiosError.response?.status === 409) {
          toast.error("La especialidad ya está asignada al profesional");
        } else {
          toast.error(
            `Error al asignar la especialidad: ${axiosError.response?.data?.error || axiosError.message}`
          );
        }
        return false;
      }
    },
    [fetchAsignaciones]
  );

  const updateAsignacion = useCallback(
    async (
      asignacionId: number,
      data: UpdateProfesionalEspecialidadRequest
    ): Promise<boolean> => {
      try {
        const endpoint = getProfesionalEspecialidadUpdateEndpoint(asignacionId);
        await apiClient.put(endpoint, data);
        toast.success("Asignación actualizada correctamente");
        await fetchAsignaciones();
        return true;
      } catch (error: unknown) {
        const axiosError = error as {
          response?: { data?: { error?: string }; status?: number };
          message?: string;
        };
        const errorMessage =
          axiosError.response?.data?.error ||
          axiosError.message ||
          "Error al actualizar la asignación";
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchAsignaciones]
  );

  const deleteAsignacion = useCallback(
    async (asignacionId: number): Promise<boolean> => {
      try {
        const endpoint = getProfesionalEspecialidadDeleteEndpoint(asignacionId);
        await apiClient.delete(endpoint);
        toast.success("Asignación eliminada correctamente");
        await fetchAsignaciones();
        return true;
      } catch (error: unknown) {
        const axiosError = error as {
          response?: { data?: { error?: string }; status?: number };
          message?: string;
        };

        if (axiosError.response?.status === 404) {
          const errorMessage =
            axiosError.response?.data?.error || "Asignación no encontrada";
          toast.error(errorMessage);
        } else {
          toast.error(
            `Error al eliminar la asignación: ${axiosError.response?.data?.error || axiosError.message}`
          );
        }
        return false;
      }
    },
    [fetchAsignaciones]
  );

  return {
    asignaciones,
    isLoading,
    fetchAsignaciones,
    createAsignacion,
    updateAsignacion,
    deleteAsignacion,
  };
}

