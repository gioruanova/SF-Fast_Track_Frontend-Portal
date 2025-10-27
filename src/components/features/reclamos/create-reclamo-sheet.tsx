"use client";

import { useCallback, useMemo, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useCreateReclamo } from "@/hooks/useCreateReclamo";
import { useCreateReclamoSubmit } from "@/hooks/useCreateReclamoSubmit";
import { toast } from "sonner";

interface CreateReclamoSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateReclamoSheet({ isOpen, onClose }: CreateReclamoSheetProps) {
  const {
    formData,
    updateField,
    handleClienteChange,
    clientesOptions,
    loadingClientes,
    loadingEspecialidades,
    especialidadesOptions,
    loadingAsignaciones,
    profesionalesDisponibles,
    companyConfig,
    isHorarioDisponible,
    getHorariosBloqueados,
    resetForm,
    staticDataRef,
  } = useCreateReclamo(isOpen);

  const { createReclamo, isSubmitting, error, clearError } = useCreateReclamoSubmit();

  const selectedCliente = clientesOptions.find(c => c.cliente_id === formData.cliente_id);

  const handleClose = () => {
    resetForm();
    clearError();
    onClose();
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.cliente_id) {
      errors.push(`Seleccione un ${companyConfig?.sing_heading_solicitante?.toLowerCase() || "cliente"}`);
    }
    if (!formData.especialidad_id) {
      errors.push(`Seleccione una ${companyConfig?.sing_heading_especialidad?.toLowerCase() || "especialidad"}`);
    }
    if (!formData.profesional_id) {
      errors.push(`Seleccione un ${companyConfig?.sing_heading_profesional?.toLowerCase() || "profesional"}`);
    }
    if (!formData.agenda_fecha) {
      errors.push("Seleccione una fecha");
    }
    if (!formData.agenda_hora_desde) {
      errors.push("Seleccione una hora de inicio");
    }
    if (companyConfig?.requiere_fecha_final === 1 && !formData.agenda_hora_hasta) {
      errors.push("Seleccione una hora de fin");
    }
    if (companyConfig?.requiere_url === 1 && !formData.cliente_url?.trim()) {
      errors.push("La URL es requerida");
    }
    if (!formDataRef.current.reclamo_titulo?.trim()) {
      errors.push("El título es requerido");
    } else if (formDataRef.current.reclamo_titulo.trim().length < 3) {
      errors.push("El título debe tener al menos 3 caracteres");
    }
    if (!formDataRef.current.reclamo_detalle?.trim()) {
      errors.push("La descripción es requerida");
    } else if (formDataRef.current.reclamo_detalle.trim().length < 10) {
      errors.push("La descripción debe tener al menos 10 caracteres");
    }

    // Validar horarios si están seleccionados
    if (formData.agenda_fecha && formData.agenda_hora_desde && formData.agenda_hora_hasta) {
      if (!isHorarioDisponible(formData.agenda_fecha, formData.agenda_hora_desde, formData.agenda_hora_hasta)) {
        errors.push("El horario seleccionado está bloqueado para el profesional");
      }
    }

