"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { CLIENT_API } from "@/lib/clientApi/config";
import { config } from "@/lib/config";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

interface ClienteRecurrente {
  cliente_id: number;
  cliente_complete_name: string;
  cliente_email?: string;
  cliente_phone?: string;
  cliente_direccion?: string;
  cliente_dni?: string;
}

interface Especialidad {
  especialidad_id: number;
  nombre_especialidad: string;
}

interface User {
  user_id: number;
  user_complete_name: string;
  user_email: string;
  user_role: string;
  user_status: number;
  apto_recibir?: boolean | number;
}

interface Asignacion {
  asignacion_id?: number;
  profesional_id: number;
  profesional_nombre: string;
  especialidad_id: number;
  especialidad_nombre: string;
}

interface AgendaBloqueada {
  profesional_id: number;
  especialidad_id: number;
  agenda_fecha: string;
  agenda_hora_desde: string;
  agenda_hora_hasta: string;
}

interface FechaBloqueada {
  fecha: string;
  hora_desde?: string;
  hora_hasta?: string;
  profesional_id: number;
}


export interface ReclamoFormData {
  cliente_id: number | null;
  especialidad_id: number | null;
  asignacion_id: number | null;
  profesional_id: number | null;
  reclamo_titulo: string;
  reclamo_detalle: string;
  agenda_fecha: string;
  agenda_hora_desde: string;
  agenda_hora_hasta: string;
  cliente_direccion?: string;
  cliente_url?: string;
  cliente_email?: string;
  cliente_phone?: string;
}

