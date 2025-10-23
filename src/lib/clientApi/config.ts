import { config, slugs } from "../config";


export const CLIENT_API = {

  // NOTIFICACIONES PUSH
  NOTIFICATION_GET_VAPID: `${config.apiUrl}/${slugs.customersApi}/notifications/vapid-public-key`,
  NOTIFICATION_SUBSCRIBE: `${config.apiUrl}/${slugs.customersApi}/notifications/register-token`,
  NOTIFICATION_UNSUBSCRIBE: `${config.apiUrl}/${slugs.customersApi}/notifications/unregister-token`,
  NOTIFICATION_UNSUBSCRIBE_SPECIFIC: `${config.apiUrl}/${slugs.customersApi}/notifications/unregister-specific-token`,
  NOTIFICATION_UNSUBSCRIBE_ALL_DEVICES: `${config.apiUrl}/${slugs.customersApi}/notifications/unregister-token`,

  GET_RECLAMOS: `${config.apiUrl}/${slugs.customersApi}/reclamos`,
  GET_LOGS: `${config.apiUrl}/${slugs.customersApi}/globalLogs`,
  LOGS_READ: `${config.apiUrl}/${slugs.customersApi}/globalLogs/read`,
  LOGS_NOT_READ: `${config.apiUrl}/${slugs.customersApi}/globalLogs/unread`,
  LOG_DELETE: `${config.apiUrl}/${slugs.customersApi}/globalLogs`,



  GET_USERS: `${config.apiUrl}/${slugs.customersApi}/users`,
  USERS_CREATE: `${config.apiUrl}/${slugs.customersApi}/users`,
  USERS_EDIT: `${config.apiUrl}/${slugs.customersApi}/users/{id}`,
  USER_BLOCK: `${config.apiUrl}/${slugs.customersApi}/users/block/{id}`,
  USER_UNBLOCK: `${config.apiUrl}/${slugs.customersApi}/users/unblock/{id}`,
  USER_RESTORE: `${config.apiUrl}/${slugs.customersApi}/users/restore/{id}`,



  GET_ESPECIALIDADES: `${config.apiUrl}/${slugs.customersApi}/especialidades`,
  CREATE_ESPECIALIDADES: `${config.apiUrl}/${slugs.customersApi}/especialidades`,
  EDIT_ESPECIALIDADES: `${config.apiUrl}/${slugs.customersApi}/especialidades/{id_especialidad}`,
  ENABLE_ESPECIALIDADES: `${config.apiUrl}/${slugs.customersApi}/especialidades/unblock/{especialidadId}`,
  DISABLE_ESPECIALIDADES: `${config.apiUrl}/${slugs.customersApi}/especialidades/block/{especialidadId}`,

  CREAR_ASIGNACION_ESPECIALIDAD: `${config.apiUrl}/${slugs.customersApi}/profesionalEspecialidad`,
  GET_ASIGNACIONES: `${config.apiUrl}/${slugs.customersApi}/asignaciones`,
  EDITAR_ASIGNACION_ESPECIALIDAD: `${config.apiUrl}/${slugs.customersApi}/profesionalEspecialidad/{id_asignacion}`,
  ELIMINAR_ASIGNACION_ESPECIALIDAD: `${config.apiUrl}/${slugs.customersApi}/profesionalEspecialidad/{id_asignacion}`,


  PROFESIONAL_DESCARGA: `${config.apiUrl}/${slugs.customersApi}/vistas/profesionales`,
  RECLAMO_DESCARGA: `${config.apiUrl}/${slugs.customersApi}/vistas/reclamos/{type}`,


  GET_CLIENTES: `${config.apiUrl}/${slugs.customersApi}/clientes-recurrentes`,
  CREATE_CLIENTE: `${config.apiUrl}/${slugs.customersApi}/clientes-recurrentes`,
  UPDATE_CLIENTE: `${config.apiUrl}/${slugs.customersApi}/clientes-recurrentes/{cliente_id}`,
  ACTIVAR_CLIENTE: `${config.apiUrl}/${slugs.customersApi}/clientes-recurrentes/unblock/{cliente_id}`,
  DESACTIVAR_CLIENTE: `${config.apiUrl}/${slugs.customersApi}/clientes-recurrentes/block/{cliente_id}`,


  RECLAMO_GESTION_ADMIN: `${config.apiUrl}/${slugs.customersApi}/reclamos/gestion/{id}`,


  HABILITAR_FILA: `${config.apiUrl}/${slugs.customersApi}/workload/enable`,
  DESHABILITAR_FILA: `${config.apiUrl}/${slugs.customersApi}/workload/disable`,

  GET_RECLAMOS_PROFESIONAL: `${config.apiUrl}/${slugs.customersApi}/reclamos/profesional`,
  GET_RECLAMO_GESTION_PROFESIONAL: `${config.apiUrl}/${slugs.customersApi}/reclamos/profesional/gestion/{id}`,
  RECLAMO_GESTION_PROFESIONAL: `${config.apiUrl}/${slugs.customersApi}/reclamos/profesional/gestion/{id}`,


  UPDATE_COMPANY: `${config.apiUrl}/${slugs.customersApi}/company`, 
  UPDATE_COMPANY_CONFIG: `${config.apiUrl}/${slugs.customersApi}/company/config`,
  FEEDBACK: `${config.apiUrl}/${slugs.customersApi}/platform/feedback`,
  COMPANY_CONFIG: `${config.apiUrl}/${slugs.customersApi}/company/config`,
  ESTADO_PROFESIONAL: `${config.apiUrl}/${slugs.customersApi}/workload/estado`,


  DELETE_MENSAJE_PLATFORM: `${config.apiUrl}/${slugs.customersApi}/platform/messages/{platform_message_id}`,
  
  CREATE_MENSAJE_PLATFORM_FOR_COMPANY: `${config.apiUrl}/${slugs.customersApi}/platform/messages`, 
  CREATE_MENSAJE_PLATFORM_FOR_USER: `${config.apiUrl}/${slugs.customersApi}/platform/messages/user/{user_id}`, 
  
  GET_MESSAGES_PLATFORM: `${config.apiUrl}/${slugs.customersApi}/platform/messages`, 
  DELETE_MESSAGE_PLATFORM: `${config.apiUrl}/${slugs.customersApi}/platform/single-message/{platform_message_id}`, 
  MARK_AS_READ_MESSAGE_PLATFORM: `${config.apiUrl}/${slugs.customersApi}/platform/message/read/{specific_message_id}`,
  MARK_AS_UNREAD_MESSAGE_PLATFORM: `${config.apiUrl}/${slugs.customersApi}/platform/message/unread/{specific_message_id}`, 


  // gestion de banner
  GET_BANNER_CLIENT: `${config.apiUrl}/${slugs.customersApi}/active-banner`, // GET trae el banner activo para el sitio

};