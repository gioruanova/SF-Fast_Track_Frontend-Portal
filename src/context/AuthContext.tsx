"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { config } from "@/lib/config";
import { PUBLIC_API } from "@/lib/publicApi/config";
import { CLIENT_API } from "@/lib/clientApi/config";
import { User, AuthContextType, isCompanyUser } from "@/types/auth";
import { CompanyConfigData } from "@/types/company";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [companyConfig, setCompanyConfig] = useState<CompanyConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // configurar cliente api con autenticacion
  const apiClient = axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const fetchCompanyConfig = async () => {
    try {
      const configResponse = await apiClient.get(CLIENT_API.COMPANY_CONFIG);
      if (configResponse.data) {
        setCompanyConfig(configResponse.data);
      }
    } catch (err) {
      console.error("Error obteniendo configuración de empresa:", err);
      setCompanyConfig(null);
    }
  };

  const refreshCompanyConfig = async () => {
    await fetchCompanyConfig();
  };

  const checkAuth = async () => {
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
      
      // intentar renovar token si hay error de autenticacion
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
  };

  // manejo centralizado de errores
  const getErrorMessage = (error: unknown): string => {
    // errores de validacion del frontend (sin response)
    const errorObj = error as { message?: string; response?: { data?: { code?: string }; status?: number }; code?: string };
    
    if (errorObj.message && !errorObj.response) {
      return errorObj.message;
    }

    // errores de conexion
    if (errorObj.message === "Network Error" || (!errorObj.response && !errorObj.message)) {
      return "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
    }

    // errores seguros del backend
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

    // error 400 (datos invalidos)
    if (errorObj.response?.status === 400) {
      return "Datos de entrada inválidos";
    }

    // error 401 (credenciales incorrectas)
    if (errorObj.response?.status === 401) {
      return "Credenciales incorrectas";
    }

    // por seguridad, no exponer detalles de errores internos
    return "Ha habido un error. Póngase en contacto con su administrador";
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // validaciones basicas
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
            router.push("/dashboard");
          } else {
            throw new Error("Ha habido un error. Póngase en contacto con su administrador");
          }
        } catch {
          // si falla el perfil, usar mensaje generico
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
  };

  const logout = async () => {
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
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextType = {
    user,
    companyConfig,
    login,
    logout,
    refreshCompanyConfig,
    isLoading,
    error: null, // solo usamos toasts para errores
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
