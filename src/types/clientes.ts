export interface ClienteRecurrente {
  cliente_id: number;
  cliente_complete_name: string;
  cliente_email?: string;
  cliente_phone?: string;
  cliente_direccion?: string;
  cliente_dni?: string;
  cliente_lat?: number | null;
  cliente_lng?: number | null;
  cliente_active: number;
  company_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ClienteRecurrenteFormData {
  cliente_complete_name: string;
  cliente_dni: string;
  cliente_phone: string;
  cliente_email: string;
  cliente_direccion?: string;
  cliente_lat?: number | null;
  cliente_lng?: number | null;
}

export interface ClienteRecurrenteUpdateData {
  cliente_complete_name?: string;
  cliente_dni?: string;
  cliente_phone?: string;
  cliente_email?: string;
  cliente_direccion?: string;
  cliente_lat?: number | null;
  cliente_lng?: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

