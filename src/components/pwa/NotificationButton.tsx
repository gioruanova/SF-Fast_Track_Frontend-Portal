"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { NotificationBadge } from './NotificationBadge';
import { useAuth } from '@/context/AuthContext';

interface NotificationButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function NotificationButton({ 
  className, 
  variant = 'outline',
  size = 'default' 
}: NotificationButtonProps) {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    checkSupport,
    checkSubscription,
    subscribeToPush,
    unsubscribeFromPush,
  } = usePushNotifications();
  const { user } = useAuth();

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      if (checkSupport()) {
        await checkSubscription();
      }
      setIsInitialized(true);
    };

    initialize();
  }, [checkSupport, checkSubscription]);

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribeFromPush(user?.user_id?.toString());
    } else {
      await subscribeToPush(true, user?.user_id?.toString());
    }
  };

  if (!isInitialized) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!isSupported) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
        title="Las notificaciones push no están soportadas en este navegador"
      >
        <BellOff className="h-4 w-4" />
        <span className="ml-2">No soportado</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleToggleNotifications}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSubscribed ? (
          <Bell className="h-4 w-4" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
        <span className="ml-2">
          {isSubscribed ? 'Desactivar' : 'Activar'} Notificaciones
        </span>
      </Button>
      
      {isSubscribed && <NotificationBadge />}
    </div>
  );
}
