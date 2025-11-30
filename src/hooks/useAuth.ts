"use client";

import { useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { config } from '@/lib/config';
import { API_ROUTES } from '@/lib/api_routes';
import { User, isCompanyUser } from '@/types/auth';
import { CompanyConfigData } from '@/types/company';
import { CompanyConfigService } from '@/services/company/companyConfigService';

interface UseAuthProps {
  setUser: (user: User | null) => void;
  setCompanyConfig: (config: CompanyConfigData | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export function useAuth({
  setUser,
  setCompanyConfig,
  setIsLoading
}: UseAuthProps) {

  const apiClient = useMemo(() => {
    const client = axios.create({
      baseURL: config.apiUrl,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, 
    });

    client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (!error.response) {
          if (error.code === 'ECONNREFUSED') {
            error.message = 'ERR_CONNECTION_REFUSED';
          } else if (error.code === 'ETIMEDOUT') {
            error.message = 'ERR_CONNECTION_TIMED_OUT';
          } else if (error.code === 'ENOTFOUND') {
            error.message = 'ERR_NETWORK';
          } else if (!error.message) {
            error.message = 'Network Error';
          }
        }
        return Promise.reject(error);
      }
    );

    return client;
  }, []);

  const companyConfigService = useMemo(() => new CompanyConfigService(apiClient), [apiClient]);

  const loadCompanyConfig = useCallback(async () => {
    try {
      const config = await companyConfigService.getConfig();
      setCompanyConfig(config);
    } catch (error) {
      console.error("Error obteniendo configuración de empresa:", error);
      setCompanyConfig(null);
    }
  }, [companyConfigService, setCompanyConfig]);

  const refreshCompanyConfig = useCallback(async () => {
    await loadCompanyConfig();
  }, [loadCompanyConfig]);

  const handleProfileResponse = useCallback(async (userData: User) => {
    setUser(userData);
    if (isCompanyUser(userData)) {
      await loadCompanyConfig();
    }
  }, [setUser, loadCompanyConfig]);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);

      const profileResponse = await apiClient.get(API_ROUTES.PROFILE);

      if (profileResponse.data?.user_id) {
        await handleProfileResponse(profileResponse.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      const error = err as { response?: { status?: number } };

      if (error?.response?.status === 401 || error?.response?.status === 403) {
        try {
          const refreshResponse = await apiClient.get(API_ROUTES.REFRESH);

          if (refreshResponse.data.success) {
            const profileResponse = await apiClient.get(API_ROUTES.PROFILE);

            if (profileResponse.data?.user_id) {
              await handleProfileResponse(profileResponse.data);
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
  }, [apiClient, setUser, handleProfileResponse, setIsLoading]);

  const getErrorMessage = useCallback((error: unknown): string => {
    const errorObj = error as {
      message?: string;
      response?: { data?: { code?: string }; status?: number };
      code?: string;
      request?: unknown;
    };

    const isNetworkError =
      errorObj.message === "Network Error" ||
      errorObj.message === "ERR_NETWORK" ||
      errorObj.message === "ERR_INTERNET_DISCONNECTED" ||
      errorObj.message === "ERR_CONNECTION_REFUSED" ||
      errorObj.message === "ERR_CONNECTION_TIMED_OUT" ||
      (!errorObj.response && !errorObj.message) ||
      (errorObj.code && ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT'].includes(errorObj.code));

    if (isNetworkError) {
      if (errorObj.message === "ERR_CONNECTION_REFUSED" || errorObj.code === 'ECONNREFUSED') {
        return "El servidor no está disponible en este momento. Por favor, inténtalo más tarde.";
      }

      if (errorObj.message === "ERR_CONNECTION_TIMED_OUT" || errorObj.code === 'ETIMEDOUT') {
        return "La conexión con el servidor está tardando demasiado. Verifica tu conexión a internet.";
      }

      if (errorObj.message === "ERR_INTERNET_DISCONNECTED") {
        return "No hay conexión a internet. Verifica tu conexión.";
      }

      return "No se pudo conectar con el servidor. Verifica tu conexión a internet o inténtalo más tarde.";
    }

    if (errorObj.message && !errorObj.response) {
      return errorObj.message;
    }

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

    if (errorObj.response?.status === 400) {
      return "Datos de entrada inválidos";
    }

    if (errorObj.response?.status === 401) {
      return "Credenciales incorrectas";
    }

    if (errorObj.response?.status === 500) {
      return "Error interno del servidor. Por favor, inténtalo más tarde.";
    }

    if (errorObj.response?.status === 503) {
      return "El servicio no está disponible temporalmente. Por favor, inténtalo más tarde.";
    }

    return "Ha habido un error. Póngase en contacto con su administrador";
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);

      if (!email.trim()) throw new Error("El email es requerido");
      if (!password.trim()) throw new Error("La contraseña es requerida");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("El formato del email no es válido");
      if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres");

      const loginResponse = await apiClient.post(API_ROUTES.LOGIN, { email, password });

      if (loginResponse.data.success) {
        try {
          const profileResponse = await apiClient.get(API_ROUTES.PROFILE);

          if (profileResponse.data?.user_id) {
            await handleProfileResponse(profileResponse.data);
          } else {
            throw new Error("Ha habido un error. Póngase en contacto con su administrador");
          }
        } catch {
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
  }, [apiClient, handleProfileResponse, setIsLoading, getErrorMessage]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await apiClient.get(API_ROUTES.LOGOUT);
      setUser(null);
      setCompanyConfig(null);
    } catch {
      setUser(null);
      setCompanyConfig(null);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, setUser, setCompanyConfig, setIsLoading]);

  return {
    apiClient,
    refreshCompanyConfig,
    checkAuth,
    getErrorMessage,
    login,
    logout,
  };
}

