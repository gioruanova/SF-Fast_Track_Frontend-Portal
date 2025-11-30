import { UserRole } from "@/types/users";

export function getClientesRoute(userRole?: UserRole): string {
  if (userRole === "owner") return "/dashboard/owner/clientes";
  if (userRole === "operador") return "/dashboard/operador/clientes";
  return "/dashboard/owner/clientes";
}

export function getProfesionalesRoute(userRole?: UserRole): string {
  if (userRole === "owner") return "/dashboard/owner/profesionales";
  if (userRole === "operador") return "/dashboard/operador/profesionales";
  return "/dashboard/owner/profesionales";
}

export function getEspecialidadesRoute(userRole?: UserRole): string {
  if (userRole === "owner") return "/dashboard/owner/especialidades";
  if (userRole === "operador") return "/dashboard/operador/especialidades";
  return "/dashboard/owner/especialidades";
}

