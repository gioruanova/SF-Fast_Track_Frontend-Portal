export interface Especialidad {
  id_especialidad: number;
  nombre_especialidad: string;
  company_id: number;
  company_nombre?: string;
  estado_especialidad: number;
  created_at?: string;
  updated_at?: string;
}

export interface EspecialidadFormData {
  nombre_especialidad: string;
  company_id?: number;
}

export interface CreateEspecialidadRequest {
  nombre_especialidad: string;
  company_id?: number;
}

export interface UpdateEspecialidadRequest {
  nombre_especialidad: string;
}

export const ESPECIALIDAD_STATUS = {
  ACTIVA: 1,
  INACTIVA: 0,
} as const;

export type EspecialidadStatus = typeof ESPECIALIDAD_STATUS[keyof typeof ESPECIALIDAD_STATUS];

export interface EstadoEspecialidad {
  id_especialidad: number;
  estado_especialidad: EspecialidadStatus;
}

export interface EspecialidadSimple {
  especialidad_id: number;
  nombre_especialidad: string;
  especialidad_active: number;
}

