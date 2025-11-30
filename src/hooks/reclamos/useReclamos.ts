"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { API_ROUTES } from "@/lib/api_routes";
import { apiClient } from "@/lib/apiClient";

interface ReclamoData {
  reclamo_id: number;
  reclamo_titulo: string;
  reclamo_detalle: string;
  reclamo_estado: string;
  cliente_complete_name: string;
  cliente_direccion?: string;
  reclamo_url?: string;
  profesional: string;
  agenda_fecha: string;
  agenda_hora_desde: string;
  agenda_hora_hasta: string;
  nombre_especialidad: string;
  creador: string;
  created_at: string;
  reclamo_nota_cierre?: string;
  reclamo_presupuesto?: number;
}

let cachedReclamos: ReclamoData[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30000;

export function useReclamos() {
  const { refreshTrigger } = useDashboard();
  const [reclamos, setReclamos] = useState<ReclamoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReclamos = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const isCacheValid = cachedReclamos !== null && (now - cacheTimestamp) < CACHE_DURATION;

    if (isCacheValid && !forceRefresh && cachedReclamos !== null) {
      setReclamos(cachedReclamos);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get(API_ROUTES.GET_RECLAMOS);
      cachedReclamos = response.data;
      cacheTimestamp = now;
      setReclamos(response.data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error al obtener reclamos");
      setError(error);
      console.error("Error obteniendo reclamos:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReclamos();
  }, [refreshTrigger, fetchReclamos]);

  const activeReclamos = useMemo(() => {
    return reclamos.filter(r => r.reclamo_estado !== "CERRADO" && r.reclamo_estado !== "CANCELADO");
  }, [reclamos]);

  const finalizedReclamos = useMemo(() => {
    return reclamos.filter(r => r.reclamo_estado === "CERRADO" || r.reclamo_estado === "CANCELADO");
  }, [reclamos]);

  const refresh = useCallback(() => {
    fetchReclamos(true);
  }, [fetchReclamos]);

  return {
    reclamos,
    activeReclamos,
    finalizedReclamos,
    isLoading,
    error,
    refresh,
  };
}

