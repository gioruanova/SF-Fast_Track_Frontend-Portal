"use client";

import React, { createContext, useContext, useState, useRef, useMemo, useCallback } from "react";
import { AuthContextType } from "@/types/auth";
import { useAuthState } from "@/hooks/auth/useAuthState";
import { AuthService } from "@/services/auth/authService";
import { CompanyConfigService } from "@/services/company/companyConfigService";
import { useRouter } from "next/navigation";
import { getDashboardRoute } from "@/lib/auth/routes";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { API_ROUTES } from "@/lib/api_routes";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const companyConfigServiceRef = useRef(new CompanyConfigService(apiClient));
  const authServiceRef = useRef(new AuthService(apiClient, companyConfigServiceRef.current));

  const { user, companyConfig, isLoading, authenticate, refreshCompanyConfig: refreshConfig, reset } = useAuthState({
    authService: authServiceRef.current,
    companyConfigService: companyConfigServiceRef.current,
  });

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      if (!email.trim()) throw new Error("El email es requerido");
      if (!password.trim()) throw new Error("La contraseña es requerida");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("El formato del email no es válido");
      }
      if (password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
      }

      const loginResponse = await apiClient.post(API_ROUTES.LOGIN, { email, password });

      if (!loginResponse.data.success) {
        throw new Error("Credenciales incorrectas");
      }

      const authResult = await authenticate();
      
      if (authResult?.user) {
        router.push(getDashboardRoute(authResult.user.user_role));
      } else {
        throw new Error("Error al obtener datos del usuario");
      }
    } catch (error) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
      
      if (axiosError?.response?.status === 401) {
        const message = "Credenciales incorrectas";
        toast.error(message);
        throw new Error(message);
      }
      
      const message = axiosError?.response?.data?.message || (error as Error).message || "Error al iniciar sesión";
      toast.error(message);
      throw new Error(message);
    }
  }, [authenticate, router]);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoggingOut(true);
    
    try {
      await apiClient.get(API_ROUTES.LOGOUT);
    } catch {
    } finally {
      reset();
      router.replace("/login");
      setIsLoggingOut(false);
    }
  }, [reset, router]);

  const refreshCompanyConfig = useCallback(async (): Promise<void> => {
    await refreshConfig();
  }, [refreshConfig]);

  const setIsRedirecting = useCallback(() => {}, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    companyConfig,
    login,
    logout,
    refreshCompanyConfig,
    isLoading: isLoading || isLoggingOut,
    isLoggingOut,
    isRedirecting: false,
    setIsRedirecting,
    error: null,
  }), [user, companyConfig, login, logout, refreshCompanyConfig, isLoading, isLoggingOut, setIsRedirecting]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
