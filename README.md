<!-- Banner principal -->
<h1 align="center" style="color:#1a73e8; font-size:3rem;">🚀 Fast Track Frontend - Portal Clientes</h1>
<p align="center"><b>Aplicación web para gestión de incidencias y tareas</b></p>
<p align="center">Proyecto Seminario Final de Carrera</p>
<p align="center">Autor: <b>Jorge Ruanova</b></p>

<hr/>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.5-blue" />
  <img src="https://img.shields.io/badge/build-passing-brightgreen" />
  <br/>
  <a href="https://fastrack-portal.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🌐_Demo_en_Vivo-Vercel-black?style=for-the-badge&logo=vercel" />
  </a>
</p>

## 📝 Descripción
Aplicación web progresiva (PWA) para la gestión de incidencias y tareas, desarrollada con Next.js, React y TypeScript. Interfaz moderna y responsive con sistema de autenticación y dashboards personalizados según roles de usuario.

---

## 🚀 Stack Tecnológico

### ⚙️ Framework y desarrollo
| Tecnología   | Descripción                |
|-------------|----------------------------|
| ![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white) | Framework React con SSR |
| ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black) | Librería UI    |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) | Tipado estático |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) | Framework CSS utility-first |

### 🎨 Componentes UI
| Tecnología   | Descripción                |
|-------------|----------------------------|
| ![Radix UI](https://img.shields.io/badge/Radix_UI-161618?logo=radix-ui&logoColor=white) | Componentes accesibles headless |
| ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?logo=shadcnui&logoColor=white) | Componentes reutilizables |
| ![Sonner](https://img.shields.io/badge/Sonner-000000?logo=react&logoColor=white) | Toast notifications elegantes |
| ![Recharts](https://img.shields.io/badge/Recharts-FF6B6B?logo=chart.js&logoColor=white) | Gráficos y visualización de datos |
| ![Embla Carousel](https://img.shields.io/badge/Embla_Carousel-8B5CF6?logo=react&logoColor=white) | Carruseles y sliders |
| ![Lucide Icons](https://img.shields.io/badge/Lucide-F56565?logo=lucide&logoColor=white) | Iconografía moderna |

### 📱 PWA & Funcionalidades
| Tecnología   | Descripción                |
|-------------|----------------------------|
| ![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white) | Progressive Web App |
| ![Service Worker](https://img.shields.io/badge/Service_Worker-4285F4?logo=google-chrome&logoColor=white) | Funcionalidad offline |
| ![Manifest](https://img.shields.io/badge/Manifest-FF6F00?logo=todoist&logoColor=white) | Instalable en dispositivos |

### 🔒 Gestión de estado y autenticación
| Tecnología   | Descripción                |
|-------------|----------------------------|
| ![Context API](https://img.shields.io/badge/Context_API-61DAFB?logo=react&logoColor=black) | Gestión de estado global |
| ![JWT](https://img.shields.io/badge/JWT-000000?logo=json-web-tokens&logoColor=white) | Autenticación con tokens |
| ![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white) | Cliente HTTP |

---

## 📁 Estructura del Proyecto
```
fast-track_frontend/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── dashboard/          # Páginas protegidas por rol
│   │   │   ├── superadmin/     # Dashboard SuperAdmin
│   │   │   ├── owner/          # Dashboard Owner
│   │   │   ├── operador/       # Dashboard Operador
│   │   │   └── profesional/    # Dashboard Profesional
│   │   ├── login/              # Página de autenticación
│   │   └── globals.css         # Estilos globales
│   ├── components/
│   │   ├── auth/               # Componentes de autenticación
│   │   ├── dashboard/          # Dashboards por rol
│   │   ├── features/           # Features específicas
│   │   ├── layout/             # Layout y navegación
│   │   ├── pwa/                # Componentes PWA
│   │   └── ui/                 # Componentes UI reutilizables
│   ├── context/                # React Context providers
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Configuración de APIs
│   └── types/                  # Tipos TypeScript
├── public/
│   ├── assets/                 # Imágenes y recursos
│   ├── icons/                  # Iconos PWA
│   ├── manifest.json           # Web manifest
│   └── sw.js                   # Service Worker
├── .env.local                  # Variables de entorno
└── package.json
```

## 🔐 Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

> ⚠️ **Importante**: Nunca subas este archivo a Git

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:8888
NEXT_PUBLIC_API_CLIENT_URL=http://localhost:8888/client
NEXT_PUBLIC_API_PUBLIC_URL=http://localhost:8888/public
NEXT_PUBLIC_API_SUPER_URL=http://localhost:8888/super

# Configuración de la app
NEXT_PUBLIC_APP_NAME=Fast Track
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## 📜 Comandos Disponibles

### 🚀 Desarrollo
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo en http://localhost:3000 |
| `npm run build` | Genera build de producción |
| `npm start` | Inicia servidor en modo producción |
| `npm run lint` | Ejecuta ESLint para verificar código |

---

## 🧪 Acceso a la aplicación

### 🌐 Demo en Vivo
Prueba la aplicación desplegada en Vercel:
- **🚀 [Fast Track - Demo en Producción](https://fastrack-portal.vercel.app/)**

### 💻 Desarrollo Local
Una vez iniciado el servidor de desarrollo:
- **URL principal**: [http://localhost:3000](http://localhost:3000)
- **Login**: [http://localhost:3000/login](http://localhost:3000/login)


---

## 👥 Roles del Sistema

| Rol | Descripción | Vista Dashboard |
|-----|-------------|-----------------|
| **SuperAdmin** | Administrador del sistema | Panel con gestión de empresas, usuarios globales, estadísticas generales y configuración de plataforma |
| **Owner** | Propietario de empresa | Dashboard con métricas de empresa, gestión de equipo, reclamos activos y configuración |
| **Operador** | Operador de empresa | Interfaz para gestión de clientes, asignación de reclamos y coordinación de profesionales |
| **Profesional** | Técnico en campo | Vista simplificada con reclamos asignados, agenda personal y gestión de disponibilidad |

## ✨ Características Principales

### 📱 Progressive Web App (PWA)
- Instalable en dispositivos móviles y desktop
- Funcionalidad offline con Service Workers
- Experiencia de app nativa
- Notificaciones push (próximamente)

### 🎨 Interfaz de Usuario
- Diseño moderno y responsive
- Dark/Light mode
- Componentes accesibles (WCAG)
- Animaciones fluidas
- Sidebar adaptable

### 🔐 Autenticación y Seguridad
- Login con JWT tokens
- Refresh tokens automático
- Rutas protegidas por rol
- Sesiones persistentes
- Redirección automática según permisos

### 📊 Dashboards por Rol
- **SuperAdmin**: Estadísticas globales, gestión de empresas y usuarios
- **Owner**: Métricas de empresa, logs de actividad, gestión de equipo
- **Operador**: Gestión de reclamos, clientes y asignaciones
- **Profesional**: Reclamos activos/finalizados, control de disponibilidad

### 🛠️ Funcionalidades Clave
- Sistema de tutoriales con guías paso a paso
- Gestión completa de reclamos (crear, asignar, seguimiento)
- Sistema de mensajería interno
- Gestión de especialidades y clientes
- Control de disponibilidad para profesionales
- Historial de reclamos con filtros
- Feedback y sugerencias


---
## 👨‍💻 Autor: **Jorge Ruanova**  

📧 [Email > ](mailto:jruanova.dev@gmail.com)  
💼 [Linkedin > ](https://www.linkedin.com/in/ruanovajorge/)  
🐙 [Github > ](https://github.com/gioruanova)

---

<i>Proyecto desarrollado como Seminario Final de Carrera</i><br/>
<p align="left"><i>¡Gracias por visitar este proyecto! ⭐</i></p>