    return errors;
  };

  const handleSubmit = useCallback(async () => {
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      toast.error(`Por favor corrija los siguientes errores: ${validationErrors.join(", ")}`);
      return;
    }

    try {
      const result = await createReclamo({
        reclamo_titulo: formDataRef.current.reclamo_titulo,
        reclamo_detalle: formDataRef.current.reclamo_detalle,
        especialidad_id: formData.especialidad_id!,
        profesional_id: formData.profesional_id!,
        cliente_id: formData.cliente_id!,
        agenda_fecha: formData.agenda_fecha!,
        agenda_hora_desde: formData.agenda_hora_desde!,
        reclamo_url: formData.cliente_url,
        agenda_hora_hasta: formData.agenda_hora_hasta,
      });

      if (result.success) {
        toast.success(`¡Reclamo creado exitosamente! El ${companyConfig?.sing_heading_reclamos?.toLowerCase() || "reclamo"} ha sido creado correctamente`);
        handleClose();
      } else {
        toast.error(`Error al crear el reclamo: ${result.message}`);
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      toast.error("Error inesperado: Ocurrió un error inesperado al crear el reclamo");
    }
  }, [createReclamo, companyConfig, handleClose, formData.agenda_fecha, formData.agenda_hora_desde, formData.agenda_hora_hasta, formData.cliente_id, formData.cliente_url, formData.especialidad_id, formData.profesional_id, validateForm]);


  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const handleTituloChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // NO actualizar el estado, solo el ref para evitar re-renders
    formDataRef.current.reclamo_titulo = e.target.value;
  }, []);

  const handleDetalleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // NO actualizar el estado, solo el ref para evitar re-renders
    formDataRef.current.reclamo_detalle = e.target.value;
  }, []);

  const tituloPlaceholder = useMemo(() =>
    `Detalle rapido de ${companyConfig?.sing_heading_reclamos || "Reclamo"}`,
    [companyConfig?.sing_heading_reclamos]
  );

  const detallePlaceholder = useMemo(() =>
    `Detalle elaborado de ${companyConfig?.sing_heading_reclamos || "Reclamo"}`,
    [companyConfig?.sing_heading_reclamos]
  );

  const generateTimeOptions = useCallback(() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (const minute of [0, 30]) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
        options.push(time);
      }
    }
    return options;
  }, []);

  // Convertir hora HH:MM:SS a minutos
  const timeToMinutes = useCallback((time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }, []);

  // Verificar si un horario está bloqueado
  const isTimeBlocked = useCallback((time: string) => {
    const currentFormData = formDataRef.current;
    if (!currentFormData.agenda_fecha || !currentFormData.profesional_id) return false;

    // Usar refs para evitar re-renders
    const bloqueosDia = staticDataRef.current.fechasBloqueadas.filter(
      fb => fb.fecha === currentFormData.agenda_fecha && fb.profesional_id === currentFormData.profesional_id
    );

    if (bloqueosDia.length === 0) return false;

    const timeMinutes = timeToMinutes(time);

    for (const bloqueo of bloqueosDia) {
      if (!bloqueo.hora_desde || !bloqueo.hora_hasta) continue;

      const bloqueoDesde = timeToMinutes(bloqueo.hora_desde);
      const bloqueoHasta = timeToMinutes(bloqueo.hora_hasta);

      // Si hora_hasta === "23:59:59", bloquear todo desde hora_desde hasta medianoche
      if (bloqueo.hora_hasta === "23:59:59") {
        if (timeMinutes >= bloqueoDesde) {
          return true;
        }
      } else {
        // Verificar si el horario está dentro del rango bloqueado
        if (timeMinutes >= bloqueoDesde && timeMinutes < bloqueoHasta) {
          return true;
        }
      }
    }

    return false;
  }, [timeToMinutes, staticDataRef]); // Incluir staticDataRef como dependencia

  const timeOptions = generateTimeOptions();

  // Verificar si hay horarios bloqueados muy cerca del rango seleccionado
  const hasNearbyBlockedTimes = useCallback(() => {
    const currentFormData = formDataRef.current;
    if (!currentFormData.agenda_fecha || !currentFormData.profesional_id || !currentFormData.agenda_hora_desde || !currentFormData.agenda_hora_hasta) {
      return false;
    }

    // Usar refs para evitar re-renders
    const bloqueosDia = staticDataRef.current.fechasBloqueadas.filter(
      fb => fb.fecha === currentFormData.agenda_fecha && fb.profesional_id === currentFormData.profesional_id
    );

    if (bloqueosDia.length === 0) return false;

    const desdeMinutes = timeToMinutes(currentFormData.agenda_hora_desde);
    const hastaMinutes = timeToMinutes(currentFormData.agenda_hora_hasta);

    // Verificar si algún horario bloqueado está exactamente pegado (sin gap)
    for (const bloqueo of bloqueosDia) {
      if (!bloqueo.hora_desde || !bloqueo.hora_hasta) continue;

      const bloqueoDesde = timeToMinutes(bloqueo.hora_desde);
      const bloqueoHasta = timeToMinutes(bloqueo.hora_hasta);

      // Verificar si el inicio del rango seleccionado está pegado al final de un bloqueo
      if (desdeMinutes === bloqueoHasta) {
        return true;
      }

      // Verificar si el fin del rango seleccionado está pegado al inicio de un bloqueo
      if (hastaMinutes === bloqueoDesde) {
        return true;
      }
    }

    return false;
  }, [timeToMinutes, staticDataRef]); // Incluir staticDataRef como dependencia

  // Obtener fechas bloqueadas (completamente bloqueadas) como funciones disabled
  const getDisabledDays = useCallback((): ((date: Date) => boolean) => {
    const currentFormData = formDataRef.current;
    if (!currentFormData.profesional_id) {
      return () => false;
    }

    // Obtener fechas bloqueadas del ref para evitar re-renders
    const fechasBloqueadas = staticDataRef.current.fechasBloqueadas;
    const profesionalId = currentFormData.profesional_id;

    return (date: Date) => {
      const dateString = date.toISOString().split('T')[0];

      // Verificar si la fecha está completamente bloqueada directamente
      const bloqueosDia = fechasBloqueadas.filter(
        fb => fb.fecha === dateString && fb.profesional_id === profesionalId
      );

      if (bloqueosDia.length === 0) return false;

      // Si hay un bloqueo con hora_hasta === "23:59:59", el día está completamente bloqueado
      return bloqueosDia.some(bloqueo => bloqueo.hora_hasta === "23:59:59");
    };
  }, [staticDataRef]); // Incluir staticDataRef como dependencia

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>Iniciar {companyConfig?.sing_heading_reclamos || "Reclamo"}</SheetTitle>
          <SheetDescription>
            Formulario para crear iniciar {companyConfig?.sing_heading_reclamos?.toLowerCase() || "reclamo"}.
            Complete todos los campos requeridos para programar la cita.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="cliente">
              {companyConfig?.sing_heading_solicitante || "Cliente"} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.cliente_id?.toString() || ""}
              onValueChange={(value) => handleClienteChange(parseInt(value))}
              disabled={loadingClientes}
            >
              <SelectTrigger id="cliente" className="cursor-pointer w-full">
                <SelectValue placeholder={loadingClientes ? `Cargando ${companyConfig?.sing_heading_solicitante?.toLowerCase()}...` : `Seleccionar ${companyConfig?.sing_heading_solicitante?.toLowerCase()}...`} />
              </SelectTrigger>
              <SelectContent className="cursor-pointer">
                {clientesOptions
                  .filter((cliente) => cliente?.cliente_id && cliente?.cliente_complete_name)
                  .map((cliente) => (
                    <SelectItem key={cliente.cliente_id} value={cliente.cliente_id.toString()} className="cursor-pointer">
                      {cliente.cliente_complete_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Información del cliente seleccionado */}
            {selectedCliente && (
              <div className="mt-3 p-3 bg-muted rounded-md space-y-1 text-sm text-muted-foreground">
                <div><strong>ID:</strong> {selectedCliente.cliente_id}</div>
                <div><strong>Nombre:</strong> {selectedCliente.cliente_complete_name}</div>
                {selectedCliente.cliente_phone && (
                  <div><strong>Teléfono:</strong> {selectedCliente.cliente_phone}</div>
                )}
                {selectedCliente.cliente_email && (
                  <div><strong>Email:</strong> {selectedCliente.cliente_email}</div>
                )}
              </div>
            )}
          </div>

          {/* Especialidad */}
          <div className="space-y-2">
            <Label htmlFor="especialidad">
              {companyConfig?.sing_heading_especialidad || "Especialidad"} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.especialidad_id?.toString() || ""}
              onValueChange={(value) => updateField("especialidad_id", parseInt(value))}
              disabled={loadingEspecialidades}
            >
              <SelectTrigger id="especialidad" className="cursor-pointer w-full">
                <SelectValue placeholder={loadingEspecialidades ? `Cargando ${companyConfig?.sing_heading_especialidad?.toLowerCase()}...` : `Seleccionar ${companyConfig?.sing_heading_especialidad?.toLowerCase()}...`} />
              </SelectTrigger>
              <SelectContent className="cursor-pointer">
                {especialidadesOptions
                  .filter((especialidad) => especialidad?.especialidad_id && especialidad?.nombre_especialidad)
                  .map((especialidad) => (
                    <SelectItem key={especialidad.especialidad_id} value={especialidad.especialidad_id.toString()} className="cursor-pointer">
                      {especialidad.nombre_especialidad}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>



          {/* Profesional */}
          {formData.especialidad_id && (
            <div className="space-y-2">
              <Label htmlFor="profesional">
                {companyConfig?.sing_heading_profesional || "Profesional"} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.asignacion_id?.toString() || ""}
                onValueChange={(value) => updateField("asignacion_id", parseInt(value))}
                disabled={loadingAsignaciones}
              >
                <SelectTrigger id="profesional" className="cursor-pointer w-full">
                  <SelectValue placeholder={loadingAsignaciones ? `Cargando ${companyConfig?.sing_heading_profesional?.toLowerCase()}...` : `Seleccionar ${companyConfig?.sing_heading_profesional?.toLowerCase()}...`} />
                </SelectTrigger>
                <SelectContent className="cursor-pointer">
                  {profesionalesDisponibles
                    .filter((asignacion) => asignacion?.profesional_id && asignacion?.profesional_nombre)
                    .map((asignacion) => (
                      <SelectItem
                        key={asignacion.profesional_id}
                        value={asignacion.profesional_id.toString()}
                        className="cursor-pointer"
                      >
                        {asignacion.profesional_nombre}
                        {asignacion.cantidadBloqueos !== undefined && asignacion.cantidadBloqueos > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({asignacion.cantidadBloqueos} bloqueos)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* URL del Reclamo - Condicional */}
          {companyConfig?.requiere_url === 1 && (
            <div className="space-y-2">
              <Label htmlFor="url">
                URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://..."
                value={formData.cliente_url}
                onChange={(e) => updateField("cliente_url", e.target.value)}
              />
            </div>
          )}

          {/* Fecha y Horarios - Solo si hay profesional seleccionado */}
          {formData.profesional_id && (
            <div className="space-y-4">
              {/* Grid para Fecha y Horarios */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {/* Fecha - Ocupa toda la fila en mobile, 1 columna en desktop */}
                <div className="space-y-2 md:col-span-1.5 flex flex-col gap-1">
                  <Label htmlFor="fecha">
                    Fecha <span className="text-destructive">*</span>
                  </Label>
                  <DatePicker
                    value={formData.agenda_fecha}
                    onChange={(date) => updateField("agenda_fecha", date)}
                    minDate={new Date()}
                    disabledDays={getDisabledDays()}
                    placeholder="Seleccionar fecha para la asistencia"
                  />
                </div>

                {/* Horas - Solo si hay fecha seleccionada, ocupan 2 columnas en desktop */}
                {formData.agenda_fecha && (
                  <div className="flex items-center justify-center gap-2">
                    {/* Hora desde */}
                    <div className="space-y-2 flex-1/2 flex flex-col gap-1">
                      <Label htmlFor="hora_desde">
                        Hora desde <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.agenda_hora_desde || ""}
                        onValueChange={(value) => updateField("agenda_hora_desde", value)}
                      >
                        <SelectTrigger id="hora_desde" className="cursor-pointer w-full">
                          <SelectValue placeholder="Seleccionar hora para la asistencia..." />
                        </SelectTrigger>
                        <SelectContent id="horarios-selector" className="cursor-pointer">
                          {timeOptions.map((time) => (
                            <SelectItem
                              key={time}
                              value={time}
                              className="cursor-pointer"
                              disabled={isTimeBlocked(time)}
                            >
                              {time.slice(0, 5)} {/* Mostrar solo HH:mm */}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Hora hasta - Condicional por companyConfig */}
                    {companyConfig?.requiere_fecha_final === 1 && (
                      <div className="space-y-2 flex-1/2 flex flex-col gap-1">
                        <Label htmlFor="hora_hasta">
                          Hora hasta <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.agenda_hora_hasta || ""}
                          onValueChange={(value) => updateField("agenda_hora_hasta", value)}
                        >
                          <SelectTrigger id="hora_hasta" className="cursor-pointer w-full">
                            <SelectValue placeholder="Seleccionar hora..." />
                          </SelectTrigger>
                          <SelectContent id="horarios-selector" className="cursor-pointer">
                            {timeOptions.map((time) => {
                              // Filtrar horarios que sean menores o iguales que hora desde
                              const timeMinutes = timeToMinutes(time);
                              const fromMinutes = formData.agenda_hora_desde ? timeToMinutes(formData.agenda_hora_desde) : 0;
                              const isBeforeFrom = !!(formData.agenda_hora_desde && timeMinutes <= fromMinutes);

                              // Para hora_hasta, NO debemos bloquear individualmente
                              // Solo verificamos que sea después de hora_desde
                              // La validación de rango se hace en isHorarioDisponible
                              const isDisabled = isBeforeFrom;

                              return (
                                <SelectItem
                                  key={time}
                                  value={time}
                                  className="cursor-pointer"
                                  disabled={isDisabled}
                                >
                                  {time.slice(0, 5)} {/* Mostrar solo HH:mm */}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mensaje de horarios bloqueados */}
              {formData.agenda_fecha && formData.agenda_hora_desde && formData.agenda_hora_hasta &&
                !isHorarioDisponible(formData.agenda_fecha, formData.agenda_hora_desde, formData.agenda_hora_hasta) && (
                  <p className="text-sm text-destructive">
                    Este horario está bloqueado para el profesional seleccionado
                  </p>
                )}

              {/* Mostrar horarios bloqueados de la fecha */}
              {formData.agenda_fecha && getHorariosBloqueados(formData.agenda_fecha).length > 0 && (
                <div className="p-2 bg-muted rounded-md text-sm">
                  <p className="font-medium text-sm mb-1">Horarios bloqueados en esta fecha:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {getHorariosBloqueados(formData.agenda_fecha).map((horario, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground">
                        {horario.desde} - {horario.hasta}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mensaje amigable para horarios seguidos */}
              {formData.agenda_fecha && formData.agenda_hora_desde && formData.agenda_hora_hasta && hasNearbyBlockedTimes() && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/50 rounded-md">
                  <div className="text-yellow-800 dark:text-yellow-300 text-justify flex flex-col gap-2">
                    <strong>💡Consejo Fast Track:</strong>
                    <p className="text-sm">Brindar un tiempo prudencial a su {companyConfig?.sing_heading_profesional.toLowerCase() || "profesional"} entre {(companyConfig?.plu_heading_reclamos?.toLowerCase()) || "reclamo"} permite que su éste, gestione cada {companyConfig?.sing_heading_reclamos.toLowerCase() || "reclamo"} con el servicio de excelencia y profesionalismo que cada {companyConfig?.sing_heading_solicitante.toLowerCase() || "solicitante"} espera recibir</p>
                    <p className="text-sm">Desde <span className="italic"><strong>Fast</strong><span className="font-extralight">Track</span></span>, recomendamos una ventana de al menos 30 minutos entre {companyConfig?.plu_heading_reclamos.toLowerCase() || "reclamos"} para no sobrecargar la agenda y potenciales tiempos de traslado de su {companyConfig?.sing_heading_profesional.toLowerCase() || "profesional"}.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Título del Reclamo */}
          <div className="space-y-2">
            <Label htmlFor="titulo">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="titulo"
              placeholder={tituloPlaceholder}
              defaultValue={formData.reclamo_titulo}
              onChange={handleTituloChange}
            />
          </div>

          {/* Descripción del Reclamo */}
          <div className="space-y-2">
            <Label htmlFor="detalle">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="detalle"
              placeholder={detallePlaceholder}
              defaultValue={formData.reclamo_detalle}
              onChange={handleDetalleChange}
              rows={4}
            />
          </div>

          {/* Mostrar error si existe */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                `Crear ${companyConfig?.sing_heading_reclamos || "Reclamo"}`
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
