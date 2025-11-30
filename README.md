# Fast Track Frontend - Portal Clientes

Aplicación web para gestión de incidencias y tareas

Proyecto Seminario Final de Carrera

Desarrollo por Jorge Ruanova

---

## Arquitectura General

La aplicación es un sistema de gestión de reclamos/incidencias con múltiples roles de usuario (owner, operador, superadmin, profesional). Está construida con Next.js 15 y React 19, siguiendo una arquitectura en capas:

- **Entrada** --> `AuthFlow` verifica sesión --> Si no hay sesión, redirige a login
- **Autentiicación** --> `AuthProvider` maneja login/logout --> Valida rol del usuario --> Redirige al dashboard correspondiente
- **Routing** --> `RouteGuard` valida permisos por rol --> Controla acceso a páginas según permisos
- **Páginas** --> Cada rol tiene sus páginas específicas --> Comparten componentes comunes (reclamos, usuarios, etc.)
- **Componentes** --> Sheets (paneles deslizantes) para formularios --> Forms para crear/editar --> Componentes compartidos (estadísticas, etc.)
- **Hooks** --> Lógica de negocio encapsulada --> `useReclamos`, `useUsers`, `useEspecialidades`, etc. --> Manejan estado y llamadas a API
- **Datos** --> `apiClient` (axios) --> `API_ROUTES` centralizado --> Backend que decide datos según rol

**Flujo típico:** Página --> Componente --> Hook --> apiClient --> API del backend

---

## Funcionamiento de Componentes (Estimado)

- **Flujo inicial:** `AuthFlow` verifica sesión --> Si no hay, va a login --> Si hay, redirige al dashboard según rol
- **Páginas:** Cada página tiene listados, botones de acción, y sheets para detalles/formularios
- **Sheets:** Paneles deslizantes para formularios y detalles (más fluido que modales)
- **Hooks:** Manejan la lógica (cargar datos, validar, preparar requests) --> Ejemplo: `useCreateReclamo` carga clientes/especialidades y valida horarios
- **Componentes compartidos:** Como `CompanyStatsOverview` que se usa en varios dashboards
- **Reutilización:** Componentes como `UserForm` sirven para crear y editar (solo cambia según props)

---

## Forma de Ejecución

### 1. Instalar Dependencias

Primero necesitás instalar las dependencias:

```bash
npm install
```

### 2. Configurar Variables de Entorno

La app necesita estas variables de entorno para funcionar:

**NEXT_PUBLIC_API_URL_PROD** - URL del backend en producción
Ejemplo: `https://api.tudominio.com`

**NEXT_PUBLIC_API_URL_DEV** - URL del backend en desarrollo (opcional)
Ejemplo: `http://localhost:8888`

**NEXT_PUBLIC_ENVIRONMENT** - Indica si estás en desarrollo o producción
Valores: `"dev"` o no poner nada (para producción)

Para configurarlas, creá un archivo `.env.local` en la raíz del proyecto:

```
NEXT_PUBLIC_API_URL_PROD=https://api.tudominio.com
NEXT_PUBLIC_API_URL_DEV=http://localhost:8888
NEXT_PUBLIC_ENVIRONMENT=dev
```

**Importante:** Las variables que empiezan con `NEXT_PUBLIC_` son públicas y se exponen al cliente. No pongas información sensible ahí. Si no configurás estas variables, la app intenta usar `http://localhost:8888` por defecto, pero probablemente no funcione bien en producción.

### 3. Desarrollo

Para correr la app en modo desarrollo:

```bash
npm run dev
```

Esto levanta el servidor de desarrollo con Turbopack (que es más rápido que el webpack tradicional). Por defecto corre en `http://localhost:3000`. Turbopack está bastante bueno, la verdad.

### 4. Build

Para hacer el build de producción:

```bash
npm run build
```

El build se hace con Next.js que optimiza todo automáticamente: compila TypeScript, optimiza imágenes, genera páginas estáticas, minifica el código y crea el bundle optimizado. El resultado queda en la carpeta `.next/`. No hace falta tocar nada, Next.js se encarga de todo.

### 5. Producción

Después del build, para correrlo en producción:

```bash
npm start
```

O podés deployar en Vercel/Netlify que detectan Next.js automáticamente.

### 6. Linting

Si querés verificar que el código esté bien:

```bash
npm run lint
```

---

## Dependencias

Las dependencias principales son:

**Framework y Core:**
- Next.js 15.5.4 (el framework principal)
- React 19.1.0 (la librería de UI)
- TypeScript 5 (para tipado estático)

**UI y Componentes:**
- Radix UI (componentes accesibles como dialogs, dropdowns, etc.)
- Tailwind CSS 4 (para estilos)
- Lucide React (iconos)
- Recharts (para gráficos)

**Utilidades:**
- Axios (para las llamadas HTTP)
- date-fns (para manejo de fechas)
- jwt-decode (para decodificar tokens JWT)
- Sonner (para notificaciones toast)

**Mapas:**
- Leaflet y React Leaflet (para mostrar mapas cuando se necesita)

---

## Notas Adicionales

- La app usa cookies para mantener la sesión (por eso el `credentials: 'include'` en las requests)
- El backend decide qué datos devolver según el rol del usuario autenticado. Es bastante inteligente.
- Los componentes están organizados por feature (reclamos, usuarios, especialidades, etc.). Está bastante ordenado.
- Hay documentación de diagramas en la carpeta `docs/` si querés entender mejor la arquitectura. Los diagramas están bastante claros.

Si tenés dudas o encontrás algún bug, avisá. La app está en desarrollo activo así que puede haber cosas que cambien. No te asustes si algo se rompe de repente.
