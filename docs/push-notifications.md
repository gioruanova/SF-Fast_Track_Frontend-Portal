# Notificaciones Push - Fast Track PWA

## Descripción
Sistema de notificaciones push implementado para la PWA de Fast Track que permite a los usuarios recibir notificaciones en tiempo real, incluso cuando la aplicación está cerrada.

## Características Implementadas

### 1. Service Worker (sw.js)
- **Event listener para 'push'**: Maneja las notificaciones entrantes
- **Event listener para 'notificationclick'**: Maneja los clics en notificaciones
- **Configuración de notificaciones**: Título, cuerpo, icono, acciones
- **Navegación automática**: Abre la aplicación al hacer clic

### 2. Hook usePushNotifications
- **Verificación de soporte**: Detecta si el navegador soporta notificaciones push
- **Gestión de suscripciones**: Suscribir/desuscribir usuarios
- **Integración con backend**: Registro automático de tokens
- **Manejo de errores**: Gestión centralizada de errores

### 3. Componentes UI
- **NotificationButton**: Botón para activar/desactivar notificaciones
- **NotificationStatus**: Indicador visual del estado de las notificaciones

### 4. Integración con Autenticación
- **Suscripción automática**: Se activa después del login exitoso
- **Persistencia**: Las notificaciones se mantienen entre sesiones

## Endpoints del Backend

### Obtener clave pública VAPID
```
GET /customersApi/notifications/vapid-public-key
```

### Registrar token de suscripción
```
POST /customersApi/notifications/register-token
Content-Type: application/json

{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

### Enviar notificación (Backend)
```javascript
sendNotificationToUser(userId, "Mensaje de la notificación")
```

## Uso en el Frontend

### 1. Botón de Notificaciones
```tsx
import { NotificationButton } from '@/components/pwa/NotificationButton';

<NotificationButton 
  variant="outline" 
  size="sm" 
  className="custom-class" 
/>
```

### 2. Estado de Notificaciones
```tsx
import { NotificationStatus } from '@/components/pwa/NotificationStatus';

<NotificationStatus 
  showIcon={true} 
  showText={true} 
  className="custom-class" 
/>
```

### 3. Hook personalizado
```tsx
import { usePushNotifications } from '@/hooks/usePushNotifications';

const {
  isSupported,
  isSubscribed,
  isLoading,
  subscribeToPush,
  unsubscribeFromPush
} = usePushNotifications();
```

## Flujo de Funcionamiento

1. **Usuario se loguea** → Suscripción automática a notificaciones
2. **Usuario hace clic en botón** → Activa/desactiva notificaciones manualmente
3. **Backend envía notificación** → `sendNotificationToUser(userId, message)`
4. **Service Worker recibe push** → Muestra notificación al usuario
5. **Usuario hace clic en notificación** → Abre la aplicación

## Compatibilidad

### Navegadores Soportados
- ✅ Chrome/Chromium (Android, Desktop)
- ✅ Firefox (Android, Desktop)
- ✅ Safari (iOS 16.4+, macOS 13+)
- ✅ Edge (Windows, macOS)

### Dispositivos
- ✅ **Web**: Funciona en todos los navegadores soportados
- ✅ **Android PWA**: Funciona completamente
- ✅ **iOS PWA**: Funciona con limitaciones cuando la app está cerrada

## Limitaciones

### iOS
- Las notificaciones pueden no aparecer cuando la app está completamente cerrada
- Requiere iOS 16.4+ para soporte completo
- Limitaciones del sistema operativo, no de la implementación

### Navegadores
- Requiere HTTPS en producción
- Algunos navegadores pueden bloquear notificaciones por defecto

## Configuración de Producción

### 1. Variables de Entorno
```env
NEXT_PUBLIC_API_URL=https://api.fasttrack.com
```

### 2. VAPID Keys
- Las claves VAPID deben estar configuradas en el backend
- La clave pública se obtiene automáticamente del endpoint

### 3. Service Worker
- Se registra automáticamente en `/pwa.js`
- Se actualiza automáticamente cuando hay cambios

## Testing

### 1. Verificar Registro del Service Worker
```javascript
// En DevTools Console
navigator.serviceWorker.ready.then(reg => console.log('SW registrado:', reg))
```

### 2. Verificar Suscripción
```javascript
// En DevTools Console
navigator.serviceWorker.ready.then(reg => 
  reg.pushManager.getSubscription().then(sub => 
    console.log('Suscripción:', sub)
  )
)
```

### 3. Enviar Notificación de Prueba
```javascript
// Desde el backend
sendNotificationToUser(userId, "Mensaje de prueba")
```

## Troubleshooting

### Notificaciones no aparecen
1. Verificar permisos del navegador
2. Verificar que el Service Worker esté registrado
3. Verificar que la suscripción esté activa
4. Verificar conexión a internet

### Error de VAPID
1. Verificar que el endpoint `/customersApi/notifications/vapid-public-key` funcione
2. Verificar que la clave sea válida
3. Verificar formato base64 de la clave

### Error de registro de token
1. Verificar que el endpoint `/customersApi/notifications/register-token` funcione
2. Verificar autenticación del usuario
3. Verificar formato de la suscripción
