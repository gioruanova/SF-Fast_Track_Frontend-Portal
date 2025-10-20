import { config, slugs } from "../config";


export const CLIENT_API = {
  GET_RECLAMOS: `${config.apiUrl}/${slugs.customersApi}/reclamos`,
  GET_LOGS: `${config.apiUrl}/${slugs.customersApi}/globalLogs`,
  LOGS_READ: `${config.apiUrl}/${slugs.customersApi}/globalLogs/read`,
  LOGS_NOT_READ: `${config.apiUrl}/${slugs.customersApi}/globalLogs/unread`,
  LOG_DELETE: `${config.apiUrl}/${slugs.customersApi}/globalLogs`,



  // gestion de usuarios
  GET_USERS: `${config.apiUrl}/${slugs.customersApi}/users`,
  USERS_CREATE: `${config.apiUrl}/${slugs.customersApi}/users`,
  USERS_EDIT: `${config.apiUrl}/${slugs.customersApi}/users/{id}`,
  USER_BLOCK: `${config.apiUrl}/${slugs.customersApi}/users/block/{id}`,
  USER_UNBLOCK: `${config.apiUrl}/${slugs.customersApi}/users/unblock/{id}`,
  USER_RESTORE: `${config.apiUrl}/${slugs.customersApi}/users/restore/{id}`,



  // gestion especialidades owner
  GET_ESPECIALIDADES: `${config.apiUrl}/${slugs.customersApi}/especialidades`,
  CREATE_ESPECIALIDADES: `${config.apiUrl}/${slugs.customersApi}/especialidades`,
  EDIT_ESPECIALIDADES: `${config.apiUrl}/${slugs.customersApi}/especialidades/{id_especialidad}`,
  ENABLE_ESPECIALIDADES: `${config.apiUrl}/${slugs.customersApi}/especialidades/unblock/{especialidadId}`,
  DISABLE_ESPECIALIDADES: `${config.apiUrl}/${slugs.customersApi}/especialidades/block/{especialidadId}`,

  // gestion asignacion especialidad
  CREAR_ASIGNACION_ESPECIALIDAD: `${config.apiUrl}/${slugs.customersApi}/profesionalEspecialidad`,
  GET_ASIGNACIONES: `${config.apiUrl}/${slugs.customersApi}/asignaciones`,
  EDITAR_ASIGNACION_ESPECIALIDAD: `${config.apiUrl}/${slugs.customersApi}/profesionalEspecialidad/{id_asignacion}`,
  ELIMINAR_ASIGNACION_ESPECIALIDAD: `${config.apiUrl}/${slugs.customersApi}/profesionalEspecialidad/{id_asignacion}`,


  // reportes extraccion
  // gestion profesionales
  PROFESIONAL_DESCARGA: `${config.apiUrl}/${slugs.customersApi}/vistas/profesionales`,
  RECLAMO_DESCARGA: `${config.apiUrl}/${slugs.customersApi}/vistas/reclamos/{type}`,


  // gestion de clientes recurrentes
  GET_CLIENTES: `${config.apiUrl}/${slugs.customersApi}/clientes-recurrentes`,
  CREATE_CLIENTE: `${config.apiUrl}/${slugs.customersApi}/clientes-recurrentes`,
  UPDATE_CLIENTE: `${config.apiUrl}/${slugs.customersApi}/clientes-recurrentes/{cliente_id}`,
  ACTIVAR_CLIENTE: `${config.apiUrl}/${slugs.customersApi}/clientes-recurrentes/unblock/{cliente_id}`,
  DESACTIVAR_CLIENTE: `${config.apiUrl}/${slugs.customersApi}/clientes-recurrentes/block/{cliente_id}`,


  // gestion de reclamos owner/operador
  RECLAMO_GESTION_ADMIN: `${config.apiUrl}/${slugs.customersApi}/reclamos/gestion/{id}`,


  // perfil profesional
  // acciones profesional
  HABILITAR_FILA: `${config.apiUrl}/${slugs.customersApi}/workload/enable`,
  DESHABILITAR_FILA: `${config.apiUrl}/${slugs.customersApi}/workload/disable`,

  // gestion de reclamos profesional
  GET_RECLAMOS_PROFESIONAL: `${config.apiUrl}/${slugs.customersApi}/reclamos/profesional`,
  GET_RECLAMO_GESTION_PROFESIONAL: `${config.apiUrl}/${slugs.customersApi}//reclamos/profesional/gestion/{id}`,
  RECLAMO_GESTION_PROFESIONAL: `${config.apiUrl}/${slugs.customersApi}/reclamos/profesional/gestion/{id}`,


  // gestion empresa (owner)
  UPDATE_COMPANY: `${config.apiUrl}/${slugs.customersApi}/company`, // PUT edita informacion parcial de la empresa (solo owner)
  UPDATE_COMPANY_CONFIG: `${config.apiUrl}/${slugs.customersApi}/company/config`, // PUT edita configuracion de la empresa


  // general
  FEEDBACK: `${config.apiUrl}/${slugs.customersApi}/platform/feedback`,
  COMPANY_CONFIG: `${config.apiUrl}/${slugs.customersApi}/company/config`,
  ESTADO_PROFESIONAL: `${config.apiUrl}/${slugs.customersApi}/workload/estado`,
};
