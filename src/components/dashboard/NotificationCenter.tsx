"use client";

import { useState, useEffect } from 'react';
import { Bell, X, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/context/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  path?: string; // path para redirigir sgun role
}

const NOTIFICATIONS_KEY = 'fasttrack_notifications';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showUnsubscribeDialog, setShowUnsubscribeDialog] = useState(false);
  const { isSupported, isSubscribed, refreshSubscriptionStatus, subscribeToPush, unsubscribeFromPush, unsubscribeFromAllDevices } = usePushNotifications();
  const { user } = useAuth();

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const handleOpenNotificationCenter = () => {
      setIsOpen(true);
    };

    window.addEventListener('openNotificationCenter', handleOpenNotificationCenter);

    return () => {
      window.removeEventListener('openNotificationCenter', handleOpenNotificationCenter);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      refreshSubscriptionStatus();
    }
  }, [isOpen, refreshSubscriptionStatus]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_SHOWN' && !event.data?.source) {
        const notificationData = event.data.data;
        addNotification(notificationData.title, notificationData.body, notificationData.path);
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const saveNotifications = (newNotifications: Notification[]) => {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(newNotifications));
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const addNotification = (title: string, body: string, path?: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      body,
      timestamp: Date.now(),
      read: false,
      path, // va el path solo si existee
    };

    setNotifications(prev => {
      const updatedNotifications = [newNotification, ...prev].slice(0, 50); // Máximo 50

      try {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
      } catch (error) {
        console.error('Error saving notifications:', error);
      }

      return updatedNotifications;
    });
  };

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    saveNotifications(updatedNotifications);
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
  };

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribeFromPush(user?.user_id?.toString());
    } else {
      await subscribeToPush(true, user?.user_id?.toString());
    }
  };

  const handleUnsubscribeAllDevices = async () => {
    await unsubscribeFromAllDevices(user?.user_id?.toString());
    setShowUnsubscribeDialog(false);
  };


  const unreadCount = notifications.filter(n => !n.read).length;
  const recentNotifications = notifications.slice(0, 10);

  if (!isSupported) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative h-9 px-3 border-border hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Bell className="h-4 w-4" />

          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="p-3">
          <h4 className="font-semibold text-sm text-foreground">Notificaciones</h4>
        </div>

        <DropdownMenuSeparator />

        <ScrollArea className="h-64">
          {recentNotifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No hay notificaciones
            </div>
          ) : (
            <div className="p-1">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-accent cursor-pointer border-b border-border last:border-b-0 rounded-md ${!notification.read ? 'bg-primary/5' : ''
                    }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.path) {
                      window.location.href = notification.path;
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium truncate text-foreground">
                        {notification.title}
                      </h5>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.body}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />

        <div className="p-2 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllNotifications}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            disabled={notifications.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Borrar todas
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleNotifications}
            className="w-full justify-start hover:bg-accent hover:text-accent-foreground"
          >
            <Settings className="h-4 w-4 mr-2" />
            {isSubscribed ? 'Desactivar notificaciones' : 'Activar notificaciones'}
          </Button>

          {isSubscribed && (
            <AlertDialog open={showUnsubscribeDialog} onOpenChange={setShowUnsubscribeDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar en todos los dispositivos
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Cancelar notificaciones en todos los dispositivos
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción cancelará las notificaciones push en este dispositivo, todos tus otros dispositivos y todos los navegadores donde estés logueado. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleUnsubscribeAllDevices} className="bg-destructive text-white hover:bg-destructive/90">
                    Sí, cancelar todas
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
