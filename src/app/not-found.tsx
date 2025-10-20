"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al root inmediatamente
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    </div>
  );
}
