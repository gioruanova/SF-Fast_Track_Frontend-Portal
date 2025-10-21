"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { SUPER_API } from "@/lib/superApi/config";
import { CLIENT_API } from "@/lib/clientApi/config";
import axios from "axios";
import { config } from "@/lib/config";

declare global {
  interface Window {
    refreshUnreadCount?: () => void;
  }
}

const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function useUnreadMessagesCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUnreadCount = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (user?.user_role === 'superadmin') {
        response = await apiClient.get(SUPER_API.GET_PUBLIC_MESSAGES);
        const unreadMessages = response.data.filter((msg: { message_read: number }) => msg.message_read === 0);
        setUnreadCount(unreadMessages.length);
      } else {
        response = await apiClient.get(CLIENT_API.GET_MESSAGES_PLATFORM);
        const unreadMessages = response.data.filter((msg: { is_read: number }) => msg.is_read === 0);
        setUnreadCount(unreadMessages.length);
      }
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user, fetchUnreadCount]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.refreshUnreadCount = fetchUnreadCount;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.refreshUnreadCount;
      }
    };
  }, [fetchUnreadCount]);

  return { unreadCount, loading, refreshUnreadCount: fetchUnreadCount };
}
