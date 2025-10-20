import { config, slugs } from "../config";

export const SUPER_API = {

  GET_COMPANIES: `${config.apiUrl}/${slugs.superApi}/companies`,

  GET_RECLAMOS: `${config.apiUrl}/${slugs.superApi}/reclamos`,
  GET_LOGS: `${config.apiUrl}/${slugs.superApi}/globalLogs`,

  COMPANY_CREATE: `${config.apiUrl}/${slugs.superApi}/companies`,
  COMPANY_EDIT: `${config.apiUrl}/${slugs.superApi}/companies/{id}`,

  GET_USERS: `${config.apiUrl}/${slugs.superApi}/users`,
  USERS_CREATE: `${config.apiUrl}/${slugs.superApi}/users`,
  USERS_EDIT: `${config.apiUrl}/${slugs.superApi}/users/{id}`,
  USER_BLOCK: `${config.apiUrl}/${slugs.superApi}/users/block/{id}`,
  USER_UNBLOCK: `${config.apiUrl}/${slugs.superApi}/users/unblock/{id}`,
  USER_RESTORE: `${config.apiUrl}/${slugs.superApi}/users/restore/{id}`,

  GET_CLIENTES: `${config.apiUrl}/${slugs.superApi}/clientes-recurrentes`,
  ACTIVAR_CLIENTE: `${config.apiUrl}/${slugs.superApi}/clientes-recurrentes/unblock/{cliente_id}`,
  DESACTIVAR_CLIENTE: `${config.apiUrl}/${slugs.superApi}/clientes-recurrentes/block/{cliente_id}`,
  GET_ESPECIALIDADES: `${config.apiUrl}/${slugs.superApi}/especialidades`,
  CREATE_ESPECIALIDADES: `${config.apiUrl}/${slugs.superApi}/especialidades`,
  EDIT_ESPECIALIDADES: `${config.apiUrl}/${slugs.superApi}/especialidades/{id_especialidad}`,
  ENABLE_ESPECIALIDADES: `${config.apiUrl}/${slugs.superApi}/especialidades/unblock/{especialidadId}`,
  DISABLE_ESPECIALIDADES: `${config.apiUrl}/${slugs.superApi}/especialidades/block/{especialidadId}`,





};
