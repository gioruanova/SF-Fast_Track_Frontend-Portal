"use client";

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, CheckCircle, XCircle } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface NotificationStatusProps {
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export function NotificationStatus({ 
  showIcon = true, 
  showText = true,
  className = ""
}: NotificationStatusProps) {
  const {
    isSupported,
    isSubscribed,
    checkSupport,
    checkSubscription,
  } = usePushNotifications();

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

  if (!isInitialized) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <div className="h-4 w-4 animate-pulse bg-gray-300 rounded" />}
        {showText && <span className="text-sm text-gray-500">Cargando...</span>}
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <XCircle className="h-4 w-4 text-red-500" />}
        {showText && (
          <Badge variant="destructive" className="text-xs">
            No soportado
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        isSubscribed ? (
          <Bell className="h-4 w-4 text-green-500" />
        ) : (
          <BellOff className="h-4 w-4 text-gray-400" />
        )
      )}
      {showText && (
        <Badge 
          variant={isSubscribed ? "default" : "secondary"}
          className="text-xs"
        >
          {isSubscribed ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Activas
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              Inactivas
            </>
          )}
        </Badge>
      )}
    </div>
  );
}
