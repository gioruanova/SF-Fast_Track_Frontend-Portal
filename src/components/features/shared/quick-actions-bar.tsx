"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Plus, ListTodo, History, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface QuickActionsBarProps {
  userRole: "owner" | "operador";
}

export function QuickActionsBar({ userRole }: QuickActionsBarProps) {
  const router = useRouter();
  const { companyConfig } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleGenerarIncidencia = () => {
    toast.info("Generando incidencia...");
  };

  const handleEnCurso = () => {
    router.push(`/dashboard/${userRole}/trabajar-reclamos`);
  };

  const handleHistorico = () => {
    router.push(`/dashboard/${userRole}/historial-reclamos`);
  };

  return (
    <Card className="sticky md:top-19 top-18 bg-sidebar z-10 py-0 pt-1 gap-1">
      <CardHeader className="h-auto">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Expandir
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Colapsar
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="py-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            <Button
              variant="default"
              className="w-full"
              onClick={handleGenerarIncidencia}
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear {companyConfig?.sing_heading_reclamos}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleEnCurso}
            >
              <ListTodo className="h-4 w-4 mr-2" />
              En Curso
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleHistorico}
            >
              <History className="h-4 w-4 mr-2" />
              Histórico
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

