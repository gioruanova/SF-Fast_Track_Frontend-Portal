import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/api_routes";
import { getEspecialidadEditEndpoint } from "@/lib/apiHelpers";
import {
  Especialidad,
  EspecialidadFormData,
  CreateEspecialidadRequest,
  UpdateEspecialidadRequest,
} from "@/types/especialidades";

interface UseEspecialidadFormOptions {
  especialidad?: Especialidad | null;
  onSuccess?: () => void;
  onClose?: () => void;
  requiresCompanyId?: boolean;
}

export function useEspecialidadForm(options: UseEspecialidadFormOptions = {}) {
  const {
    especialidad,
    onSuccess,
    onClose,
    requiresCompanyId = false,
  } = options;

  const isEditing = !!especialidad;

  const [formData, setFormData] = useState<EspecialidadFormData>({
    nombre_especialidad: "",
    company_id: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (especialidad) {
      setFormData({
        nombre_especialidad: especialidad.nombre_especialidad,
        company_id: especialidad.company_id,
      });
    } else {
      setFormData({
        nombre_especialidad: "",
        company_id: undefined,
      });
    }
  }, [especialidad]);

  const validateForm = useCallback((): boolean => {
    if (!formData.nombre_especialidad.trim()) {
      toast.error("El nombre de la especialidad es requerido");
      return false;
    }

    if (requiresCompanyId && !formData.company_id) {
      toast.error("La empresa es requerida");
      return false;
    }

    return true;
  }, [formData, requiresCompanyId]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      if (!validateForm()) {
        return false;
      }

      try {
        setIsLoading(true);

        if (isEditing && especialidad) {
          const updateData: UpdateEspecialidadRequest = {
            nombre_especialidad: formData.nombre_especialidad.trim(),
          };
          const endpoint = getEspecialidadEditEndpoint(especialidad.id_especialidad);
          await apiClient.put(endpoint, updateData);
          toast.success("Especialidad actualizada correctamente");
        } else {
          const createData: CreateEspecialidadRequest = {
            nombre_especialidad: formData.nombre_especialidad.trim(),
          };
          if (formData.company_id) {
            createData.company_id = formData.company_id;
          }
          await apiClient.post(API_ROUTES.CREATE_ESPECIALIDADES, createData);
          toast.success("Especialidad creada correctamente");
        }

        onSuccess?.();
        onClose?.();
        return true;
      } catch (error: unknown) {
        const axiosError = error as {
          response?: { data?: { error?: string; message?: string }; status?: number };
          message?: string;
        };

        const errorMessage =
          axiosError?.response?.data?.error ||
          axiosError?.response?.data?.message ||
          axiosError?.message ||
          "Error al guardar la especialidad";

        const status = axiosError?.response?.status;

        switch (status) {
          case 400:
            if (errorMessage.includes("nombre_especialidad")) {
              toast.error("El nombre de la especialidad es requerido");
            } else {
              toast.error("Datos inválidos. Verifica la información ingresada.");
            }
            break;
          case 404:
            toast.error("Especialidad no encontrada");
            break;
          case 409:
            toast.error(
              "Ya existe una especialidad con ese nombre en esta empresa"
            );
            break;
          case 500:
            toast.error(
              "Error interno del servidor. Intenta nuevamente más tarde."
            );
            break;
          default:
            toast.error(errorMessage);
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [formData, isEditing, especialidad, validateForm, onSuccess, onClose]
  );

  const handleChange = useCallback(
    (field: keyof EspecialidadFormData, value: string | number | undefined) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const reset = useCallback(() => {
    setFormData({
      nombre_especialidad: "",
      company_id: undefined,
    });
  }, []);

  return {
    formData,
    isLoading,
    isEditing,
    handleChange,
    handleSubmit,
    reset,
  };
}

