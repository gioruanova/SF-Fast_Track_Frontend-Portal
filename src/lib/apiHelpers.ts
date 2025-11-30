import { API_ROUTES } from "./api_routes";
import { USER_STATUS, type UserStatus } from "../types/users";

export function replaceRouteId(route: string, id: string | number): string {
  return route.replace("{id}", String(id));
}

export function getUserRestoreEndpoint(userId: number): string {
  return replaceRouteId(API_ROUTES.USER_RESTORE, userId);
}

export function getUserEditEndpoint(userId: number): string {
  return replaceRouteId(API_ROUTES.USERS_EDIT, userId);
}

export function getUserStatusToggleEndpoint(userId: number, currentStatus: UserStatus): string {
  const endpoint = currentStatus === USER_STATUS.ACTIVO ? API_ROUTES.USER_BLOCK : API_ROUTES.USER_UNBLOCK;
  return replaceRouteId(endpoint, userId);
}

export function generateDefaultPassword(dni: string): string {
  return `Fast${dni.slice(-4)}`;
}

export function getFeedbackDeleteEndpoint(feedbackId: number): string {
  return API_ROUTES.FEEDBACK_DELETE.replace("{feedback_id}", String(feedbackId));
}

export function getCompanyUpdateEndpoint(companyId: number): string {
  return API_ROUTES.COMPANY_UPDATE.replace("{company_id}", String(companyId));
}

export function getEspecialidadEditEndpoint(especialidadId: number): string {
  return API_ROUTES.EDIT_ESPECIALIDADES.replace("{especialidad_id}", String(especialidadId));
}

export function getEspecialidadStatusToggleEndpoint(
  especialidadId: number,
  currentStatus: number
): string {
  const endpoint =
    currentStatus === 1
      ? API_ROUTES.ESPECIALIDADES_BLOCK
      : API_ROUTES.ESPECIALIDADES_UNBLOCK;
  return endpoint.replace("{especialidad_id}", String(especialidadId));
}

export function getProfesionalEspecialidadUpdateEndpoint(asignacionId: number): string {
  return API_ROUTES.UPDATE_PROFESIONAL_ESPECIALIDAD.replace("{asignacion_id}", String(asignacionId));
}

export function getProfesionalEspecialidadDeleteEndpoint(asignacionId: number): string {
  return API_ROUTES.DELETE_PROFESIONAL_ESPECIALIDAD.replace("{asignacion_id}", String(asignacionId));
}

