"use client";

import React, { useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Field, FieldContent, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { useAuth } from "@/context/AuthContext";
import { OwnerCompanyContactSheet } from "@/components/features/empresas/owner-company-contact-sheet";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { config } from "@/lib/config";
import { CLIENT_API } from "@/lib/clientApi/config";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function OwnerCompanySettingsCard() {
  const { companyConfig, refreshCompanyConfig } = useAuth();
  const [openContact, setOpenContact] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [openActivities, setOpenActivities] = useState(false);
  const [isUpdatingToggle, setIsUpdatingToggle] = useState<null | keyof typeof togglesState>(null);
  const [openLabels, setOpenLabels] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [isSavingField, setIsSavingField] = useState(false);

const values = useMemo(() => ({
    company_phone: companyConfig?.company?.company_phone || "",
    company_email: companyConfig?.company?.company_email || "",
    company_whatsapp: companyConfig?.company?.company_whatsapp || "",
    company_telegram: companyConfig?.company?.company_telegram || "",
  }), [companyConfig]);

  const companyName = companyConfig?.company?.company_nombre || "Empresa";
  const companyStatus = companyConfig?.company?.company_estado === 1 ? "ACTIVA" : "INACTIVA";
  const apiClient = useMemo(() => axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  }), []);

  const togglesState = useMemo(() => ({
    requiere_domicilio: companyConfig?.requiere_domicilio === 1,
    requiere_url: companyConfig?.requiere_url === 1,
    requiere_fecha_final: companyConfig?.requiere_fecha_final === 1,
  }), [companyConfig]);

  const handleToggle = async (key: keyof typeof togglesState, next: boolean) => {
    if (isUpdatingToggle !== null) return;
    const current = togglesState[key];
    if (current === next) return;

try {
      setIsUpdatingToggle(key);
      const payload: Record<string, boolean> = { [key]: next };
      await apiClient.put(CLIENT_API.UPDATE_COMPANY_CONFIG, payload);
      toast.success("Configuración actualizada");
      await refreshCompanyConfig();

    } catch {
      toast.error("No se pudo actualizar. Intente nuevamente");
    } finally {
      setIsUpdatingToggle(null);
    }
  };

