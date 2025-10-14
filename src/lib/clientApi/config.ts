import { config, slugs } from "../config";


export const CLIENT_API = {
  GET_USERS: `${config.apiUrl}/${slugs.customersApi}/users`, // traer todas los usuarios
  GET_ESPECIALIDADES: `${config.apiUrl}/${slugs.customersApi}/especialidades`, // traer todas las especialidades
  GET_CLIENTES: `${config.apiUrl}/${slugs.customersApi}/clientes-recurrentes`, // trae todos los clientes recurrentes
  GET_RECLAMOS: `${config.apiUrl}/${slugs.customersApi}/reclamos`, // trae todos los reclamos
  GET_LOGS: `${config.apiUrl}/${slugs.customersApi}/globalLogs`, // trae todos los logs
  LOGS_READ: `${config.apiUrl}/${slugs.customersApi}/globalLogs/read`, // marca logs  como leidos
  LOGS_NOT_READ: `${config.apiUrl}/${slugs.customersApi}/globalLogs/unread`, // marca logs  como no leidos
  LOG_DELETE: `${config.apiUrl}/${slugs.customersApi}/globalLogs`, // elimina logs
  
  
  // Gestion de reclamos owner/operador
  RECLAMO_GESTION_ADMIN: `${config.apiUrl}/${slugs.customersApi}/reclamos/gestion/{id}`, // gestiona reclamo

  // Gestion de reclamos profesional
  RECLAMO_GESTION_PROFESIONAL: `${config.apiUrl}/${slugs.customersApi}/reclamos/profesional/gestion/{id}`, // gestiona reclamo

  FEEDBACK: `${config.apiUrl}/${slugs.customersApi}/platform/feedback`, // Endpoint de feedback para users (todos menos superadmin)
  COMPANY_CONFIG: `${config.apiUrl}/${slugs.customersApi}/company/config`, // endpoint para obtener headings y algunas configuraciones
  ESTADO_PROFESIONAL: `${config.apiUrl}/${slugs.customersApi}/workload/estado`, // se obtiene el estado del profeisonal para recibir o no
  HABILITAR_FILA: `${config.apiUrl}/${slugs.customersApi}/workload/enable`, // Al ejecutar este endpoint, se cambia a true
  DESHABILITAR_FILA: `${config.apiUrl}/${slugs.customersApi}/workload/disable`, // Al ejecutar este endpoint, se cambia a false

  
};
