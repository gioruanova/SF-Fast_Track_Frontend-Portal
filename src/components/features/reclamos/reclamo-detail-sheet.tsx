"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Calendar, User, MapPin, Clock, FileText, Link2, Wrench, Mail, Phone, Bell } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { toast } from "sonner";
import axios from "axios";
import { config } from "@/lib/config";
import { API_ROUTES } from "@/lib/api_routes";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";

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
  cliente_lat?: number;
  cliente_lng?: number;
  reclamo_url?: string;
  cliente_email?: string;
  cliente_phone?: string;
  profesional: string;
  agenda_fecha: string;
  agenda_hora_desde: string;
  agenda_hora_hasta: string;
  nombre_especialidad: string;
  company_name?: string;
  creador: string;
  created_at: string;
  reclamo_nota_cierre?: string;
  reclamo_presupuesto?: number;
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
  const { companyConfig } = useAuth();
  const [selectedEstado, setSelectedEstado] = useState<string>("");
  const [notaCierre, setNotaCierre] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const handleEstadoChange = (value: string) => {
    setSelectedEstado(value);
    setNotaCierre("");
    setPresupuesto("");
  };

  const handleSubmit = async () => {
    if (!reclamo || !selectedEstado) return;

    if (ESTADOS_REQUIRE_COMMENT.includes(selectedEstado) && !notaCierre.trim()) {
      toast.error("Por favor ingresa una nota de actualización del estado para esta acción");
      return;
    }

    try {
      setIsSubmitting(true);

      const endpoint = API_ROUTES.ACTUALIZAR_RECLAMO.replace("{id}", reclamo.reclamo_id.toString());

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
      toast.success(`Reclamo actualizado a "${selectedEstado}" correctamente`);
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error("Error actualizando reclamo:", error);

      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message;
        const status = error.response.status;

        if (status === 400) {
          if (errorMessage?.includes('nota de cierre') || errorMessage?.includes('nota es necesaria')) {
            toast.error("La nota de actualización del estado es requerida para este estado.");
          } else if (errorMessage?.includes('ya esta cerrado')) {
            toast.error("Este reclamo ya está cerrado y no puede ser modificado.");
          } else {
            toast.error(errorMessage || "Datos inválidos. Verifica la información.");
          }
        } else if (status === 404) {
          toast.error("El reclamo no fue encontrado o no tienes acceso a él.");
        } else if (status === 500) {
          toast.error("Error interno del servidor. Intenta nuevamente más tarde.");
        } else {
          toast.error(errorMessage || "Error al actualizar el reclamo.");
        }
      } else {
        toast.error("Error de conexión. Verifica tu conexión a internet.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReminder = async () => {
    if (!reclamo) return;

    try {
      setIsSendingReminder(true);

      const endpoint = API_ROUTES.ENVIAR_RECORDATORIO_RECLAMO.replace("{reclamo_id}", reclamo.reclamo_id.toString());

      await apiClient.put(endpoint);

      toast.success("Recordatorio enviado correctamente");
      refreshDashboard();
    } catch (error) {
      console.error("Error enviando recordatorio:", error);

      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message;
        const status = error.response.status;

        if (status === 400) {
          toast.error(errorMessage || "No se pudo enviar el recordatorio. Verifica los datos.");
        } else if (status === 404) {
          toast.error("El reclamo no fue encontrado o no tienes acceso a él.");
        } else if (status === 500) {
          toast.error("Error interno del servidor. Intenta nuevamente más tarde.");
        } else {
          toast.error(errorMessage || "Error al enviar el recordatorio.");
        }
      } else {
        toast.error("Error de conexión. Verifica tu conexión a internet.");
      }
    } finally {
      setIsSendingReminder(false);
    }
  };

  const canChangeEstado = selectedEstado && selectedEstado !== reclamo?.reclamo_estado;
  const requiresComment = ESTADOS_REQUIRE_COMMENT.includes(selectedEstado);

  const isReclamoClosed = reclamo && (reclamo.reclamo_estado === "CERRADO" || reclamo.reclamo_estado === "CANCELADO");
  const canProfesionalEdit = userRole === "profesional" ? !isReclamoClosed : true;

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
      <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${ESTADO_COLORS[reclamo.reclamo_estado]}`}></span>
            {reclamo.reclamo_titulo}
            <span className="text-sm font-normal text-muted-foreground">#{reclamo.reclamo_id}</span>
          </SheetTitle>

        </SheetHeader>
        <Separator />

        <div className="mt-1 space-y-6">
          <div className="flex items-center gap-2 text-sm">

            <div className="flex items-start flex-col gap-2 text-sm mb-0">
              <div className="flex items-center gap-2 text-sm flex-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Creado por:</span>
              </div>
              <span className="font-medium">{reclamo.creador}</span>
            </div>

            <div className="flex flex-col items-center gap-2 text-sm flex-1">
              <div className="flex items-center gap-2 text-sm">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{companyConfig?.sing_heading_especialidad || "Especialidad"}:</span>
              </div>
              <p className="font-medium">{reclamo.nombre_especialidad}</p>
            </div>

          </div>

          <div className="flex items-start flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{companyConfig?.sing_heading_profesional || "Profesional"} a cargo:</span>
            </div>
            <span className="font-medium">{reclamo.profesional}</span>
          </div>
          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{companyConfig?.sing_heading_solicitante || "Solicitante"}:</span>
                <span className="font-medium">{reclamo.cliente_complete_name}</span>
              </div>

<div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Fecha agendada:</span>
                <span className="font-medium">
                  {format(parseISO(reclamo.agenda_fecha), "dd/MM/yyyy", { locale: es })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Horario agendado:</span>
                <span className="font-medium">
                  {reclamo.agenda_hora_desde} - {reclamo.agenda_hora_hasta}
                </span>
              </div>

              <Separator />
              {(userRole === "owner" || userRole === "operador") && companyConfig?.company?.reminder_manual == 1 && (reclamo.reclamo_estado !== "CERRADO" && reclamo.reclamo_estado !== "CANCELADO") && (
                <Button
                  onClick={handleSendReminder}
                  disabled={isSendingReminder}
                  className=""
                >
                  <Bell className="w-4" />
                  <span>{isSendingReminder ? "Enviando..." : "Enviar Recordatorio"}</span>
                </Button>
              )}

{reclamo.cliente_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <a href={`mailto:${reclamo.cliente_email}`} className="font-medium text-primary hover:underline">{reclamo.cliente_email}</a>
                </div>
              )}

              {reclamo.cliente_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Teléfono:</span>
                  <a href={`tel:${reclamo.cliente_phone}`} className="font-medium text-primary hover:underline">{reclamo.cliente_phone}</a>
                </div>
              )}

{reclamo.cliente_direccion && companyConfig?.requiere_domicilio === 1 ? (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-start flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Dirección:</span>
                      </div>
                      <span className="font-medium">{reclamo.cliente_direccion}</span>
                    </div>
                  </div>
                </>
              ) : (
                null
              )}

              {reclamo.reclamo_url && (
                <div className="flex items-center gap-2 text-sm">
                  <Link2 className="w-4 text-muted-foreground" />
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
          <Separator />

          <div>
            <Label className="text-muted-foreground">Descripción:</Label>

{showMore && (
              <p className="mt-1 text-sm text-justify">{reclamo.reclamo_detalle}</p>
            )}
            {!showMore && (
              <p className="mt-1 text-sm text-justify">{reclamo.reclamo_detalle.length > 400 ? reclamo.reclamo_detalle.substring(0, 400) + "..." : reclamo.reclamo_detalle}</p>
            )}

            {reclamo.reclamo_detalle.length > 400 && (
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setShowMore(!showMore)}>{showMore ? "Ver menos" : "Ver mas"}</Button>
            )}

          </div>

<Separator />

          {reclamo.reclamo_nota_cierre && (reclamo.reclamo_nota_cierre || reclamo.reclamo_presupuesto) && (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Información de Cierre</h3>
                <div className="space-y-3">
                  {reclamo.reclamo_nota_cierre && (
                    <div>
                      <Label className="text-muted-foreground">Nota de Actualización del Estado</Label>
                      <div className="mt-2 rounded-md border bg-muted/50 p-3 text-sm">
                        {reclamo.reclamo_nota_cierre}
                      </div>
                    </div>
                  )}

                  {reclamo.reclamo_presupuesto && (
                    <div>
                      <Label className="text-muted-foreground">Presupuesto</Label>
                      <div className="mt-2 rounded-md border bg-muted/50 p-3 text-sm font-medium">
                        ${reclamo.reclamo_presupuesto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </>
          )}

          <div className="space-y-2">
            <Label className="text-muted-foreground">Estado Actual</Label>
            <div className="mt-1 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${ESTADO_COLORS[reclamo.reclamo_estado]}`}></span>
              <span className="text-sm font-medium">{reclamo.reclamo_estado}</span>
            </div>
          </div>

          {userRole !== "superadmin" && (
            <div className="pt-0 space-y-4">
              {!canProfesionalEdit && userRole === "profesional" && (
                <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                  <p className="font-medium">Este item se encuentra {reclamo.reclamo_estado.toLowerCase()} y no puede ser modificado.</p>
                </div>
              )}

{canProfesionalEdit && (
                <>

                  <div>
                    <Label htmlFor="estado">Cambiar Estado</Label>
                    <Select value={selectedEstado || undefined} onValueChange={handleEstadoChange}>
                      <SelectTrigger className="mt-2 cursor-pointer">
                        <SelectValue placeholder="Selecciona un nuevo estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableEstados().map((estado) => (
                          <SelectItem
                            key={estado.value}
                            value={estado.value}
                            disabled={estado.value === reclamo.reclamo_estado}
                            className="cursor-pointer"
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
                          Nota de Actualización del Estado <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="notaCierre"
                          placeholder="Ingresa una nota de actualización del estado para esta acción..."
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
                      variant="default"
                    >
                      {isSubmitting ? "Procesando..." : "Confirmar Acción"}
                    </Button>
                  )}

</>

              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