return (
    <React.Fragment>
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-2xl">Configuración principal</CardTitle>
          <CardDescription>Datos de la organización y contacto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="pb-4 mb-5">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-xl font-semibold truncate">{companyName}</p>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${companyConfig?.company?.company_estado === 1
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                    >
                      {companyStatus}
                    </Badge>
                  </div>
                  {companyConfig?.company?.company_estado === 0 ? <span className="text-sm text-red-500">Su suscripcion se encuentra cancelada. Por favor contacte al administrador</span> : null}
                  <p className="text-muted-foreground text-sm truncate">
                    ID: {companyConfig?.company?.company_unique_id || "-"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    Límite de {companyConfig?.plu_heading_operador || "operadores"}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/80 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>Máximo de operadores habilitados en la empresa.</TooltipContent>
                    </Tooltip>
                  </p>
                  <p className="text-base font-medium">{companyConfig?.company?.limite_operadores ?? "-"}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    Límite de {companyConfig?.plu_heading_profesional || "profesionales"}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/80 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>Máximo de profesionales que pueden trabajar reclamos.</TooltipContent>
                    </Tooltip>
                  </p>
                  <p className="text-base font-medium">{companyConfig?.company?.limite_profesionales ?? "-"}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    Límite de {companyConfig?.plu_heading_especialidad || "especialidades"}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/80 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>Cantidad máxima de especialidades que puede crear la empresa.</TooltipContent>
                    </Tooltip>
                  </p>
                  <p className="text-base font-medium">{companyConfig?.company?.limite_especialidades ?? "-"}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    Servicio de recordatorios
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/80 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>Si tu plan cuenta con esta funcionalidad, vas a poder enviar recordatorios de {companyConfig?.plu_heading_reclamos || "reclamos"}</TooltipContent>
                    </Tooltip>
                  </p>
                  {companyConfig?.company?.reminder_manual == 1 ? <Badge variant="secondary" className="text-xs bg-green-700">Activo</Badge> : <Badge variant="secondary" className="text-xs">Inactivo</Badge>}
                </div>
              </div>
              <span className="text-sm text-muted-foreground italic">Si necesitas ampliar estos limites, no dudes en contactar a tu administrador para obtener planes adicionales y actualizaciones</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-5 pb-5">
            <div>
              <CardTitle className="text-2xl">Información de contacto</CardTitle>
              <CardDescription>Estos datos se utilizan para contactar a la empresa y para el envio de notificaciones.</CardDescription>
            </div>
            <Collapsible open={openContact} onOpenChange={setOpenContact}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">{openContact ? "Ocultar" : "Mostrar"}</Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
          <Separator />

          <Collapsible open={openContact}>
            <CollapsibleContent>
              <div className="pt-2 pb-5">
                <FieldSet className="pt-0">
                  <FieldGroup>
                    <Field className="gap-0.5">
                      <FieldLabel>Email de la empresa</FieldLabel>
                      <FieldContent>
                        <p className="text-sm">{values.company_email || "-"}</p>
                      </FieldContent>
                    </Field>
                    <Field className="gap-0.5">
                      <FieldLabel>Teléfono</FieldLabel>
                      <FieldContent>
                        <p className="text-sm">{values.company_phone || "-"}</p>
                      </FieldContent>
                    </Field>
                    <Field className="gap-0.5">
                      <FieldLabel>Whatsapp</FieldLabel>
                      <FieldContent>
                        <p className="text-sm">{values.company_whatsapp || "-"}</p>
                      </FieldContent>
                    </Field>
                    <Field className="gap-0.5">
                      <FieldLabel>Telegram</FieldLabel>
                      <FieldContent>
                        <p className="text-sm">{values.company_telegram || "-"}</p>
                      </FieldContent>
                    </Field>
                  </FieldGroup>
                  <div className="flex justify-end pt-0">
                    <Button onClick={() => setIsEditOpen(true)}>Editar Datos</Button>
                  </div>
                </FieldSet>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          <div className="flex items-center justify-between mt-5 pb-5">
            <div>
              <CardTitle className="text-2xl">Gestión de actividades</CardTitle>
              <CardDescription>Esta configuracion inicial define algunas caracteristicas basicas de la gestion de actividades/reclamos.</CardDescription>
            </div>
            <Collapsible open={openActivities} onOpenChange={setOpenActivities}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">{openActivities ? "Ocultar" : "Mostrar"}</Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
          <Separator />

          <Collapsible open={openActivities}>
            <CollapsibleContent>
              <div className="pt-2 pb-5">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                    <div>
                      <p className="text-sm font-medium">Requiere domicilio</p>
                      <p className="text-xs text-muted-foreground">
                        En caso de estar encendido, el sistema va a exigir un domicilio fisico  al momento de generar cualquier {companyConfig?.sing_heading_reclamos?.toLowerCase() || "reclamo"} y se compartira con tus {companyConfig?.plu_heading_profesional?.toLowerCase() || "profesionales"} que se asignen a dicha actividad.</p>
                    </div>
                    <Switch
                      checked={togglesState.requiere_domicilio}
                      onCheckedChange={(checked) => handleToggle('requiere_domicilio', checked)}
                      disabled={isUpdatingToggle === 'requiere_domicilio'}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                    <div>
                      <p className="text-sm font-medium">Requiere URL</p>
                      <p className="text-xs text-muted-foreground">En caso de estar encendido,el sistema va a exigir que para cada  {companyConfig?.sing_heading_reclamos?.toLowerCase() || "reclamo"} se agregue una URL asociada para esa actividad.</p>
                    </div>
                    <Switch
                      checked={togglesState.requiere_url}
                      onCheckedChange={(checked) => handleToggle('requiere_url', checked)}
                      disabled={isUpdatingToggle === 'requiere_url'}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                    <div>
                      <p className="text-sm font-medium">Requiere hora de finalización</p>
                      <p className="text-xs text-muted-foreground">En caso de estar encendida, cada {companyConfig?.sing_heading_reclamos?.toLowerCase() || "reclamo"} va a requerir un horario de finalizacion exacto.</p>
                      <p className="text-xs text-muted-foreground">
                      <strong>Importante: </strong>de no estar encendida esta opcion, el sistema bloqueara la agenda para todo ese dia del {companyConfig?.sing_heading_profesional?.toLowerCase() || "reclamo"} que se selecciono.
                      </p>

</div>
                    <Switch
                      checked={togglesState.requiere_fecha_final}
                      onCheckedChange={(checked) => handleToggle('requiere_fecha_final', checked)}
                      disabled={isUpdatingToggle === 'requiere_fecha_final'}
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          <div className="flex items-center justify-between mt-5 pb-5">
            <div>
              <CardTitle className="text-2xl">Personalización de etiquetas y mensajes</CardTitle>
              <CardDescription>Define cómo se nombran los roles y textos de notificaciones.</CardDescription>
            </div>
            <Collapsible open={openLabels} onOpenChange={setOpenLabels}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">{openLabels ? "Ocultar" : "Mostrar"}</Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
          <Separator />

          <Collapsible open={openLabels}>
            <CollapsibleContent>
              <div className="pt-2 pb-5">
                <CardDescription className="pb-4">Titulos personalizados</CardDescription>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      group: "Propietario",
                      sing: { key: "sing_heading_owner", label: "Singular" },
                      plu: { key: "plu_heading_owner", label: "Plural" }
                    },
                    {
                      group: "Profesional",
                      sing: { key: "sing_heading_profesional", label: "Singular" },
                      plu: { key: "plu_heading_profesional", label: "Plural" }
                    },
                    {
                      group: "Operador",
                      sing: { key: "sing_heading_operador", label: "Singular" },
                      plu: { key: "plu_heading_operador", label: "Plural" }
                    },
                    {
                      group: "Solicitante",
                      sing: { key: "sing_heading_solicitante", label: "Singular" },
                      plu: { key: "plu_heading_solicitante", label: "Plural" }
                    },
                    {
                      group: "Reclamos",
                      sing: { key: "sing_heading_reclamos", label: "Singular" },
                      plu: { key: "plu_heading_reclamos", label: "Plural" }
                    },
                    {
                      group: "Especialidad/Actividad",
                      sing: { key: "sing_heading_especialidad", label: "Singular" },
                      plu: { key: "plu_heading_especialidad", label: "Plural" }
                    },
                  ].map((item, index) => {
                    const singValue = companyConfig?.[item.sing.key as keyof typeof companyConfig] ?? "";
                    const pluValue = companyConfig?.[item.plu.key as keyof typeof companyConfig] ?? "";
                    return (
                      <div key={`${item.group}-${index}`} className="rounded-lg border bg-muted/30 p-4">
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-foreground">Etiquetas {item.group}</h4>
                          <p className="text-xs text-muted-foreground">Aca podes editar cómo se visualizarán los rótulos para la categorías &quot;{item.group}&quot;</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm flex flex-col">
                              <span className="text-base font-medium">{String(singValue) || "-"}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingKey(item.sing.key);
                                setEditingValue(String(singValue));
                              }}
                            >
                              Editar
                            </Button>
                          </div>
                          <Separator />

                          <div className="flex items-center justify-between">
                            <div className="text-sm flex flex-col">
                              <div className="flex gap-2 flex-col items-start">
                                <span>Ejemplo:</span>
                                <span>&quot;Ejemplo de <span className="font-medium underline text-primary">{String(singValue) || "-"}</span> a visualizar&quot;</span>
                                <span>&quot;En esta seccion podes ver el listado de tus <span className="font-medium underline text-primary">{String(pluValue) || "-"}</span>&quot;</span>

                              </div>

                            </div>

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <CardDescription className="pt-4">Notificaciones personalizadas</CardDescription>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {([
                    { key: "string_inicio_reclamo_profesional", label: "Mensaje inicio: Profesional", desc: "Mensaje enviado al profesional al asignar una actividad." },
                    { key: "string_actualizacion_reclamo_profesional", label: "Mensaje actualización: Profesional", desc: "Mensaje de actualización para el profesional." },
                    ...(companyConfig?.company?.reminder_manual == 1 ? [{
                      key: "string_recordatorio_reclamo_profesional",
                      label: "Mensaje recordatorio: Profesional",
                      desc: "Mensaje de recordatorio para el profesional."
                    }] : []),
                  ] as Array<{ key: string; label: string; desc: string }>).map((item) => {
                    const value = companyConfig?.[item.key as keyof typeof companyConfig] ?? "";
                    return (
                      <div key={item.key} className="rounded-lg border bg-muted/30 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" title={item.label}>{item.label}</p>
                            <p className="text-sm mt-1 break-words">{String(value) || "-"}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => { setEditingKey(item.key); setEditingValue(String(value)); }}>
                            Editar
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <OwnerCompanyContactSheet
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            values={values}
            onSaved={async () => {
              await refreshCompanyConfig();
            }}
          />

          <Dialog open={!!editingKey} onOpenChange={() => { if (!isSavingField) { setEditingKey(null); } }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar valor</DialogTitle>
                <DialogDescription>Actualiza el contenido. No se permite dejarlo vacío.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {(() => {
                  const long = [
                    "string_inicio_reclamo_solicitante",
                    "string_recordatorio_reclamo_solicitante",
                    "string_cierre_reclamo_solicitante",
                    "string_inicio_reclamo_profesional",
                    "string_recordatorio_reclamo_profesional",
                    "string_cierre_reclamo_profesional",
                  ].includes(editingKey || "");
                  if (long) {
                    return (
                      <Textarea
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        rows={6}
                        placeholder="Ingrese el texto"
                      />
                    );
                  }
                  return (
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      placeholder="Ingrese el valor"
                    />
                  );
                })()}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditingKey(null)} disabled={isSavingField}>Cancelar</Button>
                <Button
                  onClick={async () => {
                    if (!editingKey) return;
                    const trimmed = editingValue.trim();
                    if (!trimmed) { toast.error("El valor no puede estar vacío"); return; }
                    try {
                      setIsSavingField(true);
                      const payload = { [editingKey]: trimmed };
                      await apiClient.put(CLIENT_API.UPDATE_COMPANY_CONFIG, payload);
                      await refreshCompanyConfig();
                      toast.success("Actualizado correctamente");
                      setEditingKey(null);
                    } catch (e) {
                      console.error('Error al guardar:', e);
                      toast.error("No se pudo actualizar. Intente nuevamente");
                    } finally {
                      setIsSavingField(false);
                    }
                  }}
                  disabled={isSavingField}
                >
                  Guardar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </React.Fragment>
  );
}

