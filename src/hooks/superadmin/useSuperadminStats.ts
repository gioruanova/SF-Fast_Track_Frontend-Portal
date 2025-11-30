"use client";

import { useState, useEffect, useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { API_ROUTES } from "@/lib/api_routes";
import { apiClient } from "@/lib/apiClient";
import { Especialidad } from "@/types/especialidades";
import { ClienteRecurrente, ApiResponse } from "@/types/clientes";
import {
  SuperadminUserData,
  SuperadminCompanyData,
  SuperadminReclamoData,
} from "@/types/superadmin";
import { processCompanyStats } from "@/utils/superadmin/processCompanyStats";

export function useSuperadminStats() {
  const { refreshTrigger } = useDashboard();
  const [users, setUsers] = useState<SuperadminUserData[]>([]);
  const [companies, setCompanies] = useState<SuperadminCompanyData[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [reclamos, setReclamos] = useState<SuperadminReclamoData[]>([]);
  const [clientes, setClientes] = useState<ClienteRecurrente[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [usersRes, companiesRes, especialidadesRes, reclamosRes, clientesRes] = await Promise.allSettled([
          apiClient.get(API_ROUTES.GET_USERS),
          apiClient.get(API_ROUTES.GET_COMPANIES),
          apiClient.get(API_ROUTES.GET_ESPECIALIDADES),
          apiClient.get(API_ROUTES.GET_RECLAMOS),
          apiClient.get<ApiResponse<ClienteRecurrente[]> | ClienteRecurrente[]>(API_ROUTES.GET_CLIENTES_RECURRENTES),
        ]);

        if (usersRes.status === 'fulfilled') {
          setUsers(usersRes.value.data);
        } else {
          console.error("Error obteniendo usuarios:", usersRes.reason);
        }

        if (companiesRes.status === 'fulfilled') {
          setCompanies(companiesRes.value.data);
        } else {
          console.error("Error obteniendo companies:", companiesRes.reason);
        }

        if (especialidadesRes.status === 'fulfilled') {
          setEspecialidades(especialidadesRes.value.data);
        } else {
          console.error("Error obteniendo especialidades:", especialidadesRes.reason);
        }

        if (reclamosRes.status === 'fulfilled') {
          setReclamos(reclamosRes.value.data);
        } else {
          console.error("Error obteniendo reclamos:", reclamosRes.reason);
        }
        
        if (clientesRes.status === 'fulfilled') {
          const clientesData = Array.isArray(clientesRes.value.data)
            ? clientesRes.value.data
            : (clientesRes.value.data as ApiResponse<ClienteRecurrente[]>)?.data || [];
          setClientes(clientesData);
        } else {
          console.error("Error obteniendo clientes:", clientesRes.reason);
          setClientes([]);
        }
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  const companyStats = useMemo(
    () => processCompanyStats(companies, users, especialidades, reclamos, clientes),
    [companies, users, especialidades, reclamos, clientes]
  );

  return {
    users,
    companies,
    especialidades,
    reclamos,
    clientes,
    companyStats,
    isLoading,
  };
}