const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export function useCreateReclamo(isOpen: boolean = false) {
  const { companyConfig } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form data
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

  // Options for dropdowns
  const [clientesOptions, setClientesOptions] = useState<ClienteRecurrente[]>([]);
  const [especialidadesOptions, setEspecialidadesOptions] = useState<Especialidad[]>([]);
  const [asignacionesOptions, setAsignacionesOptions] = useState<Asignacion[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [fechasBloqueadas, setFechasBloqueadas] = useState<FechaBloqueada[]>([]);
  const [agendaBloqueada, setAgendaBloqueada] = useState<AgendaBloqueada[]>([]);
  
  // Loading states
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(false);
  const [loadingAsignaciones, setLoadingAsignaciones] = useState(false);
  const [loadingFechas, setLoadingFechas] = useState(false);

  // Refs para evitar re-renders innecesarios
  const formDataRef = useRef(formData);
  const staticDataRef = useRef({
    clientes: clientesOptions,
    especialidades: especialidadesOptions,
    asignaciones: asignacionesOptions,
    users: users,
    agendaBloqueada: agendaBloqueada,
    fechasBloqueadas: fechasBloqueadas,
  });

  // Actualizar refs cuando cambien los datos
  formDataRef.current = formData;
  staticDataRef.current = {
    clientes: clientesOptions,
    especialidades: especialidadesOptions,
    asignaciones: asignacionesOptions,
    users: users,
    agendaBloqueada: agendaBloqueada,
    fechasBloqueadas: fechasBloqueadas,
  };





  // Cargar agenda bloqueada basada en profesional seleccionado
  const loadAgendaBloqueada = useCallback(async (profesionalId: number) => {
    if (!profesionalId) {
      setAgendaBloqueada([]);
      return;
    }

    try {
      setLoadingFechas(true);
      const response = await apiClient.get(CLIENT_API.GET_AGENDA_BLOQUEADA);
      const agenda = response.data || [];
      
      // Filtrar por profesional_id (no por especialidad_id)
      const agendaFiltrada = agenda.filter((item: AgendaBloqueada) => 
        item.profesional_id === profesionalId
      );
      
      setAgendaBloqueada(agendaFiltrada);
    } catch (error) {
      console.error("Error loading agenda bloqueada:", error);
      setAgendaBloqueada([]);
    } finally {
      setLoadingFechas(false);
    }
  }, []);

  // Cargar fechas bloqueadas para profesional seleccionado
  const loadFechasBloqueadas = useCallback(async (profesionalId: number) => {
    if (!profesionalId) {
      setFechasBloqueadas([]);
      return;
    }

    try {
      setLoadingFechas(true);
      const response = await apiClient.get(CLIENT_API.GET_AGENDA_BLOQUEADA);
      const agenda = response.data || [];
      
      // Filtrar por profesional_id y convertir a formato de fechas bloqueadas
      const fechasDelProfesional = agenda.filter(
        (item: AgendaBloqueada) => item.profesional_id === profesionalId
      ).map((item: AgendaBloqueada) => ({
        fecha: item.agenda_fecha.split('T')[0], // Extraer solo la fecha sin hora
        hora_desde: item.agenda_hora_desde,
        hora_hasta: item.agenda_hora_hasta,
        profesional_id: item.profesional_id,
      }));

      setFechasBloqueadas(fechasDelProfesional);
    } catch (error) {
      console.error("Error loading fechas bloqueadas:", error);
      setFechasBloqueadas([]);
    } finally {
      setLoadingFechas(false);
    }
  }, []);

  // Función para cargar todos los datos iniciales de una vez
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Cargar todos los datos en paralelo
      const [clientesRes, usersRes, asignacionesRes, agendaRes] = await Promise.all([
        apiClient.get(CLIENT_API.GET_CLIENTES),
        apiClient.get(CLIENT_API.GET_USERS),
        apiClient.get(CLIENT_API.GET_ASIGNACIONES),
        apiClient.get(CLIENT_API.GET_AGENDA_BLOQUEADA)
      ]);

      // Extraer especialidades únicas de las asignaciones (solo las que tienen profesionales)
      const asignaciones = asignacionesRes.data || [];
      const especialidadesUnicas = asignaciones.reduce((acc: Especialidad[], asignacion: Asignacion) => {
        if (!acc.find(esp => esp.especialidad_id === asignacion.especialidad_id)) {
          acc.push({
            especialidad_id: asignacion.especialidad_id,
            nombre_especialidad: asignacion.especialidad_nombre,
          });
        }
        return acc;
      }, []);

      setClientesOptions(clientesRes.data || []);
      setEspecialidadesOptions(especialidadesUnicas);
      setUsers(usersRes.data || []);
      setAsignacionesOptions(asignaciones);
      setAgendaBloqueada(agendaRes.data || []);
      
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicializar opciones solo cuando el sheet esté abierto
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen, loadInitialData]);

  // Cuando se selecciona cliente, cargar sus datos
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

  // Cuando se selecciona especialidad, filtrar asignaciones en memoria (optimizado)
  useEffect(() => {
    if (formData.especialidad_id) {
      // Filtrar asignaciones en memoria por especialidad usando ref para evitar re-renders
      const asignacionesFiltradas = staticDataRef.current.asignaciones.filter(
        (asignacion: Asignacion) => asignacion.especialidad_id === formData.especialidad_id
      );
      setAsignacionesOptions(asignacionesFiltradas);
    } else {
      setAsignacionesOptions([]);
    }
  }, [formData.especialidad_id]);

  // Ref para acceder al valor más reciente de asignacionesOptions sin causar re-renders
  const asignacionesRef = useRef<Asignacion[]>([]);
  asignacionesRef.current = asignacionesOptions;

  // Cuando se selecciona asignación, setear profesional_id y cargar fechas bloqueadas
  useEffect(() => {
    // Buscar por profesional_id ya que no tenemos asignacion_id en el response
    if (formData.asignacion_id) {
      const asignacion = asignacionesRef.current.find(a => a.profesional_id === formData.asignacion_id);
      if (asignacion && asignacion.profesional_id !== formData.profesional_id) {
        // Solo actualizar si el profesional_id es diferente
        setFormData(prev => ({ ...prev, profesional_id: asignacion.profesional_id }));
        loadFechasBloqueadas(asignacion.profesional_id);
        loadAgendaBloqueada(asignacion.profesional_id);
      }
    } else if (formData.profesional_id !== null) {
      // Solo limpiar si hay un profesional_id actual
      setFormData(prev => ({ ...prev, profesional_id: null }));
      setFechasBloqueadas([]);
      setAgendaBloqueada([]);
    }
  }, [formData.asignacion_id, formData.profesional_id, loadFechasBloqueadas, loadAgendaBloqueada]);

  // Update form field
  const updateField = useCallback((field: keyof ReclamoFormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Convertir hora HH:MM a minutos desde medianoche
  const horaAMinutos = useCallback((hora: string): number => {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }, []);

  // Convertir minutos a hora HH:MM

  // Obtener horarios bloqueados para una fecha específica
  const getHorariosBloqueados = useCallback((fecha: string): Array<{desde: string, hasta: string}> => {
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

  // Verificar si una fecha está completamente bloqueada (día completo)
  const isFechaCompletamenteBloqueada = useCallback((fecha: string): boolean => {
    const bloqueosDia = fechasBloqueadas.filter(
      fb => fb.fecha === fecha && fb.profesional_id === formData.profesional_id
    );
    
    if (bloqueosDia.length === 0) return false;
    
    // Si hay un bloqueo con hora_hasta === "23:59:59", el día está completamente bloqueado
    return bloqueosDia.some(bloqueo => bloqueo.hora_hasta === "23:59:59");
  }, [fechasBloqueadas, formData.profesional_id]);

  // Verificar si un horario está bloqueado
  const isHorarioDisponible = useCallback((fecha: string, horaDesde: string, horaHasta: string): boolean => {
    const bloqueosDia = fechasBloqueadas.filter(
      fb => fb.fecha === fecha && fb.profesional_id === formData.profesional_id
    );
    
    if (bloqueosDia.length === 0) return true;
    
    const minutosDesde = horaAMinutos(horaDesde);
    const minutosHasta = horaAMinutos(horaHasta);
    
    for (const bloqueo of bloqueosDia) {
      if (!bloqueo.hora_desde || !bloqueo.hora_hasta) continue;
      
      // Si hora_hasta === "23:59:59", bloquear todo desde hora_desde hasta 00:00:00 del día siguiente
      if (bloqueo.hora_hasta === "23:59:59") {
        const bloqueoDesde = horaAMinutos(bloqueo.hora_desde);
        // Bloquea desde la hora_desde hasta el final del día
        if (minutosDesde >= bloqueoDesde) {
          return false;
        }
      } else {
        // Verificar superposición de rangos
        const bloqueoDesde = horaAMinutos(bloqueo.hora_desde);
        const bloqueoHasta = horaAMinutos(bloqueo.hora_hasta);
        
        // Verificar si hay solapamiento
        if (minutosDesde < bloqueoHasta && minutosHasta > bloqueoDesde) {
          return false;
        }
      }
    }
    
    return true;
  }, [fechasBloqueadas, formData.profesional_id, horaAMinutos]);

  // Validar formulario
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

    // Validaciones condicionales según companyConfig
    if (companyConfig?.requiere_domicilio && !formData.cliente_direccion?.trim()) {
      errors.push("La dirección es requerida");
    }

    if (companyConfig?.requiere_url && !formData.cliente_url?.trim()) {
      errors.push("La URL es requerida");
    }

    return errors;
  }, []);

  // Enviar formulario
  const submitReclamo = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    const errors = validateForm();
    if (errors.length > 0) {
      return { success: false, error: errors.join(". ") };
    }

    try {
      setLoading(true);
      
      // TODO: Reemplazar con endpoint real de creación
      // const payload = { ...formData };
      // const response = await apiClient.post(CLIENT_API.CREATE_RECLAMO, payload);
      
      // Mock response
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
  }, []);

  const profesionalesDisponibles = useMemo(() => {
    if (asignacionesOptions.length === 0) return [];
    
    const profesionalesAptos = asignacionesOptions.filter((asignacion) => {
      const user = users.find(u => u.user_id === asignacion.profesional_id);
      return user?.apto_recibir === true || user?.apto_recibir === 1;
    });

    const profesionalCounts = profesionalesAptos.map((asignacion) => {
      const bloqueos = agendaBloqueada.filter(
        (item) => item.profesional_id === asignacion.profesional_id
      );
      return {
        ...asignacion,
        cantidadBloqueos: bloqueos.length,
      };
    });

    // Ordenar por menor cantidad de bloqueos (más disponible)
    return profesionalCounts.sort((a, b) => a.cantidadBloqueos - b.cantidadBloqueos);
  }, [asignacionesOptions, agendaBloqueada, users]);

  return {
    // Form state
    formData,
    updateField,
    handleClienteChange,
    
    // Options
    clientesOptions,
    especialidadesOptions,
    asignacionesOptions,
    agendaBloqueada,
    fechasBloqueadas,
    
    // Loading states
    loading,
    loadingClientes,
    loadingEspecialidades,
    loadingAsignaciones,
    loadingFechas,
    
    // Utilities
    isFechaCompletamenteBloqueada,
    isHorarioDisponible,
    getHorariosBloqueados,
    validateForm,
    submitReclamo,
    profesionalesDisponibles,
    
    // Company config for conditional fields
    companyConfig,
    
    // Refs for performance optimization
    staticDataRef,
    
    // Reset form
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
    
    // Direct state setter for performance-critical fields
    setFormData,
  };
}
