"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User, AuthContextType } from "@/types/auth";
import { CompanyConfigData } from "@/types/company";
import { useAuth as useAuthHook } from "@/hooks/useAuth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [companyConfig, setCompanyConfig] = useState<CompanyConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    refreshCompanyConfig,
    checkAuth,
    login,
    logout,
  } = useAuthHook({
    setUser,
    setCompanyConfig,
    setIsLoading,
  });

  useEffect(() => {
    checkAuth();
    
  }, []);

const value: AuthContextType = useMemo(() => ({
    user,
    companyConfig,
    login,
    logout,
    refreshCompanyConfig,
    isLoading,
    error: null,
  }), [user, companyConfig, login, logout, refreshCompanyConfig, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
