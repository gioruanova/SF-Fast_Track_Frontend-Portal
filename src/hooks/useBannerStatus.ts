"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { SUPER_API } from "@/lib/superApi/config";
import { CLIENT_API } from "@/lib/clientApi/config";
import axios from "axios";
import { config } from "@/lib/config";
import { isSuperAdmin } from "@/types/auth";

// Tipo para errores de Axios
type AxiosError = {
  response?: {
    status?: number;
    data?: {
      error?: string;
    };
  };
};

declare global {
  interface Window {
    refreshBannerStatus?: () => void;
  }
}

interface BannerData {
  baner_id: number;
  banner_text: string;
  banner_limit: string;
  banner_active: number;
}

const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function useBannerStatus() {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBannerStatus = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (isSuperAdmin(user)) {
        response = await apiClient.get(SUPER_API.GET_BANNERS);
        const activeBanner = response.data.find((banner: BannerData) => banner.banner_active === 1);
        setBanner(activeBanner || null);
      } else {
        response = await apiClient.get(CLIENT_API.GET_BANNER_CLIENT);
        const bannerData = Array.isArray(response.data) ? response.data[0] : response.data;
        setBanner(bannerData);
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status !== 404) {
        console.error('Error fetching banner status:', error);
      }
      setBanner(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchBannerStatus();
    }
  }, [user, fetchBannerStatus]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.refreshBannerStatus = fetchBannerStatus;
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete window.refreshBannerStatus;
      }
    };
  }, [fetchBannerStatus]);

  return { banner, loading, refreshBannerStatus: fetchBannerStatus };
}
