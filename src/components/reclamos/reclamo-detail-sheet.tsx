"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, User, MapPin, Clock, FileText, Link2 } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import axios from "axios";
import { config } from "@/lib/config";
import { CLIENT_API } from "@/lib/clientApi/config";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  company_name?: string;
  creador: string;
  created_at: string;
}

interface ReclamoDetailSheetProps {
  reclamo: ReclamoData | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: "owner" | "operador" | "profesional" | "superadmin";
  onUpdate?: () => void;
}

const ESTADOS = [
  { value: "ABIERTO", label: "Abierto" },
  { value: "EN PROCESO", label: "En Proceso" },
  { value: "EN PAUSA", label: "En Pausa" },
  { value: "CERRADO", label: "Cerrado" },
  { value: "CANCELADO", label: "Cancelado" },
  { value: "RE-ABIERTO", label: "Re-abierto" },
];

const ESTADO_COLORS: Record<string, string> = {
  "ABIERTO": "bg-blue-500",
  "EN PROCESO": "bg-yellow-500",
  "EN PAUSA": "bg-orange-500",
  "CERRADO": "bg-green-500",
  "CANCELADO": "bg-red-500",
  "RE-ABIERTO": "bg-purple-500",
};

const ESTADOS_REQUIRE_COMMENT = ["EN PAUSA", "CERRADO", "CANCELADO", "RE-ABIERTO"];

export function ReclamoDetailSheet({ reclamo, isOpen, onClose, userRole, onUpdate }: ReclamoDetailSheetProps) {
  const { refreshDashboard } = useDashboard();
  const [selectedEstado, setSelectedEstado] = useState<string>("");
  const [notaCierre, setNotaCierre] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEstadoChange = (value: string) => {
    setSelectedEstado(value);
    setNotaCierre("");
    setPresupuesto("");
  };

  const handleSubmit = async () => {
    if (!reclamo || !selectedEstado) return;

    if (ESTADOS_REQUIRE_COMMENT.includes(selectedEstado) && !notaCierre.trim()) {
      alert("Por favor ingresa una nota de cierre para esta acción");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const endpoint = userRole === "profesional"
        ? CLIENT_API.RECLAMO_GESTION_PROFESIONAL.replace("{id}", reclamo.reclamo_id.toString())
        : CLIENT_API.RECLAMO_GESTION_ADMIN.replace("{id}", reclamo.reclamo_id.toString());

      const payload: {
        reclamo_estado: string;
        reclamo_nota_cierre: string;
        reclamo_presupuesto?: number;
      } = {
        reclamo_estado: selectedEstado,
        reclamo_nota_cierre: notaCierre.trim(),
      };

      if (presupuesto.trim()) {
        payload.reclamo_presupuesto = parseFloat(presupuesto);
      }

      await apiClient.put(endpoint, payload);

      setSelectedEstado("");
      setNotaCierre("");
      setPresupuesto("");
      refreshDashboard();
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error("Error actualizando reclamo:", error);
      alert("Error al actualizar el reclamo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canChangeEstado = selectedEstado && selectedEstado !== reclamo?.reclamo_estado;
  const requiresComment = ESTADOS_REQUIRE_COMMENT.includes(selectedEstado);

  const getAvailableEstados = () => {
    if (!reclamo) return ESTADOS;

    const currentEstado = reclamo.reclamo_estado;

    return ESTADOS.filter((estado) => {
      if (estado.value === currentEstado) {
        return true;
      }

      if (currentEstado === "ABIERTO") {
        return estado.value !== "RE-ABIERTO";
      }

      if (currentEstado === "CERRADO" || currentEstado === "CANCELADO") {
        return estado.value !== "CERRADO" && estado.value !== "CANCELADO";
      }

      return true;
    });
  };

  if (!reclamo) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${ESTADO_COLORS[reclamo.reclamo_estado]}`}></span>
            {reclamo.reclamo_titulo}
            <span className="text-sm font-normal text-muted-foreground">#{reclamo.reclamo_id}</span>
          </SheetTitle>
          <SheetDescription>
            Detalles completos del reclamo
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Información principal */}
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Descripción</Label>
              <p className="mt-1 text-sm">{reclamo.reclamo_detalle}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Estado Actual</Label>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${ESTADO_COLORS[reclamo.reclamo_estado]}`}></span>
                  <span className="text-sm font-medium">{reclamo.reclamo_estado}</span>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Especialidad</Label>
                <p className="mt-1 text-sm">{reclamo.nombre_especialidad}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Fecha:</span>
                <span className="font-medium">
                  {format(parseISO(reclamo.agenda_fecha), "dd/MM/yyyy", { locale: es })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Horario:</span>
                <span className="font-medium">
                  {reclamo.agenda_hora_desde} - {reclamo.agenda_hora_hasta}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-medium">{reclamo.cliente_complete_name}</span>
              </div>

              {reclamo.cliente_direccion && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Dirección:</span>
                  <span className="font-medium">{reclamo.cliente_direccion}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Profesional:</span>
                <span className="font-medium">{reclamo.profesional}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Creado por:</span>
                <span className="font-medium">{reclamo.creador}</span>
              </div>

              {reclamo.reclamo_url && (
                <div className="flex items-center gap-2 text-sm">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">URL:</span>
                  <a 
                    href={reclamo.reclamo_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {reclamo.reclamo_url}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Gestión de estado */}
          {userRole !== "superadmin" && (
            <div className="border-t pt-6 space-y-4">
              <div>
                <Label htmlFor="estado">Cambiar Estado</Label>
                <Select value={selectedEstado || undefined} onValueChange={handleEstadoChange}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecciona un nuevo estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableEstados().map((estado) => (
                      <SelectItem 
                        key={estado.value} 
                        value={estado.value}
                        disabled={estado.value === reclamo.reclamo_estado}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${ESTADO_COLORS[estado.value]}`}></span>
                          {estado.label}
                          {estado.value === reclamo.reclamo_estado && " (Actual)"}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {requiresComment && canChangeEstado && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notaCierre">
                      Nota de Cierre <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="notaCierre"
                      placeholder="Ingresa una nota de cierre para esta acción..."
                      value={notaCierre}
                      onChange={(e) => setNotaCierre(e.target.value)}
                      rows={4}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="presupuesto">
                      Presupuesto (Opcional)
                    </Label>
                    <input
                      id="presupuesto"
                      type="number"
                      step="0.01"
                      placeholder="Ingresa el monto del presupuesto..."
                      value={presupuesto}
                      onChange={(e) => setPresupuesto(e.target.value)}
                      className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              {canChangeEstado && (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || (requiresComment && !notaCierre.trim())}
                  className="w-full"
                >
                  {isSubmitting ? "Procesando..." : "Confirmar Acción"}
                </Button>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

