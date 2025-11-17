"use client";

import { memo } from "react";
import { LoadingSpinner } from "./loading-spinner";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

const LoadingScreenComponent = ({ 
  message = "Cargando...", 
  className 
}: LoadingScreenProps) => {
  return (
    <div 
      className={cn(
        "flex items-center justify-center min-h-screen",
        className
      )}
    >
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" className="mx-auto" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export const LoadingScreen = memo(LoadingScreenComponent);

