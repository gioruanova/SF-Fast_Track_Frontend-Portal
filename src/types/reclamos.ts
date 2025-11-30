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

export interface AgendaBloqueada {
  profesional_id: number;
  especialidad_id: number;
  agenda_fecha: string;
  agenda_hora_desde: string;
  agenda_hora_hasta: string;
}

export interface FechaBloqueada {
  fecha: string;
  hora_desde?: string;
  hora_hasta?: string;
  profesional_id: number;
}

export interface AsignacionReclamo {
  asignacion_id?: number;
  profesional_id: number;
  profesional_nombre: string;
  especialidad_id: number;
  especialidad_nombre: string;
}

