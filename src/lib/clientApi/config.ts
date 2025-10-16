import { config, slugs } from "../config";


export const CLIENT_API = {
  GET_CLIENTES: `${config.apiUrl}/${slugs.customersApi}/clientes-recurrentes`, // trae todos los clientes recurrentes
  GET_RECLAMOS: `${config.apiUrl}/${slugs.customersApi}/reclamos`, // trae todos los reclamos
  GET_LOGS: `${config.apiUrl}/${slugs.customersApi}/globalLogs`, // trae todos los logs
  LOGS_READ: `${config.apiUrl}/${slugs.customersApi}/globalLogs/read`, // marca logs  como leidos
  LOGS_NOT_READ: `${config.apiUrl}/${slugs.customersApi}/globalLogs/unread`, // marca logs  como no leidos
  LOG_DELETE: `${config.apiUrl}/${slugs.customersApi}/globalLogs`, // elimina logs



  // Gestion de usuarios
  GET_USERS: `${config.apiUrl}/${slugs.customersApi}/users`, // traer todas los usuarios
  USERS_CREATE: `${config.apiUrl}/${slugs.customersApi}/users`, //  crea un usuario nuevo (requiere empresa)
  USERS_EDIT: `${config.apiUrl}/${slugs.customersApi}/users/{id}`, //  edita un usuario
  USER_BLOCK: `${config.apiUrl}/${slugs.customersApi}/users/block/{id}`, //  Bloquea un usuario
  USER_UNBLOCK: `${config.apiUrl}/${slugs.customersApi}/users/unblock/{id}`, //  Desbloquea un usuario
  USER_RESTORE: `${config.apiUrl}/${slugs.customersApi}/users/restore/{id}`, //  cambia la contraseña del usuario



  // gestion especialidades owner
  GET_ESPECIALIDADES: `${config.apiUrl}/${slugs.customersApi}/especialidades`, // traer todas las especialidades
  CREATE_ESPECIALIDADES: `${config.apiUrl}/${slugs.customersApi}/especialidades`, // crea una especialidad
  EDIT_ESPECIALIDADES: `${config.apiUrl}/${slugs.customersApi}/especialidades/{id_especialidad}`, // edita una especialidad
  ENABLE_ESPECIALIDADES: `${config.apiUrl}/${slugs.customersApi}/especialidades/unblock/{especialidadId}`, //  activa una especialidad
  DISABLE_ESPECIALIDADES: `${config.apiUrl}/${slugs.customersApi}/especialidades/block/{especialidadId}`, //  desactiva una especialidad

  // gestion asignacion especialidad
  CREAR_ASIGNACION_ESPECIALIDAD: `${config.apiUrl}/${slugs.customersApi}/profesionalEspecialidad`, // asigna una especialidad a un profesional
  GET_ASIGNACIONES: `${config.apiUrl}/${slugs.customersApi}/asignaciones`, // obtiene todas las asignaciones de la empresa
  EDITAR_ASIGNACION_ESPECIALIDAD: `${config.apiUrl}/${slugs.customersApi}/profesionalEspecialidad/{id_asignacion}`, // edita una asignacion de especialidad
  ELIMINAR_ASIGNACION_ESPECIALIDAD: `${config.apiUrl}/${slugs.customersApi}/profesionalEspecialidad/{id_asignacion}`, // elimina una asignacion de especialidad


  // REPORTES EXTRACCION
  // Gestion profesionales
  PROFESIONAL_DESCARGA: `${config.apiUrl}/${slugs.customersApi}/vistas/profesionales`, // descarga reporte de profesionales
  RECLAMO_DESCARGA: `${config.apiUrl}/${slugs.customersApi}/vistas/reclamos/{type}`, // descarga reporte de reclamos (active, inactive, all)



  // Gestion de reclamos owner/operador
  RECLAMO_GESTION_ADMIN: `${config.apiUrl}/${slugs.customersApi}/reclamos/gestion/{id}`, // gestiona reclamo


  // PERFIL PROFESIONAL
  // Acciones profesional
  HABILITAR_FILA: `${config.apiUrl}/${slugs.customersApi}/workload/enable`, // Al ejecutar este endpoint, se cambia a true
  DESHABILITAR_FILA: `${config.apiUrl}/${slugs.customersApi}/workload/disable`, // Al ejecutar este endpoint, se cambia a false

  // Gestion de reclamos profesional
  GET_RECLAMOS_PROFESIONAL: `${config.apiUrl}/${slugs.customersApi}/reclamos/profesional`, // trae todos los reclamos del profesional
  GET_RECLAMO_GESTION_PROFESIONAL: `${config.apiUrl}/${slugs.customersApi}//reclamos/profesional/gestion/{id}`, // trae todos los reclamos del profesional
  RECLAMO_GESTION_PROFESIONAL: `${config.apiUrl}/${slugs.customersApi}/reclamos/profesional/gestion/{id}`, // gestiona reclamo


  // General
  FEEDBACK: `${config.apiUrl}/${slugs.customersApi}/platform/feedback`, // Endpoint de feedback para users (todos menos superadmin)
  COMPANY_CONFIG: `${config.apiUrl}/${slugs.customersApi}/company/config`, // endpoint para obtener headings y algunas configuraciones
  ESTADO_PROFESIONAL: `${config.apiUrl}/${slugs.customersApi}/workload/estado`, // se obtiene el estado del profeisonal para recibir o no
};
