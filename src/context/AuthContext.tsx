"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthContextType } from "@/types/auth";
import { CompanyConfigData } from "@/types/company";
import { useAuthWithNotifications } from "@/hooks/useAuthWithNotifications";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [companyConfig, setCompanyConfig] = useState<CompanyConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // notificaciones
  const {
    fetchCompanyConfig,
    refreshCompanyConfig,
    checkAuth,
    login,
    logout,
  } = useAuthWithNotifications({
    setUser,
    setCompanyConfig,
    setIsLoading,
  });

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
