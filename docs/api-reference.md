# API Reference

Documentación de la API: https://fast-track-api.up.railway.app/api-docs/

## Endpoints disponibles

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrarse
- `GET /api/auth/profile` - Obtener perfil del usuario
- `POST /api/auth/refresh` - Renovar token

### Banners
- `GET /api/superadmin/banners` - Obtener todos los banners (superadmin)
- `POST /api/superadmin/banners` - Crear banner
- `PUT /api/superadmin/banners/{id}` - Editar banner
- `DELETE /api/superadmin/banners/{id}` - Eliminar banner
- `POST /api/superadmin/banners/enable/{id}` - Activar banner
- `POST /api/superadmin/banners/disable/{id}` - Desactivar banner
- `GET /api/customers/active-banner` - Obtener banner activo (usuarios)

### Mensajes
- `GET /api/superadmin/messages` - Mensajes públicos (superadmin)
- `GET /api/customers/messages` - Mensajes de plataforma (usuarios)

### Usuarios
- `GET /api/superadmin/users` - Listar usuarios (superadmin)
- `POST /api/superadmin/users` - Crear usuario
- `PUT /api/superadmin/users/{id}` - Editar usuario
- `DELETE /api/superadmin/users/{id}` - Eliminar usuario

### Empresas
- `GET /api/superadmin/companies` - Listar empresas (superadmin)
- `POST /api/superadmin/companies` - Crear empresa
- `PUT /api/superadmin/companies/{id}` - Editar empresa

### Especialidades
- `GET /api/superadmin/specialties` - Listar especialidades (superadmin)
- `POST /api/superadmin/specialties` - Crear especialidad
- `PUT /api/superadmin/specialties/{id}` - Editar especialidad

### Reclamos
- `GET /api/superadmin/claims` - Listar reclamos (superadmin)
- `GET /api/customers/claims` - Listar reclamos (usuarios)
- `POST /api/customers/claims` - Crear reclamo
- `PUT /api/customers/claims/{id}` - Editar reclamo

## Estructura de respuestas

### Éxito
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

### Error
```json
{
  "error": "Mensaje de error",
  "code": "ERROR_CODE"
}
```

## Códigos de estado HTTP

- `200` - Éxito
- `201` - Creado
- `400` - Error de validación
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `500` - Error interno del servidor

## Autenticación

Todos los endpoints requieren autenticación mediante cookies de sesión.

## Base URL

```
https://fast-track-api.up.railway.app
```
