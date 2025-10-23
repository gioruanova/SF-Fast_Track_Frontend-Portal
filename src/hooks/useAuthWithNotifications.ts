"use client";

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { config } from '@/lib/config';
import { PUBLIC_API } from '@/lib/publicApi/config';
import { CLIENT_API } from '@/lib/clientApi/config';
import { User, isCompanyUser } from '@/types/auth';
import { CompanyConfigData } from '@/types/company';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface UseAuthWithNotificationsProps {
  setUser: (user: User | null) => void;
  setCompanyConfig: (config: CompanyConfigData | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export function useAuthWithNotifications({ 
  setUser, 
  setCompanyConfig, 
  setIsLoading 
}: UseAuthWithNotificationsProps) {
  const router = useRouter();
  const { checkSupport, checkSubscription, subscribeToPush } = usePushNotifications();

  // Configurar cliente API con autenticación
  const apiClient = axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Obtener configuración de empresa
  const fetchCompanyConfig = useCallback(async () => {
    try {
      const configResponse = await apiClient.get(CLIENT_API.COMPANY_CONFIG);
      if (configResponse.data) {
        setCompanyConfig(configResponse.data);
      }
    } catch (err) {
      console.error("Error obteniendo configuración de empresa:", err);
      setCompanyConfig(null);
    }
  }, [apiClient, setCompanyConfig]);

  // Refrescar configuración de empresa
  const refreshCompanyConfig = useCallback(async () => {
    await fetchCompanyConfig();
  }, [fetchCompanyConfig]);

  // Verificar autenticación
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);

      const profileResponse = await apiClient.get(PUBLIC_API.PROFILE);

      if (profileResponse.data?.user_id) {
        setUser(profileResponse.data);
        if (isCompanyUser(profileResponse.data)) {
          await fetchCompanyConfig();
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      const error = err as { response?: { status?: number } };
      
      // Intentar renovar token si hay error de autenticación
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        try {
          const refreshResponse = await apiClient.get(PUBLIC_API.REFRESH);
          
          if (refreshResponse.data.success) {
            await new Promise(resolve => setTimeout(resolve, 200));
            const profileResponse = await apiClient.get(PUBLIC_API.PROFILE);
            
            if (profileResponse.data?.user_id) {
              setUser(profileResponse.data);
              if (isCompanyUser(profileResponse.data)) {
                await fetchCompanyConfig();
              }
            } else {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, setUser, fetchCompanyConfig, setIsLoading]);

  // Manejo centralizado de errores
  const getErrorMessage = useCallback((error: unknown): string => {
    const errorObj = error as { 
      message?: string; 
      response?: { data?: { code?: string }; status?: number }; 
      code?: string 
    };
    
    if (errorObj.message && !errorObj.response) {
      return errorObj.message;
    }

    // Errores de conexión
    if (errorObj.message === "Network Error" || (!errorObj.response && !errorObj.message)) {
      return "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
    }

    // Errores seguros del backend
    const safeErrorCodes = ["MISSING_CREDENTIALS", "INVALID_EMAIL_FORMAT", "INVALID_PASSWORD_LENGTH", "VALIDATION_ERROR"];
    if (errorObj.response?.data?.code && safeErrorCodes.includes(errorObj.response.data.code)) {
      const errorMessages: Record<string, string> = {
        "MISSING_CREDENTIALS": "Email y contraseña son requeridos",
        "INVALID_EMAIL_FORMAT": "El formato del email no es válido",
        "INVALID_PASSWORD_LENGTH": "La contraseña debe tener al menos 6 caracteres",
        "VALIDATION_ERROR": "Datos ingresados inválidos"
      };
      return errorMessages[errorObj.response.data.code];
    }

    // Error 400 (datos inválidos)
    if (errorObj.response?.status === 400) {
      return "Datos de entrada inválidos";
    }

    // Error 401 (credenciales incorrectas)
    if (errorObj.response?.status === 401) {
      return "Credenciales incorrectas";
    }

    // Por seguridad, no exponer detalles de errores internos
    return "Ha habido un error. Póngase en contacto con su administrador";
  }, []);

  // Login con manejo de notificaciones
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // Validaciones básicas
      if (!email.trim()) throw new Error("El email es requerido");
      if (!password.trim()) throw new Error("La contraseña es requerida");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("El formato del email no es válido");
      if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres");

      const loginResponse = await apiClient.post(PUBLIC_API.LOGIN, { email, password });

      if (loginResponse.data.success) {
        try {
          const profileResponse = await apiClient.get(PUBLIC_API.PROFILE);
          
          if (profileResponse.data?.user_id) {
            setUser(profileResponse.data);
            if (isCompanyUser(profileResponse.data)) {
              await fetchCompanyConfig();
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // NO suscribir automáticamente - dejar que el usuario decida
            console.log('🔔 Login successful - user can manually enable notifications');
            
            router.push("/dashboard");
          } else {
            throw new Error("Ha habido un error. Póngase en contacto con su administrador");
          }
        } catch {
          // Si falla el perfil, usar mensaje genérico
          throw new Error("Ha habido un error. Póngase en contacto con su administrador");
        }
      } else {
        throw new Error("Ha habido un error. Póngase en contacto con su administrador");
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage, {
        position: "bottom-left",
      });
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, setUser, fetchCompanyConfig, setIsLoading, getErrorMessage, router]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await apiClient.get(PUBLIC_API.LOGOUT);
      setUser(null);
      setCompanyConfig(null);
      router.push("/login");
    } catch {
      setUser(null);
      setCompanyConfig(null);
      router.push("/login");
    }
  }, [apiClient, setUser, setCompanyConfig, router]);

  return {
    apiClient,
    fetchCompanyConfig,
    refreshCompanyConfig,
    checkAuth,
    getErrorMessage,
    login,
    logout,
  };
}
