"use client";

import { useState, useEffect, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { config } from "@/lib/config";
import { CLIENT_API } from "@/lib/clientApi/config";

const apiClient = axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
});

export function GestionarEstadoDisponibilidad() {
    const [estado, setEstado] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSwitching, setIsSwitching] = useState(false);

    const fetchEstado = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get(CLIENT_API.ESTADO_PROFESIONAL);
            setEstado(response.data === true);
        } catch (error) {
            console.error("Error obteniendo estado:", error);
            // Silenciar los toasts de error inicial - el toggle se mostrará de todas formas
            setEstado(false); // Estado por defecto en caso de error
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleToggleEstado = async (newValue: boolean) => {
        try {
            setIsSwitching(true);

            const endpoint = newValue
                ? CLIENT_API.HABILITAR_FILA
                : CLIENT_API.DESHABILITAR_FILA;

            await apiClient.put(endpoint);

            setEstado(newValue);
            toast.success(newValue ? "Ahora estás habilitado para recibir reclamos" : "Ahora estás deshabilitado para recibir reclamos");
        } catch (error) {
            console.error("Error cambiando estado:", error);
            
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage = error.response.data?.error || error.response.data?.message;
                const status = error.response.status;

                if (status === 400) {
                    if (errorMessage?.includes('ya estaba habilitado')) {
                        toast.error("Ya estás habilitado para recibir trabajos.");
                    } else if (errorMessage?.includes('ya estaba deshabilitado')) {
                        toast.error("Ya estás deshabilitado para recibir trabajos.");
                    } else {
                        toast.error(errorMessage || "No se pudo cambiar el estado.");
                    }
                } else if (status === 500) {
                    toast.error("Error interno del servidor. Intenta nuevamente más tarde.");
                } else {
                    toast.error(errorMessage || "Error al cambiar el estado.");
                }
            } else {
                toast.error("Error de conexión. Verifica tu conexión a internet.");
            }
        } finally {
            setIsSwitching(false);
        }
    };

    useEffect(() => {
        fetchEstado();
    }, [fetchEstado]);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando estado...
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between gap-3"  title={estado ? "Vas a estar recibiendo actividades" : "No vas a estar recibiendo actividades"}>
            <div className="flex items-center gap-2" >
                <div
                    className={`h-2 w-2 rounded-full ${estado ? "bg-green-500" : "bg-red-500"}`}
                />
                <span className="text-sm font-medium">
                    {estado ? "Disponible" : "No Disponible"}
                </span>
            </div>
            <div className="flex items-center gap-2">
                {isSwitching && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                <Switch
                    checked={estado}
                    onCheckedChange={handleToggleEstado}
                    disabled={isSwitching}
                />
            </div>
        </div>
    );
}

