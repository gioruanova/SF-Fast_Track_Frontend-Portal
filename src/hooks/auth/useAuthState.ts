import { useState, useEffect, useRef, useCallback } from "react";
import { User, isCompanyUser } from "@/types/auth";
import { CompanyConfigData } from "@/types/company";
import { AuthService, AuthResult } from "@/services/auth/authService";
import { CompanyConfigService } from "@/services/company/companyConfigService";

interface UseAuthStateOptions {
  authService: AuthService;
  companyConfigService: CompanyConfigService;
}

interface UseAuthStateResult {
  user: User | null;
  companyConfig: CompanyConfigData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authenticate: () => Promise<AuthResult | null>;
  refreshCompanyConfig: () => Promise<void>;
  reset: () => void;
}

export function useAuthState({
  authService,
  companyConfigService,
}: UseAuthStateOptions): UseAuthStateResult {
  const [user, setUser] = useState<User | null>(null);
  const [companyConfig, setCompanyConfig] = useState<CompanyConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasInitialized = useRef(false);

  const authenticate = useCallback(async (): Promise<AuthResult | null> => {
    setIsLoading(true);
    
    try {
      const result = await authService.authenticate();
      
      if (result) {
        setUser(result.user);
        setCompanyConfig(result.companyConfig);
        setIsAuthenticated(true);
        return result;
      } else {
        setUser(null);
        setCompanyConfig(null);
        setIsAuthenticated(false);
        return null;
      }
    } catch (error) {
      const axiosError = error as { response?: { status?: number } };
      const isAuthError = axiosError?.response?.status === 401 || axiosError?.response?.status === 403;
      
      if (!isAuthError) {
        console.error("Authentication error:", error);
      }
      
      setUser(null);
      setCompanyConfig(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  const refreshCompanyConfig = useCallback(async (): Promise<void> => {
    if (!user || !isCompanyUser(user)) {
      return;
    }

    try {
      const config = await companyConfigService.getConfig();
      setCompanyConfig(config);
    } catch (error) {
      console.error("Error refreshing company config:", error);
    }
  }, [user, companyConfigService]);

  const reset = useCallback((): void => {
    setUser(null);
    setCompanyConfig(null);
    setIsLoading(false);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    let mounted = true;

    setIsLoading(true);

    const performAuth = async () => {
      try {
        const result = await authService.authenticate();
        
        if (!mounted) return;
        
        if (result) {
          setUser(result.user);
          setCompanyConfig(result.companyConfig);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setCompanyConfig(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        if (!mounted) return;
        
        const axiosError = error as { response?: { status?: number } };
        const isAuthError = axiosError?.response?.status === 401 || axiosError?.response?.status === 403;
        
        if (!isAuthError) {
          console.error("Authentication error:", error);
        }
        
        setUser(null);
        setCompanyConfig(null);
        setIsAuthenticated(false);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    performAuth();

    return () => {
      mounted = false;
    };
  }, [authService]);

  return {
    user,
    companyConfig,
    isLoading,
    isAuthenticated,
    authenticate,
    refreshCompanyConfig,
    reset,
  };
}

