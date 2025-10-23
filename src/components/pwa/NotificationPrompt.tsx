"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/context/AuthContext';

export function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasDecision, setHasDecision] = useState(false);
  const { isSupported, subscribeToPush, hasNotificationDecision } = usePushNotifications();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.user_id) {
      const userHasDecision = hasNotificationDecision(user.user_id.toString());
      setHasDecision(userHasDecision);
      
      if (!userHasDecision && isSupported) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    }
  }, [isSupported, user?.user_id, hasNotificationDecision]);

  const handleAccept = async () => {
    setIsLoading(true);
    
    try {
      const success = await subscribeToPush();
      
      if (success && user?.user_id) {
        localStorage.setItem(`fasttrack_notification_decision_${user.user_id.toString()}`, 'accepted');
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    if (user?.user_id) {
      localStorage.setItem(`fasttrack_notification_decision_${user.user_id.toString()}`, 'declined');
    }
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-background/85 backdrop-blur-sm" >
        <CardHeader className="text-center ">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl">¿Activar notificaciones?</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-foreground">
            Te enviaremos notificaciones sobre nuevos mensajes, reclamos y actualizaciones importantes.
          </p>
          
          <div className="flex gap-3">
            <Button
              onClick={handleDecline}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              <X className="h-4 w-4 " />
              No, gracias
            </Button>
            
            <Button
              onClick={handleAccept}
              className="flex-1"
              disabled={isLoading}
            >
              <Bell className="h-4 w-4 " />
              {isLoading ? 'Activando...' : 'Sí, activar'}
            </Button>
          </div>
          
          <p className="text-xs text-center text-foreground">
            Podes cambiar esta configuración en cualquier momento desde el dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
