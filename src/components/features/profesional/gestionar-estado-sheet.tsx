"use client";

import { useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { config } from "@/lib/config";
import { CLIENT_API } from "@/lib/clientApi/config";
import { useAuth } from "@/context/AuthContext";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const apiClient = axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
});

export function GestionarEstadoSheet() {
    const { companyConfig } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [estado, setEstado] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);


    const fetchEstado = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get(CLIENT_API.ESTADO_PROFESIONAL);
            setEstado(response.data === true);
        } catch (error) {
            console.error("Error obteniendo estado:", error);
            toast.error("Error al obtener el estado");
        } finally {
            setIsLoading(false);
        }
    };

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
            toast.error("Error al cambiar el estado");
        } finally {
            setIsSwitching(false);
        }
    };

    const estadoString = () => {
        if (estado) {
            return `Estas recibiendo ${companyConfig?.plu_heading_reclamos || "reclamos"}`;
        } else {
            return `No estas recibiendo ${companyConfig?.plu_heading_reclamos || "reclamos"}`;
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchEstado();
        }
    }, [isOpen]);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SidebarGroup>
                <SidebarGroupLabel>Estado</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SheetTrigger asChild>
                            <SidebarMenuButton tooltip="Gestionar Estado" className="cursor-pointer">
                                <Clock />
                                <span>Gestionar Estado</span>
                            </SidebarMenuButton>
                        </SheetTrigger>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Gestionar Estado</SheetTitle>

                </SheetHeader>

                <div className="mt-1 space-y-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">Estado Actual</h3>
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`h-3 w-3 rounded-full ${estado ? "bg-green-500" : "bg-red-500"
                                            }`}
                                    />
                                    <span className={`font-semibold ${estado ? "text-green-600" : "text-red-600"
                                        }`}>
                                        {estadoString()}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">Cambiar Estado</h3>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium">
                                            {estado ? "Deshabilitar" : "Habilitar"} recepción
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {estado
                                                ? `Dejaras a recibir ${companyConfig?.plu_heading_reclamos}`
                                                : `Comenzarás a recibir ${companyConfig?.plu_heading_reclamos}`}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={estado}
                                        onCheckedChange={handleToggleEstado}
                                        disabled={isSwitching}
                                    />
                                </div>
                            </div>

                            {isSwitching && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Actualizando estado...
                                </div>
                            )}
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

