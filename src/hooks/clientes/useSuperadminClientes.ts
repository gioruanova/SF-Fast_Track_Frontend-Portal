"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { API_ROUTES } from "@/lib/api_routes";
import { apiClient } from "@/lib/apiClient";
import { ClienteRecurrente, ApiResponse } from "@/types/clientes";
import { toast } from "sonner";

interface ClienteRecurrenteWithStats extends Omit<ClienteRecurrente, 'cliente_active'> {
  cliente_active: boolean;
  company_name?: string;
  total_reclamos?: number;
  ultimo_reclamo?: string;
}

interface EmpresaStats {
  company_id: number;
  company_name: string;
  total_clientes: number;
  clientes_activos: number;
  clientes_inactivos: number;
  porcentaje_activos: number;
  total_reclamos: number;
}

export function useSuperadminClientes() {
  const { refreshTrigger } = useDashboard();
  const [clientes, setClientes] = useState<ClienteRecurrenteWithStats[]>([]);
  const [empresasStats, setEmpresasStats] = useState<EmpresaStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadClientes = useCallback(async () => {
    try {
      setIsLoading(true);

      const [clientesResponse, empresasResponse, reclamosResponse] = await Promise.all([
        apiClient.get<ApiResponse<ClienteRecurrente[]> | ClienteRecurrente[]>(API_ROUTES.GET_CLIENTES_RECURRENTES),
        apiClient.get(API_ROUTES.GET_COMPANIES),
        apiClient.get(API_ROUTES.GET_RECLAMOS)
      ]);

      let clientesData: ClienteRecurrente[] = [];
      
      if (Array.isArray(clientesResponse.data)) {
        clientesData = clientesResponse.data;
      } else if (clientesResponse.data && typeof clientesResponse.data === 'object' && 'data' in clientesResponse.data) {
        const apiResponse = clientesResponse.data as ApiResponse<ClienteRecurrente[]>;
        clientesData = Array.isArray(apiResponse.data) ? apiResponse.data : [];
      }

      const empresasData = Array.isArray(empresasResponse.data) ? empresasResponse.data : [];
      const reclamosData = Array.isArray(reclamosResponse.data) ? reclamosResponse.data : [];

      const reclamosPorCliente = new Map<string, number>();
      reclamosData.forEach((reclamo: { cliente_complete_name?: string }) => {
        if (reclamo.cliente_complete_name) {
          const nombreCliente = reclamo.cliente_complete_name.trim().toLowerCase();
          reclamosPorCliente.set(nombreCliente, (reclamosPorCliente.get(nombreCliente) || 0) + 1);
        }
      });

      const reclamosPorEmpresa = new Map<string, number>();
      reclamosData.forEach((reclamo: { company_name?: string }) => {
        if (reclamo.company_name) {
          const nombreEmpresa = reclamo.company_name.trim();
          reclamosPorEmpresa.set(nombreEmpresa, (reclamosPorEmpresa.get(nombreEmpresa) || 0) + 1);
        }
      });

      const clientesConReclamos: ClienteRecurrenteWithStats[] = clientesData.map((cliente: ClienteRecurrente) => {
        const nombreCliente = cliente.cliente_complete_name.trim().toLowerCase();
        const totalReclamos = reclamosPorCliente.get(nombreCliente) || 0;
        return {
          ...cliente,
          cliente_active: cliente.cliente_active === 1,
          total_reclamos: totalReclamos
        };
      });

      setClientes(clientesConReclamos);

      const empresasMap = new Map<number, string>();
      empresasData.forEach((empresa: { company_id: number; company_nombre: string }) => {
        empresasMap.set(empresa.company_id, empresa.company_nombre);
      });

      const empresaMap = new Map<number, ClienteRecurrenteWithStats[]>();
      clientesConReclamos.forEach((cliente: ClienteRecurrenteWithStats) => {
        if (cliente.company_id) {
          if (!empresaMap.has(cliente.company_id)) {
            empresaMap.set(cliente.company_id, []);
          }
          empresaMap.get(cliente.company_id)!.push(cliente);
        }
      });

      const statsArray: EmpresaStats[] = Array.from(empresaMap.entries()).map(([companyId, clientesEmpresa]) => {
        const activos = clientesEmpresa.filter(c => c.cliente_active).length;
        const inactivos = clientesEmpresa.filter(c => !c.cliente_active).length;
        const nombreEmpresa = empresasMap.get(companyId) || `Empresa ${companyId}`;
        const totalReclamos = reclamosPorEmpresa.get(nombreEmpresa) || clientesEmpresa.reduce((sum, c) => sum + (c.total_reclamos || 0), 0);

        return {
          company_id: companyId,
          company_name: nombreEmpresa,
          total_clientes: clientesEmpresa.length,
          clientes_activos: activos,
          clientes_inactivos: inactivos,
          porcentaje_activos: clientesEmpresa.length > 0 ? Math.round((activos / clientesEmpresa.length) * 100) : 0,
          total_reclamos: totalReclamos
        };
      });

      statsArray.sort((a, b) => b.total_clientes - a.total_clientes);
      setEmpresasStats(statsArray);
    } catch (error: unknown) {
      console.error("Error al cargar clientes:", error);
      const axiosError = error as { response?: { data?: { message?: string; error?: string }; status?: number }; message?: string };
      const errorMessage = axiosError?.response?.data?.message || 
                          axiosError?.response?.data?.error || 
                          axiosError?.message || 
                          "Error al cargar los clientes recurrentes";
      toast.error(errorMessage);
      setClientes([]);
      setEmpresasStats([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClientes();
  }, [refreshTrigger, loadClientes]);

  const toggleClienteStatus = useCallback(async (clienteId: number, isActive: boolean): Promise<boolean> => {
    try {
      const endpoint = isActive
        ? API_ROUTES.BLOCK_CLIENTE_RECURRENTE.replace('{cliente_id}', clienteId.toString())
        : API_ROUTES.UNBLOCK_CLIENTE_RECURRENTE.replace('{cliente_id}', clienteId.toString());
      
      const response = await apiClient.put<ApiResponse<ClienteRecurrente>>(endpoint);
      
      const message = (response.data as ApiResponse<ClienteRecurrente>)?.message || 
                     (isActive ? "Cliente desactivado correctamente" : "Cliente activado correctamente");
      toast.success(message);
      await loadClientes();
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
  }, [loadClientes]);

  const stats = useMemo(() => {
    const clientesActivos = clientes.filter(c => c.cliente_active).length;
    return {
      totalClientes: clientes.length,
      clientesActivos,
      clientesInactivos: clientes.length - clientesActivos,
      totalEmpresas: empresasStats.length,
    };
  }, [clientes, empresasStats]);

  return {
    clientes,
    empresasStats,
    isLoading,
    stats,
    loadClientes,
    toggleClienteStatus,
  };
}

