export interface ProfesionalEspecialidad {
  asignacion_id: number;
  id_asignacion: number;
  profesional_id: number;
  especialidad_id: number;
  company_id: number;
  created_at?: string;
  updated_at?: string;
  Especialidad?: {
    nombre_especialidad: string;
    id_especialidad: number;
  };
}

export interface CreateProfesionalEspecialidadRequest {
  profesional_id: number;
  especialidad_id: number;
}

export interface UpdateProfesionalEspecialidadRequest {
  especialidad_id: number;
}

