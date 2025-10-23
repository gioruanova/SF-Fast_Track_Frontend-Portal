"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, X, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
  path?: string; // redirect segun rol
}

export function NotificationToast() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_SHOWN') {
        const notificationData = event.data.data;

        setNotifications([notificationData]);

        setIsVisible(true);

        setTimeout(() => {
          setIsAnimatingOut(true);
          setTimeout(() => {
            setIsVisible(false);
            setIsAnimatingOut(false);
            setNotifications([]);
          }, 300);
        }, 8000);
      }
    };

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
    }

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleNotificationClick = (notification: NotificationData) => {
    if (notification.path) {
      window.location.href = notification.path;
    }

    handleClose();
  };

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimatingOut(false);
      setNotifications([]);
    }, 300);
  };

  const handleViewAll = () => {
    const event = new CustomEvent('openNotificationCenter');
    window.dispatchEvent(event);

    handleClose();
  };

  if (!isMounted) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  const latestNotification = notifications[0]; // ultima notif

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm transition-all duration-300 ${isAnimatingOut
        ? 'transform -translate-y-full opacity-0'
        : 'animate-in slide-in-from-top opacity-100'
      }`}>
      <Card className="border-l-4 border-l-primary bg-background/85 backdrop-blur-sm shadow-lg">
        <CardContent className="p-0 px-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                {latestNotification.icon ? (
                  <Image
                    src={latestNotification.icon}
                    alt="Notification icon"
                    className="w-8 h-8 rounded-full object-cover"
                    width={32}
                    height={32}
                  />
                ) : (
                  <Bell className="h-5 w-5 text-primary" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {latestNotification.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                {latestNotification.body}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleNotificationClick(latestNotification)}
                  className="text-xs h-7 px-2"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ver
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleViewAll}
                  className="text-xs h-7 px-2"
                >
                  Ver todas
                </Button>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleClose}
              className="flex-shrink-0 p-1 h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
