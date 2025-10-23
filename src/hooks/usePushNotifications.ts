"use client";

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { CLIENT_API } from '@/lib/clientApi/config';

// Función para convertir VAPID key de base64 a Uint8Array
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar si las notificaciones push están soportadas
  const checkSupport = useCallback(() => {
    const supported = 'serviceWorker' in navigator && 
                     'PushManager' in window && 
                     'Notification' in window;
    setIsSupported(supported);
    return supported;
  }, []);

  // Verificar soporte y suscripción al montar el componente
  useEffect(() => {
    const initializeNotifications = async () => {
      if (checkSupport()) {
        // Verificar suscripción directamente aquí para evitar dependencia circular
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch (error) {
          console.error('Error checking initial subscription:', error);
          setIsSubscribed(false);
        }
      }
    };
    
    initializeNotifications();
  }, [checkSupport]);

  // Verificar si ya está suscrito
  const checkSubscription = useCallback(async () => {
    if (!checkSupport()) {
      setIsSubscribed(false);
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setIsSubscribed(!!subscription);
      return !!subscription;
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsSubscribed(false);
      return false;
    }
  }, [checkSupport]);

  // Verificar si el usuario ya tomó una decisión sobre notificaciones
  const hasNotificationDecision = useCallback((userId?: string) => {
    const key = userId ? `fasttrack_notification_decision_${userId}` : 'fasttrack_notification_decision';
    const decision = localStorage.getItem(key);
    return !!decision;
  }, []);

  // Obtener la decisión del usuario
  const getNotificationDecision = useCallback((userId?: string) => {
    const key = userId ? `fasttrack_notification_decision_${userId}` : 'fasttrack_notification_decision';
    const decision = localStorage.getItem(key);
    return decision; // 'accepted', 'declined', o null
  }, []);

  // Obtener clave pública VAPID
  const getVapidPublicKey = async (): Promise<string> => {
    try {
      const response = await fetch(CLIENT_API.NOTIFICATION_GET_VAPID, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error obteniendo clave VAPID');
      }

      const data = await response.json();
      return data.publicKey;
    } catch (error) {
      console.error('Error obteniendo VAPID key:', error);
      throw error;
    }
  };

  // Registrar token en el backend
  const registerToken = async (subscription: PushSubscription): Promise<void> => {
    try {
      const response = await fetch(CLIENT_API.NOTIFICATION_SUBSCRIBE, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });

      if (!response.ok) {
        throw new Error('Error registrando token');
      }
    } catch (error) {
      console.error('Error registrando token:', error);
      throw error;
    }
  };

  // Suscribirse a notificaciones push
  const subscribeToPush = useCallback(async (showToasts: boolean = true, userId?: string): Promise<boolean> => {
    if (!checkSupport()) {
      if (showToasts) {
        toast.error('Las notificaciones push no están soportadas en este navegador');
      }
      return false;
    }

    setIsLoading(true);

    try {
      // Verificar permisos
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        if (showToasts) {
          toast.error('Permisos de notificación denegados');
        }
        return false;
      }

      // Obtener clave VAPID
      const vapidPublicKey = await getVapidPublicKey();
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      // Obtener registro del service worker y esperar a que esté activo
      const registration = await navigator.serviceWorker.ready;
      
      // Verificar que el SW esté activo
      if (!registration.active || registration.active.state !== 'activated') {
        await new Promise((resolve) => {
          const checkState = () => {
            if (registration.active?.state === 'activated') {
              resolve(true);
            } else {
              setTimeout(checkState, 100);
            }
          };
          checkState();
        });
      }

      // Crear suscripción
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      // Registrar token en el backend
      await registerToken(subscription);

      // Actualizar localStorage - marcar como aceptado para este usuario
      if (userId) {
        localStorage.setItem(`fasttrack_notification_decision_${userId}`, 'accepted');
      }

      setIsSubscribed(true);
      if (showToasts) {
        toast.success('Notificaciones activadas correctamente');
      }
      return true;

    } catch (error) {
      console.error('Error suscribiéndose a push notifications:', error);
      if (showToasts) {
        toast.error('Error activando notificaciones');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkSupport]);

  // Desuscribirse de notificaciones push (solo dispositivo actual)
  const unsubscribeFromPush = useCallback(async (userId?: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Desuscribirse localmente
        await subscription.unsubscribe();
        
        // Actualizar localStorage - marcar como declinado para este usuario
        if (userId) {
          localStorage.setItem(`fasttrack_notification_decision_${userId}`, 'declined');
        }
        
        // Notificar al backend que se desuscribió
        try {
          await fetch(CLIENT_API.NOTIFICATION_UNSUBSCRIBE, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subscription: subscription.toJSON(),
            }),
          });
        } catch (backendError) {
          console.warn('Error notificando al backend sobre desuscripción:', backendError);
        }

        setIsSubscribed(false);
        toast.success('Notificaciones desactivadas');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error desuscribiéndose:', error);
      toast.error('Error desactivando notificaciones');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancelar notificaciones en todos los dispositivos
  const unsubscribeFromAllDevices = useCallback(async (userId?: string): Promise<boolean> => {

    setIsLoading(true);

    try {
      // Desuscribirse localmente primero
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Actualizar localStorage - marcar como declinado para este usuario
      if (userId) {
        localStorage.setItem(`fasttrack_notification_decision_${userId}`, 'declined');
      }

      // Notificar al backend para cancelar en todos los dispositivos
      const response = await fetch(CLIENT_API.NOTIFICATION_UNSUBSCRIBE_ALL_DEVICES, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error cancelando notificaciones en todos los dispositivos');
      }

      setIsSubscribed(false);
      toast.success('✅ Notificaciones canceladas en todos los dispositivos');
      return true;

    } catch (error) {
      console.error('Error cancelando notificaciones:', error);
      toast.error('❌ Error cancelando notificaciones en todos los dispositivos');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Limpiar suscripción local (forzar nueva suscripción)
  const clearLocalSubscription = useCallback(async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        setIsSubscribed(false);
        return true;
      }

      return true;
    } catch (error) {
      console.error('❌ Error clearing local subscription:', error);
      return false;
    }
  }, []);

  // Función para forzar verificación de suscripción
  const refreshSubscriptionStatus = useCallback(async () => {
    await checkSubscription();
  }, [checkSubscription]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    checkSupport,
    checkSubscription,
    refreshSubscriptionStatus,
    subscribeToPush,
    unsubscribeFromPush,
    unsubscribeFromAllDevices,
    clearLocalSubscription,
    hasNotificationDecision,
    getNotificationDecision,
  };
}
