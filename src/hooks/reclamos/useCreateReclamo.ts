"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { API_ROUTES } from "@/lib/api_routes";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/apiClient";
import { ProfesionalEspecialidad } from "@/types/profesional-especialidad";
import { User } from "@/types/users";
import { useProfesionalEspecialidad } from "@/hooks/profesional-especialidad/useProfesionalEspecialidad";
import { ClienteRecurrente } from "@/types/clientes";
import {
  ReclamoFormData,
  AgendaBloqueada,
  FechaBloqueada,
  AsignacionReclamo,
} from "@/types/reclamos";
import {
  EspecialidadSimple,
  Especialidad,
} from "@/types/especialidades";

export type { ReclamoFormData };


export function useCreateReclamo(isOpen: boolean = false) {
  const { companyConfig } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ReclamoFormData>({
    cliente_id: null,
    especialidad_id: null,
    asignacion_id: null,
    profesional_id: null,
    reclamo_titulo: "",
    reclamo_detalle: "",
    agenda_fecha: "",
    agenda_hora_desde: "",
    agenda_hora_hasta: "",
    cliente_direccion: "",
    cliente_url: "",
    cliente_email: "",
    cliente_phone: "",
  });

  const [clientesOptions, setClientesOptions] = useState<ClienteRecurrente[]>([]);
  const [especialidadesOptions, setEspecialidadesOptions] = useState<EspecialidadSimple[]>([]);
  const [asignacionesOptions, setAsignacionesOptions] = useState<AsignacionReclamo[]>([]);
  const [asignacionesOriginales, setAsignacionesOriginales] = useState<AsignacionReclamo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [fechasBloqueadas, setFechasBloqueadas] = useState<FechaBloqueada[]>([]);
  const [agendaBloqueada, setAgendaBloqueada] = useState<AgendaBloqueada[]>([]);

  const [loadingClientes] = useState(false);
  const [loadingEspecialidades] = useState(false);
  const [loadingFechas, setLoadingFechas] = useState(false);

  const {
    isLoading: loadingAsignaciones,
    fetchAsignaciones,
  } = useProfesionalEspecialidad({ autoFetch: false });

  const transformAsignaciones = useCallback(
    (
      asignaciones: ProfesionalEspecialidad[],
      users: User[]
    ): AsignacionReclamo[] => {
      return asignaciones.map((asig: ProfesionalEspecialidad) => {
        const profesional = users.find(
          (u: User) => u.user_id === asig.profesional_id
        );
        return {
          asignacion_id: asig.asignacion_id || asig.id_asignacion,
          profesional_id: asig.profesional_id,
          profesional_nombre: profesional?.user_complete_name || "",
          especialidad_id: asig.especialidad_id,
          especialidad_nombre: asig.Especialidad?.nombre_especialidad || "",
        };
      });
    },
    []
  );

  const formDataRef = useRef(formData);
  const staticDataRef = useRef<{
    clientes: ClienteRecurrente[];
    especialidades: EspecialidadSimple[];
    asignaciones: AsignacionReclamo[];
    users: User[];
    agendaBloqueada: AgendaBloqueada[];
    fechasBloqueadas: FechaBloqueada[];
  }>({
    clientes: clientesOptions,
    especialidades: especialidadesOptions,
    asignaciones: asignacionesOptions,
    users: users,
    agendaBloqueada: agendaBloqueada,
    fechasBloqueadas: fechasBloqueadas,
  });

  formDataRef.current = formData;
  staticDataRef.current = {
    clientes: clientesOptions,
    especialidades: especialidadesOptions,
    asignaciones: asignacionesOriginales, 
    users: users,
    agendaBloqueada: agendaBloqueada,
    fechasBloqueadas: fechasBloqueadas,
  };

  const loadAgendaData = useCallback(async (profesionalId: number) => {
    if (!profesionalId) {
      setAgendaBloqueada([]);
      setFechasBloqueadas([]);
      return;
    }

    try {
      setLoadingFechas(true);
      const response = await apiClient.get(API_ROUTES.GET_AGENDA_BLOQUEADA);
      const agenda = response.data || [];

      const agendaFiltrada = agenda.filter((item: AgendaBloqueada) =>
        item.profesional_id === profesionalId
      );

      setAgendaBloqueada(agendaFiltrada);

      const fechasDelProfesional = agendaFiltrada.map((item: AgendaBloqueada) => ({
        fecha: item.agenda_fecha.split('T')[0],
        hora_desde: item.agenda_hora_desde,
        hora_hasta: item.agenda_hora_hasta,
        profesional_id: item.profesional_id,
      }));

      setFechasBloqueadas(fechasDelProfesional);
    } catch (error) {
      console.error("Error loading agenda bloqueada:", error);
      setAgendaBloqueada([]);
      setFechasBloqueadas([]);
    } finally {
      setLoadingFechas(false);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);

      const [clientesRes, usersRes, especialidadesRes] = await Promise.allSettled([
        apiClient.get(API_ROUTES.GET_CLIENTES_RECURRENTES),
        apiClient.get(API_ROUTES.GET_USERS),
        apiClient.get(API_ROUTES.GET_ESPECIALIDADES),
      ]);

      const asignacionesRaw = await fetchAsignaciones();
      const especialidadesData = (especialidadesRes.status === 'fulfilled' ? especialidadesRes.value.data : []) as Especialidad[];
      const usersData = (usersRes.status === 'fulfilled' ? usersRes.value.data : []) as User[];
      
      const clientesData = clientesRes.status === 'fulfilled' ? (clientesRes.value.data || []) : [];
      const clientesActivos = clientesData.filter(
        (cliente: ClienteRecurrente) => cliente.cliente_active === 1
      );
      
      const asignacionesTransformadas = transformAsignaciones(
        asignacionesRaw,
        usersData
      );
      
      const especialidadesUnicas = asignacionesTransformadas.reduce((acc: EspecialidadSimple[], asignacion: AsignacionReclamo) => {
        if (!acc.find(esp => esp.especialidad_id === asignacion.especialidad_id)) {
          const especialidadData = especialidadesData.find(
            (esp: Especialidad) => esp.id_especialidad === asignacion.especialidad_id
          );
          
          if (especialidadData && especialidadData.estado_especialidad === 1) {
            acc.push({
              especialidad_id: asignacion.especialidad_id,
              nombre_especialidad: especialidadData.nombre_especialidad || asignacion.especialidad_nombre,
              especialidad_active: especialidadData.estado_especialidad,
            });
          }
        }
        return acc;
      }, []);

      setClientesOptions(clientesActivos);
      setEspecialidadesOptions(especialidadesUnicas);
      setUsers(usersData);
      setAsignacionesOptions(asignacionesTransformadas);
      setAsignacionesOriginales(asignacionesTransformadas);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchAsignaciones, transformAsignaciones]);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen, loadInitialData]);

  const handleClienteChange = useCallback((clienteId: number | null) => {
    if (!clienteId) {
      setFormData(prev => ({
        ...prev,
        cliente_id: null,
        cliente_email: "",
        cliente_phone: "",
        cliente_direccion: "",
      }));
      return;
    }

    const cliente = clientesOptions.find(c => c.cliente_id === clienteId);
    if (cliente) {
      setFormData(prev => ({
        ...prev,
        cliente_id: clienteId,
        cliente_email: cliente.cliente_email || "",
        cliente_phone: cliente.cliente_phone || "",
        cliente_direccion: cliente.cliente_direccion || "",
      }));
    }
  }, [clientesOptions]);

  useEffect(() => {
    if (formData.especialidad_id) {
      const asignacionesFiltradas = staticDataRef.current.asignaciones.filter(
        (asignacion: AsignacionReclamo) => asignacion.especialidad_id === formData.especialidad_id
      );
      setAsignacionesOptions(asignacionesFiltradas);
    } else {
      setAsignacionesOptions([]);
    }
  }, [formData.especialidad_id]);

  const asignacionesRef = useRef<AsignacionReclamo[]>([]);
  asignacionesRef.current = asignacionesOptions;

  useEffect(() => {
    if (formData.profesional_id) {
      loadAgendaData(formData.profesional_id);
    } else {
      setFechasBloqueadas([]);
      setAgendaBloqueada([]);
    }
  }, [formData.profesional_id, loadAgendaData]);

  const updateField = useCallback((field: keyof ReclamoFormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const horaAMinutos = useCallback((hora: string): number => {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }, []);

  const getHorariosBloqueados = useCallback((fecha: string): Array<{ desde: string, hasta: string }> => {
    if (!fecha || !formData.profesional_id) return [];

    const bloqueosDia = fechasBloqueadas.filter(
      fb => fb.fecha === fecha && fb.profesional_id === formData.profesional_id
    );

    return bloqueosDia
      .filter(bloqueo => bloqueo.hora_desde && bloqueo.hora_hasta)
      .map(bloqueo => ({
        desde: bloqueo.hora_desde!,
        hasta: bloqueo.hora_hasta!,
      }));
  }, [fechasBloqueadas, formData.profesional_id]);

  const isFechaCompletamenteBloqueada = useCallback((fecha: string): boolean => {
    const bloqueosDia = fechasBloqueadas.filter(
      fb => fb.fecha === fecha && fb.profesional_id === formData.profesional_id
    );

    if (bloqueosDia.length === 0) return false;

    return bloqueosDia.some(bloqueo => bloqueo.hora_hasta === "23:59:59");
  }, [fechasBloqueadas, formData.profesional_id]);

  const isHorarioDisponible = useCallback((fecha: string, horaDesde: string, horaHasta: string): boolean => {
    const bloqueosDia = fechasBloqueadas.filter(
      fb => fb.fecha === fecha && fb.profesional_id === formData.profesional_id
    );

    if (bloqueosDia.length === 0) return true;

    const minutosDesde = horaAMinutos(horaDesde);
    const minutosHasta = horaAMinutos(horaHasta);

    for (const bloqueo of bloqueosDia) {
      if (!bloqueo.hora_desde || !bloqueo.hora_hasta) continue;

      if (bloqueo.hora_hasta === "23:59:59") {
        const bloqueoDesde = horaAMinutos(bloqueo.hora_desde);
        if (minutosDesde >= bloqueoDesde) {
          return false;
        }
      } else {
        const bloqueoDesde = horaAMinutos(bloqueo.hora_desde);
        const bloqueoHasta = horaAMinutos(bloqueo.hora_hasta);

        if (minutosDesde < bloqueoHasta && minutosHasta > bloqueoDesde) {
          return false;
        }
      }
    }

    return true;
  }, [fechasBloqueadas, formData.profesional_id, horaAMinutos]);

  const validateForm = useCallback((): string[] => {
    const errors: string[] = [];

    if (!formData.cliente_id) errors.push(`Debe seleccionar un ${companyConfig?.sing_heading_solicitante.toLowerCase()}`);
    if (!formData.especialidad_id) errors.push(`Debe seleccionar una ${companyConfig?.sing_heading_especialidad.toLowerCase()}`);
    if (!formData.asignacion_id) errors.push(`Debe seleccionar un ${companyConfig?.sing_heading_profesional.toLowerCase()}`);
    if (!formData.reclamo_titulo.trim()) errors.push("El título es requerido");
    if (!formData.reclamo_detalle.trim()) errors.push("El detalle es requerido");
    if (!formData.agenda_fecha) errors.push("Debe seleccionar una fecha");
    if (!formData.agenda_hora_desde) errors.push("Debe seleccionar hora de inicio");
    if (!formData.agenda_hora_hasta) errors.push("Debe seleccionar hora de fin");

    if (companyConfig?.requiere_domicilio && !formData.cliente_direccion?.trim()) {
      errors.push("La dirección es requerida");
    }

    if (companyConfig?.requiere_url && !formData.cliente_url?.trim()) {
      errors.push("La URL es requerida");
    }

    return errors;
  }, [companyConfig, formData]);

  const submitReclamo = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    const errors = validateForm();
    if (errors.length > 0) {
      return { success: false, error: errors.join(". ") };
    }

    try {
      setLoading(true);

await new Promise(resolve => setTimeout(resolve, 1000));

      return { success: true };
    } catch (error) {
      console.error("Error creating reclamo:", error);
      let errorMessage = "Error al crear el reclamo";

      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } }; message?: string };
        errorMessage = apiError.response?.data?.message || apiError.message || errorMessage;
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [validateForm]);

  const profesionalesDisponibles = useMemo(() => {
    if (!formData.especialidad_id) return [];

    const asignacionesDeEspecialidad = staticDataRef.current.asignaciones.filter(
      (asignacion) => asignacion.especialidad_id === formData.especialidad_id
    );

    const profesionalesAptos = asignacionesDeEspecialidad.filter((asignacion) => {
      const user = staticDataRef.current.users.find(
        (u) => u.user_id === asignacion.profesional_id
      );
      return user?.apto_recibir === 1;
    });

    const profesionalCounts = profesionalesAptos.map((asignacion) => {
      const bloqueos = staticDataRef.current.agendaBloqueada.filter(
        (item) => item.profesional_id === asignacion.profesional_id
      );
      return {
        ...asignacion,
        cantidadBloqueos: bloqueos.length,
      };
    });

    return profesionalCounts.sort((a, b) => a.cantidadBloqueos - b.cantidadBloqueos);
  }, [formData.especialidad_id]);

  return {
    formData,
    updateField,
    handleClienteChange,

    clientesOptions,
    especialidadesOptions,
    asignacionesOptions,
    agendaBloqueada,
    fechasBloqueadas,

    loading,
    loadingClientes,
    loadingEspecialidades,
    loadingAsignaciones,
    loadingFechas,

    isFechaCompletamenteBloqueada,
    isHorarioDisponible,
    getHorariosBloqueados,
    validateForm,
    submitReclamo,
    profesionalesDisponibles,

    companyConfig,

    staticDataRef,

    resetForm: () => setFormData({
      cliente_id: null,
      especialidad_id: null,
      asignacion_id: null,
      profesional_id: null,
      reclamo_titulo: "",
      reclamo_detalle: "",
      agenda_fecha: "",
      agenda_hora_desde: "",
      agenda_hora_hasta: "",
      cliente_direccion: "",
      cliente_url: "",
      cliente_email: "",
      cliente_phone: "",
    }),

    setFormData,
  };
}
