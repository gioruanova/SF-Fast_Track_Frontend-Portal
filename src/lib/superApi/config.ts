import { config, slugs } from "../config";

export const SUPER_API = {
  GET_USERS: `${config.apiUrl}/${slugs.superApi}/users`, // traer todos los usuarios
  GET_COMPANIES: `${config.apiUrl}/${slugs.superApi}/companies`, // traer todas las empresas
  GET_ESPECIALIDADES: `${config.apiUrl}/${slugs.superApi}/especialidades`, // traer todas las especialidades
  GET_RECLAMOS: `${config.apiUrl}/${slugs.superApi}/reclamos`, // trae todos los reclamos
  GET_LOGS: `${config.apiUrl}/${slugs.superApi}/globalLogs`, // trae todos los logs
  
  // gestion de empresa
  COMPANY_CREATE: `${config.apiUrl}/${slugs.superApi}/companies`, // POST crea una nueva empresa
  COMPANY_EDIT: `${config.apiUrl}/${slugs.superApi}/companies/{id}`, // PUT Edita una empresa


// Gestion de usuarios
USERS_CREATE: `${config.apiUrl}/${slugs.superApi}/users`, // POST crea un usuario nuevo (requiere empresa)
// {
  //   "user_complete_name": "Juanito nueva empresa",
//   "user_dni": "1234561",
//   "user_phone": "1234567890",
//   "user_email": "sasssa@example.com",
//   "user_role": "operador",
//   "company_id": 1001,
//   "user_password": "123456"
// }
// la empresa debe venir de un dropdown "id - nombre"
// el rol es enum: "owner", "operador", "profesional"



USERS_EDIT: `${config.apiUrl}/${slugs.superApi}/users/{id}`, // PUT edita un usuario
// {
//   "user_complete_name": "Juanito Perez Empresa sasa"
// //   ,
// //   "user_dni": "123456"
// //   ,
// //   "user_phone": "1234567890"
// //   ,
// //   "user_email": "sasa@example.com"
// //   ,
// //   "user_role": "owner"
// //   ,
// //   "company_id": 1001
// //   ,
// //   "user_password": "123456"
// }

USER_BLOCK: `${config.apiUrl}/${slugs.superApi}/users/block/{id}`, // POST Bloquea un usuario
USER_UNBLOCK: `${config.apiUrl}/${slugs.superApi}/users/unblock/{id}`, // POST Desbloquea un usuario
USER_RESTORE: `${config.apiUrl}/${slugs.superApi}/users/restore/{id}`, // PUT cambia la contraseña del usuario
// {
//   "new_password":"789789"
// }

};
