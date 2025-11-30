"use client";

import { useState, useEffect, useCallback } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { API_ROUTES } from "@/lib/api_routes";
import { apiClient } from "@/lib/apiClient";
import { ClienteRecurrente, ApiResponse } from "@/types/clientes";
import { toast } from "sonner";

export function useClientes() {
  const { refreshTrigger } = useDashboard();
  const [clientes, setClientes] = useState<ClienteRecurrente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClientes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<ApiResponse<ClienteRecurrente[]> | ClienteRecurrente[]>(API_ROUTES.GET_CLIENTES_RECURRENTES);
      
      const data = Array.isArray(response.data) 
        ? response.data 
        : (response.data as ApiResponse<ClienteRecurrente[]>)?.data || [];
      
      setClientes(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error al obtener clientes");
      setError(error);
      console.error("Error obteniendo clientes:", err);
      toast.error("Error al cargar clientes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [refreshTrigger, fetchClientes]);

  const createCliente = useCallback(async (clienteData: {
    cliente_complete_name: string;
    cliente_dni: string;
    cliente_phone: string;
    cliente_email: string;
    cliente_direccion?: string;
    cliente_lat?: number | null;
    cliente_lng?: number | null;
  }): Promise<boolean> => {
    try {
      const response = await apiClient.post<ApiResponse<ClienteRecurrente>>(API_ROUTES.CREATE_CLIENTE_RECURRENTE, clienteData);
      
      const message = (response.data as ApiResponse<ClienteRecurrente>)?.message || "Cliente creado correctamente";
      toast.success(message);
      await fetchClientes();
      return true;
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string; error?: string }; status?: number }; message?: string };
      const errorMessage = axiosError?.response?.data?.message || 
                          axiosError?.response?.data?.error || 
                          axiosError?.message || 
                          "Error al crear el cliente";
      toast.error(errorMessage);
      return false;
    }
  }, [fetchClientes]);

  const updateCliente = useCallback(async (clienteId: number, updateData: {
    cliente_complete_name?: string;
    cliente_dni?: string;
    cliente_phone?: string;
    cliente_email?: string;
    cliente_direccion?: string;
    cliente_lat?: number | null;
    cliente_lng?: number | null;
  }): Promise<boolean> => {
    try {
      const url = API_ROUTES.UPDATE_CLIENTE_RECURRENTE.replace('{cliente_id}', clienteId.toString());
      const response = await apiClient.put<ApiResponse<ClienteRecurrente>>(url, updateData);
      
      const message = (response.data as ApiResponse<ClienteRecurrente>)?.message || "Cliente actualizado correctamente";
      toast.success(message);
      await fetchClientes();
      return true;
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string; error?: string }; status?: number }; message?: string };
      const errorMessage = axiosError?.response?.data?.message || 
                          axiosError?.response?.data?.error || 
                          axiosError?.message || 
                          "Error al actualizar el cliente";
      toast.error(errorMessage);
      return false;
    }
  }, [fetchClientes]);

  const toggleClienteStatus = useCallback(async (clienteId: number, isActive: boolean): Promise<boolean> => {
    try {
      const endpoint = isActive
        ? API_ROUTES.BLOCK_CLIENTE_RECURRENTE.replace('{cliente_id}', clienteId.toString())
        : API_ROUTES.UNBLOCK_CLIENTE_RECURRENTE.replace('{cliente_id}', clienteId.toString());
      
      const response = await apiClient.put<ApiResponse<ClienteRecurrente>>(endpoint);
      
      const message = (response.data as ApiResponse<ClienteRecurrente>)?.message || 
                     (isActive ? "Cliente desactivado correctamente" : "Cliente activado correctamente");
      toast.success(message);
      await fetchClientes();
      return true;
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string; error?: string }; status?: number }; message?: string };
      const errorMessage = axiosError?.response?.data?.message || 
                          axiosError?.response?.data?.error || 
                          axiosError?.message || 
                          "Error al cambiar el estado del cliente";
      toast.error(errorMessage);
      return false;
    }
  }, [fetchClientes]);

  return {
    clientes,
    isLoading,
    error,
    fetchClientes,
    createCliente,
    updateCliente,
    toggleClienteStatus,
  };
}

