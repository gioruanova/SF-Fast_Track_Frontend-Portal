"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Plus, ListTodo, History, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDashboard } from "@/context/DashboardContext";

interface QuickActionsBarProps {
  userRole: "owner" | "operador";
}

export function QuickActionsBar({ userRole }: QuickActionsBarProps) {
  const router = useRouter();
  const { companyConfig } = useAuth();
  const { setShouldOpenCreateReclamo } = useDashboard();
  const [isCollapsed, setIsCollapsed] = useState(globalThis.innerWidth < 1024 ? true : false);
  
  const isCompanyActive = companyConfig?.company?.company_estado === 1;

  const handleGenerarIncidencia = () => {
    if (!isCompanyActive) {
      toast.error("La empresa está inactiva. No se pueden crear reclamos.");
      return;
    }
    setShouldOpenCreateReclamo(true);
  };

  const handleEnCurso = () => {
    if (!isCompanyActive) {
      toast.error("La empresa está inactiva. No se puede acceder a esta funcionalidad.");
      return;
    }
    router.push(`/dashboard/${userRole}/trabajar-reclamos`);
  };

  const handleHistorico = () => {
    if (!isCompanyActive) {
      toast.error("La empresa está inactiva. No se puede acceder a esta funcionalidad.");
      return;
    }
    router.push(`/dashboard/${userRole}/historial-reclamos`);
  };

  return (
    <Card className="sticky md:top-19 top-18 bg-sidebar z-10 py-0 pt-1 gap-1">
      <CardHeader className="h-auto">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg mr-0">Acciones Rápidas</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="h-4 w-4 mr-0" />
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
              className="w-full gap-0.5 lg:gap-1"
              onClick={handleGenerarIncidencia}
              disabled={!isCompanyActive}
            >
              <Plus className="h-4 w-4 mr-0" />
              Crear {companyConfig?.sing_heading_reclamos}
            </Button>

            <Button
              variant="outline"
              className="w-full gap-0.5 lg:gap-1"
              onClick={handleEnCurso}
              disabled={!isCompanyActive}
            >
              <ListTodo className="h-4 w-4 mr-0" />
              En Curso
            </Button>

            <Button
              variant="outline"
              className="w-full gap-0.5 lg:gap-1"
              onClick={handleHistorico}
              disabled={!isCompanyActive}
            >
              <History className="h-4 w-4 mr-0" />
              Histórico
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

