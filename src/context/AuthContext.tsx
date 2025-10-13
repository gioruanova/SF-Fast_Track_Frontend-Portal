"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { config } from "@/lib/config";
import { PUBLIC_API } from "@/lib/publicApi/config";
import { CLIENT_API } from "@/lib/clientApi/config";
import { User, LoginRequest, AuthContextType, isCompanyUser } from "@/types/auth";
import { CompanyConfigData } from "@/types/company";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [companyConfig, setCompanyConfig] = useState<CompanyConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      setError(null);

      const profileResponse = await apiClient.get(PUBLIC_API.PROFILE);

      if (profileResponse.data && profileResponse.data.user_id) {
        setUser(profileResponse.data);

        if (isCompanyUser(profileResponse.data)) {
          await fetchCompanyConfig();
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      const error = err as { response?: { status?: number } };
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        try {
          const refreshResponse = await apiClient.get(PUBLIC_API.REFRESH);

          if (refreshResponse.data.success) {
            await new Promise(resolve => setTimeout(resolve, 200));

            try {
              const profileResponse = await apiClient.get(PUBLIC_API.PROFILE);

              if (profileResponse.data && profileResponse.data.user_id) {
                setUser(profileResponse.data);

                if (isCompanyUser(profileResponse.data)) {
                  await fetchCompanyConfig();
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

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const loginData: LoginRequest = { email, password };
      const loginResponse = await apiClient.post(PUBLIC_API.LOGIN, loginData);

      if (loginResponse.data.success) {
        try {
          const profileResponse = await apiClient.get(PUBLIC_API.PROFILE);

          if (profileResponse.data && profileResponse.data.user_id) {
            setUser(profileResponse.data);

            if (isCompanyUser(profileResponse.data)) {
              await fetchCompanyConfig();
            }

            await new Promise(resolve => setTimeout(resolve, 100));
            router.push("/dashboard");
          } else {
            throw new Error("No se pudieron obtener los datos del usuario");
          }
        } catch (profileErr) {
          const profileError = profileErr as { response?: { status?: number; data?: { error?: string } } };
          
          if (profileError.response?.status === 401) {
            throw new Error("Error de autenticación. Por favor, intenta nuevamente.");
          } else if (profileError.response?.data?.error) {
            throw new Error(profileError.response.data.error);
          } else {
            throw new Error("Error al obtener datos del usuario");
          }
        }
      } else {
        throw new Error(loginResponse.data.message || "Error al iniciar sesión");
      }
    } catch (err) {
      const error = err as { message?: string; response?: { data?: { message?: string }; status?: number } };
      let errorMessage = error.message || "Error al iniciar sesión";

      if (error.message === "Network Error" || (!error.response && !error.message)) {
        errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Credenciales incorrectas";
      } else if (error.response?.status === 500) {
        errorMessage = "Error del servidor. Intenta más tarde.";
      }

      setError(errorMessage);
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
      setError(null);
      router.push("/login");
    } catch {
      setUser(null);
      setCompanyConfig(null);
      setError(null);
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
    error,
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
