export interface CompanyConfigData {
  company_config_id: number;
  company_id: number;
  requiere_domicilio: number;
  requiere_url: number;
  requiere_fecha_final: number;
  sing_heading_owner: string;
  plu_heading_owner: string;
  sing_heading_profesional: string;
  plu_heading_profesional: string;
  sing_heading_operador: string;
  plu_heading_operador: string;
  sing_heading_solicitante: string;
  plu_heading_solicitante: string;
  sing_heading_reclamos: string;
  plu_heading_reclamos: string;
  sing_heading_especialidad: string;
  plu_heading_especialidad: string;
  string_inicio_reclamo_solicitante: string;
  string_actualizacion_reclamo_solicitante: string;
  string_recordatorio_reclamo_solicitante: string;
  string_cierre_reclamo_solicitante: string;
  string_inicio_reclamo_profesional: string;
  string_actualizacion_reclamo_profesional: string;
  string_recordatorio_reclamo_profesional: string;
  string_cierre_reclamo_profesional: string;
  created_at: string;
  updated_at: string;
  company: {
    company_id: number;
    company_unique_id: string;
    company_nombre: string;
    company_phone: string;
    company_email: string;
    company_whatsapp: string;
    company_telegram: string;
    company_estado: number;
    limite_operadores: number;
    limite_profesionales: number;
    limite_especialidades: number;
    reminder_manual: number;
    created_at: string;
    updated_at: string;
  };
}

