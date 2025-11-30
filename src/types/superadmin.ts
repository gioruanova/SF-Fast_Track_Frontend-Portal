import { User } from "@/types/users";

export interface SuperadminUserData extends Pick<User, "user_id" | "user_role" | "user_status"> {
  company_id?: number;
}

export interface SuperadminCompanyData {
  company_id: number;
  company_nombre: string;
  company_estado: number;
}

export interface SuperadminReclamoData {
  reclamo_id: number;
  reclamo_estado: string;
  company_name: string;
  created_at: string;
}

export interface CompanyStats {
  company_id: number;
  company_nombre: string;
  operadores_activos: number;
  profesionales_activos: number;
  clientes_activos: number;
  especialidades: number;
  reclamos_abiertos: number;
  reclamos_cerrados: number;
}

