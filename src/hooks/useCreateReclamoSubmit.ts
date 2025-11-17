"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { CLIENT_API } from "@/lib/clientApi/config";
import { apiClient } from "@/lib/apiClient";

interface CreateReclamoData {
  reclamo_titulo: string;
  reclamo_detalle: string;
  especialidad_id: number;
  profesional_id: number;
  cliente_id: number;
  agenda_fecha: string;
  agenda_hora_desde: string;
  reclamo_url?: string;
  agenda_hora_hasta?: string;
}

interface CreateReclamoResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export function useCreateReclamoSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { companyConfig } = useAuth();

  const createReclamo = async (data: CreateReclamoData): Promise<CreateReclamoResponse> => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!data.reclamo_titulo?.trim()) {
        throw new Error(`El título del ${companyConfig?.sing_heading_reclamos?.toLowerCase() || "reclamo"} es requerido`);
      }
      if (!data.reclamo_detalle?.trim()) {
        throw new Error(`La descripción del ${companyConfig?.sing_heading_reclamos?.toLowerCase() || "reclamo"} es requerida`);
      }
      if (!data.especialidad_id) {
        throw new Error(`La ${companyConfig?.sing_heading_especialidad?.toLowerCase() || "especialidad"} es requerida`);
      }
      if (!data.profesional_id) {
        throw new Error(`El ${companyConfig?.sing_heading_profesional?.toLowerCase() || "profesional"} es requerido`);
      }
      if (!data.cliente_id) {
        throw new Error(`El ${companyConfig?.sing_heading_solicitante?.toLowerCase() || "cliente"} es requerido`);
      }
      if (!data.agenda_fecha) {
        throw new Error(`La fecha es requerida`);
      }
      if (!data.agenda_hora_desde) {
        throw new Error(`La hora de inicio es requerida`);
      }

      if (data.reclamo_titulo.trim().length < 3) {
        throw new Error(`El título debe tener al menos 3 caracteres`);
      }
      if (data.reclamo_detalle.trim().length < 10) {
        throw new Error(`La descripción debe tener al menos 10 caracteres`);
      }

      const payload: Record<string, unknown> = {
        reclamo_titulo: data.reclamo_titulo.trim(),
        reclamo_detalle: data.reclamo_detalle.trim(),
        especialidad_id: data.especialidad_id,
        profesional_id: data.profesional_id,
        cliente_id: data.cliente_id,
        agenda_fecha: data.agenda_fecha,
        agenda_hora_desde: data.agenda_hora_desde,
      };

      if (data.reclamo_url?.trim()) {
        payload.reclamo_url = data.reclamo_url.trim();
      }
      if (data.agenda_hora_hasta?.trim()) {
        payload.agenda_hora_hasta = data.agenda_hora_hasta.trim();
      }

      const response = await apiClient.post(CLIENT_API.CREAR_RECLAMO, payload);

      return {
        success: true,
        message: "Reclamo creado exitosamente",
        data: response.data,
      };
    } catch (err: unknown) {
      console.error("Error al crear reclamo:", err);
      
      let errorMessage = "Error al crear el reclamo";
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string; message?: string }; status?: number } };
        
        if (axiosError.response?.data?.error) {
          const backendError = axiosError.response.data.error;
        
        switch (backendError) {
          case "Especialidad profesional no encontrada":
            errorMessage = "La especialidad seleccionada no está asignada al profesional elegido";
            break;
          case "El profesional no puede recibir citas en estos momentos":
            errorMessage = "El profesional seleccionado no está disponible para recibir citas";
            break;
          default:
            errorMessage = backendError;
        }
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.status) {
          switch (axiosError.response.status) {
            case 400:
              errorMessage = "Datos inválidos para crear el reclamo";
              break;
            case 401:
              errorMessage = "No autorizado para crear reclamos";
              break;
            case 403:
              errorMessage = "No tiene permisos para crear reclamos";
              break;
            case 404:
              errorMessage = "Recurso no encontrado";
              break;
            case 409:
              errorMessage = "Conflicto: El reclamo ya existe o hay un problema con los datos";
              break;
            case 422:
              errorMessage = "Datos de validación incorrectos";
              break;
            case 500:
              errorMessage = "Error interno del servidor";
              break;
            default:
              errorMessage = `Error del servidor (${axiosError.response.status})`;
          }
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      }

      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    createReclamo,
    isSubmitting,
    error,
    clearError,
  };
}
