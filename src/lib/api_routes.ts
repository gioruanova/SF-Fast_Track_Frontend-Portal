import { config } from "./config";

export const API_ROUTES = {
  LOGIN: `${config.apiUrl}/login`,
  REFRESH: `${config.apiUrl}/refresh`,
  LOGOUT: `${config.apiUrl}/logout`,

  PROFILE: `${config.apiUrl}/profile`,


  GET_USERS: `${config.apiUrl}/users`,
  USERS_CREATE: `${config.apiUrl}/users`,
  USERS_EDIT: `${config.apiUrl}/users/{id}`,
  USER_BLOCK: `${config.apiUrl}/users/{id}/block`,
  USER_UNBLOCK: `${config.apiUrl}/users/{id}/unblock`,
  USER_RESTORE: `${config.apiUrl}/users/{id}/restore`,

  GET_COMPANIES: `${config.apiUrl}/companies`,
  COMPANY_UPDATE_OWNER: `${config.apiUrl}/companies`,
  COMPANY_GET_BY_ID: `${config.apiUrl}/companies/{company_id}`,
  COMPANY_CREATE: `${config.apiUrl}/companies`,
  COMPANY_UPDATE: `${config.apiUrl}/companies/{company_id}`,
  COMPANY_CONFIG: `${config.apiUrl}/companies/config`,
  COMPANY_CONFIG_UPDATE: `${config.apiUrl}/companies/config`,

  GET_ESPECIALIDADES: `${config.apiUrl}/especialidades`,
  GET_ESPECIALIDADES_BY_COMPANY: `${config.apiUrl}/especialidades/{company_id}`,
  CREATE_ESPECIALIDADES: `${config.apiUrl}/especialidades`,
  EDIT_ESPECIALIDADES: `${config.apiUrl}/especialidades/{especialidad_id}`,
  ESPECIALIDADES_BLOCK: `${config.apiUrl}/especialidades/{especialidad_id}/block`,
  ESPECIALIDADES_UNBLOCK: `${config.apiUrl}/especialidades/{especialidad_id}/unblock`,

  GET_FEEDBACKS: `${config.apiUrl}/feedback`,
  FEEDBACK_CREATE: `${config.apiUrl}/feedback`,
  FEEDBACK_DELETE: `${config.apiUrl}/feedback/{feedback_id}`,

  GET_PROFESIONAL_ESPECIALIDAD: `${config.apiUrl}/profesional-especialidad`,
  CREATE_PROFESIONAL_ESPECIALIDAD: `${config.apiUrl}/profesional-especialidad`,
  UPDATE_PROFESIONAL_ESPECIALIDAD: `${config.apiUrl}/profesional-especialidad/{asignacion_id}`,
  DELETE_PROFESIONAL_ESPECIALIDAD: `${config.apiUrl}/profesional-especialidad/{asignacion_id}`,

  GET_CLIENTES_RECURRENTES: `${config.apiUrl}/clientes-recurrentes`,
  CREATE_CLIENTE_RECURRENTE: `${config.apiUrl}/clientes-recurrentes`,
  UPDATE_CLIENTE_RECURRENTE: `${config.apiUrl}/clientes-recurrentes/{cliente_id}`,
  BLOCK_CLIENTE_RECURRENTE: `${config.apiUrl}/clientes-recurrentes/block/{cliente_id}`,
  UNBLOCK_CLIENTE_RECURRENTE: `${config.apiUrl}/clientes-recurrentes/unblock/{cliente_id}`,

  GET_RECLAMOS: `${config.apiUrl}/reclamos`,
  GET_RECLAMO_BY_ID: `${config.apiUrl}/reclamos/{id}`,
  GET_AGENDA_BLOQUEADA: `${config.apiUrl}/agenda-reclamo`,
  CREAR_RECLAMO: `${config.apiUrl}/reclamos`,
  ACTUALIZAR_RECLAMO: `${config.apiUrl}/reclamos/{id}`,
  RECLAMO_DESCARGA: `${config.apiUrl}/reclamos/export/{type}`,
  ENVIAR_RECORDATORIO_RECLAMO: `${config.apiUrl}/reclamos/{reclamo_id}/recordatorio`,
};

