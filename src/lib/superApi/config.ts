import { config, slugs } from "../config";

export const SUPER_API = {

  GET_COMPANIES: `${config.apiUrl}/${slugs.superApi}/companies`, // traer todas las empresas

  GET_RECLAMOS: `${config.apiUrl}/${slugs.superApi}/reclamos`, // trae todos los reclamos
  GET_LOGS: `${config.apiUrl}/${slugs.superApi}/globalLogs`, // trae todos los logs

  // gestion de empresa
  COMPANY_CREATE: `${config.apiUrl}/${slugs.superApi}/companies`, //  crea una nueva empresa
  COMPANY_EDIT: `${config.apiUrl}/${slugs.superApi}/companies/{id}`, //  Edita una empresa

  // Gestion de usuarios
  GET_USERS: `${config.apiUrl}/${slugs.superApi}/users`, // traer todos los usuarios
  USERS_CREATE: `${config.apiUrl}/${slugs.superApi}/users`, //  crea un usuario nuevo (requiere empresa)
  USERS_EDIT: `${config.apiUrl}/${slugs.superApi}/users/{id}`, //  edita un usuario
  USER_BLOCK: `${config.apiUrl}/${slugs.superApi}/users/block/{id}`, //  Bloquea un usuario
  USER_UNBLOCK: `${config.apiUrl}/${slugs.superApi}/users/unblock/{id}`, //  Desbloquea un usuario
  USER_RESTORE: `${config.apiUrl}/${slugs.superApi}/users/restore/{id}`, //  cambia la contraseña del usuario


  // gestion especialidades
  GET_ESPECIALIDADES: `${config.apiUrl}/${slugs.superApi}/especialidades`, // traer todas las especialidades
  CREATE_ESPECIALIDADES: `${config.apiUrl}/${slugs.superApi}/especialidades`, // crea una especialidad
  EDIT_ESPECIALIDADES: `${config.apiUrl}/${slugs.superApi}/especialidades/{id_especialidad}`, // edita una especialidad
  ENABLE_ESPECIALIDADES: `${config.apiUrl}/${slugs.superApi}/especialidades/unblock/{especialidadId}`, //  activa una especialidad
  DISABLE_ESPECIALIDADES: `${config.apiUrl}/${slugs.superApi}/especialidades/block/{especialidadId}`, //  desactiva una especialidad





};
