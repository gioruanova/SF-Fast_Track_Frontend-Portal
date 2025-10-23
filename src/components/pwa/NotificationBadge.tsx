"use client";

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_SHOWN') {
        setUnreadCount(prev => prev + 1);
        setIsVisible(true);
        
        setTimeout(() => {
          setIsVisible(false);
        }, 10000);
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  if (!isVisible || unreadCount === 0) {
    return null;
  }

  return (
    <div className="relative">
      <Bell className="h-5 w-5 text-gray-600" />
      <Badge 
        variant="destructive" 
        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
      >
        {unreadCount > 9 ? '9+' : unreadCount}
      </Badge>
    </div>
  );
}
