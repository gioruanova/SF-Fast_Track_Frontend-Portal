"use client";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuth } from "@/context/AuthContext";

interface AuthLoadingStateProps {
  message?: string;
  redirectingMessage?: string;
}

export function AuthLoadingState({ 
  message = "Cargando...", 
  redirectingMessage = "Redirigiendo..." 
}: AuthLoadingStateProps) {
  const { isLoading, isRedirecting } = useAuth();

  if (!isLoading && !isRedirecting) {
    return null;
  }

  return <LoadingScreen message={isRedirecting ? redirectingMessage : message} />;
}

