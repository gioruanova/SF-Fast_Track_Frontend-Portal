export const USER_ROLES = {
  SUPERADMIN: "superadmin",
  OWNER: "owner",
  OPERADOR: "operador",
  PROFESIONAL: "profesional",
} as const;

export const USER_STATUS = {
  BLOQUEADO: 0,
  ACTIVO: 1,
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

export interface EspecialidadItem {
  id_asignacion: number;
  id_usuario: number;
  company_id: number;
  id_especialidad: number;
  created_at: string;
  updated_at: string;
  Especialidad: {
    nombre_especialidad: string;
  };
}

export interface User {
  user_id: number;
  user_complete_name: string;
  user_dni: string;
  user_phone: string;
  user_email: string;
  user_role: UserRole;
  user_status: UserStatus;
  company_id: number | null;
  created_at: string;
  updated_at: string;
  apto_recibir?: UserStatus;
  especialidades?: EspecialidadItem[];
  company_nombre?: string;
}

export function isProfesional(user: User): boolean {
  return user.user_role === USER_ROLES.PROFESIONAL;
}

export function isActive(user: User): boolean {
  return user.user_status === USER_STATUS.ACTIVO;
}

export function getEspecialidadesNames(user: User): string[] {
  return user.especialidades?.map(e => e.Especialidad.nombre_especialidad) || [];
}

