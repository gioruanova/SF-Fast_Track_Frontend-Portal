export interface BaseUser {
  user_id: number;
  user_email: string;
  user_name?: string;
  user_role: string;
}

export interface SuperAdminUser extends BaseUser {
  user_role: "superadmin";
}

export interface CompanyUser extends BaseUser {
  user_role: "owner" | "operador" | "profesional";
  company_id: number;
  company_name: string;
  company_status: number;
  user_phone?: string;
  company_phone?: string;
  company_email?: string;
  company_whatsapp?: string;
  company_telegram?: string;
  user_dni?: string;
}

export type User = SuperAdminUser | CompanyUser;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

export interface RefreshResponse {
  user: User;
}

import { CompanyConfigData } from "./company";

export interface AuthContextType {
  user: User | null;
  companyConfig: CompanyConfigData | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshCompanyConfig: () => Promise<void>;
  isLoading: boolean;
  isLoggingOut: boolean;
  isRedirecting: boolean;
  setIsRedirecting: (value: boolean) => void;
  error: string | null;
}

export const isSuperAdmin = (user: User | null): user is SuperAdminUser => {
  return user?.user_role === "superadmin";
};

export const isCompanyUser = (user: User | null): user is CompanyUser => {
  return user !== null && user.user_role !== "superadmin";
};

export const hasRole = (user: User | null, role: string): boolean => {
  return user?.user_role === role;
};
