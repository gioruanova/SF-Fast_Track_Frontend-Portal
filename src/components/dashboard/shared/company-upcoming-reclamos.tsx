"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Calendar, User, Eye, ArrowRight } from "lucide-react";
import { ReclamoDetailSheet } from "@/components/features/reclamos/reclamo-detail-sheet";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { useReclamos } from "@/hooks/reclamos/useReclamos";
import Link from "next/link";

interface ReclamoData {
  reclamo_id: number;
  reclamo_titulo: string;
  reclamo_detalle: string;
  reclamo_estado: string;
  cliente_complete_name: string;
  cliente_direccion?: string;
  reclamo_url?: string;
  profesional: string;
  agenda_fecha: string;
  agenda_hora_desde: string;
  agenda_hora_hasta: string;
  nombre_especialidad: string;
  creador: string;
  created_at: string;
  reclamo_nota_cierre?: string;
  reclamo_presupuesto?: number;
}

const ESTADO_COLORS: Record<string, string> = {
  "ABIERTO": "bg-blue-500",
  "EN PROCESO": "bg-yellow-500",
  "EN PAUSA": "bg-orange-500",
  "CERRADO": "bg-green-500",
  "CANCELADO": "bg-red-500",
  "RE-ABIERTO": "bg-purple-500",
};

interface CompanyUpcomingReclamosProps {
  userRole?: "owner" | "operador";
}

export function CompanyUpcomingReclamos({ userRole = "owner" }: CompanyUpcomingReclamosProps = {}) {
  const { companyConfig } = useAuth();
  const { activeReclamos: allActiveReclamos, reclamos: allReclamos, isLoading, refresh } = useReclamos();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedReclamo, setSelectedReclamo] = useState<ReclamoData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const reclamos = useMemo(() => {
    return [...allActiveReclamos].sort((a, b) => {
      return new Date(a.agenda_fecha).getTime() - new Date(b.agenda_fecha).getTime();
    });
  }, [allActiveReclamos]);

  const handleOpenSheet = (reclamo: ReclamoData) => {
    setSelectedReclamo(reclamo);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedReclamo(null);
  };

  const handleUpdate = () => {
    refresh();
  };

  const estadisticasPorEstado = {
    ABIERTO: allReclamos.filter(r => r.reclamo_estado === "ABIERTO").length,
    "EN PROCESO": allReclamos.filter(r => r.reclamo_estado === "EN PROCESO").length,
    "EN PAUSA": allReclamos.filter(r => r.reclamo_estado === "EN PAUSA").length,
    CERRADO: allReclamos.filter(r => r.reclamo_estado === "CERRADO").length,
    CANCELADO: allReclamos.filter(r => r.reclamo_estado === "CANCELADO").length,
    "RE-ABIERTO": allReclamos.filter(r => r.reclamo_estado === "RE-ABIERTO").length,
  };

  const displayedReclamos = reclamos.slice(0, 5);
  const hasMoreReclamos = reclamos.length > 5;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="h-16 bg-muted/50 animate-pulse"></CardHeader>
        <CardContent className="h-64 bg-muted/30 animate-pulse"></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{companyConfig?.plu_heading_reclamos} en curso</CardTitle>
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
                <ChevronUp className="h-4 w-4 mr-0" />
                Colapsar
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex h-3 w-full overflow-hidden rounded-lg border">
              {Object.entries(estadisticasPorEstado).map(([estado, count]) => {
                const total = allReclamos.length || 1;
                const percentage = (count / total) * 100;

                if (count === 0) return null;

                return (
                  <div
                    key={estado}
                    className={`${ESTADO_COLORS[estado]} transition-all hover:opacity-80 cursor-help`}
                    style={{ width: `${percentage}%` }}
                    title={`${estado}: ${count} (${percentage.toFixed(1)}%)`}
                  />
                );
              })}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 justify-center">
              {Object.entries(estadisticasPorEstado).map(([estado, count]) => (
                <div key={estado} className="flex items-center gap-2 text-xs justify-center">
                  <span className={`h-2 w-2 rounded-full ${ESTADO_COLORS[estado]}`}></span>
                  <span className="text-muted-foreground">{estado}:</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-muted">
            <CardContent className="px-0">
              {displayedReclamos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay {companyConfig?.plu_heading_reclamos} en curso
                </p>
              ) : (
                <div className="space-y-4 b">
                  {displayedReclamos.map((reclamo, index) => (
                    <div
                      key={reclamo.reclamo_id}
                      className={`p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors ${index !== displayedReclamos.length - 1 ? 'mb-3' : ''
                        }`}
                    >
                      <div className="flex items-start justify-between gap-4 md:flex-row flex-col">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${ESTADO_COLORS[reclamo.reclamo_estado]}`}></span>
                            <h4 className="font-semibold">{reclamo.reclamo_titulo}</h4>
                            <span className="text-xs bg-muted px-2 py-1 rounded">#{reclamo.reclamo_id}</span>
                            -
                            <span className={`text-xs px-2 py-1 rounded font-medium ${ESTADO_COLORS[reclamo.reclamo_estado]}`}>
                              {reclamo.reclamo_estado}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {format(parseISO(reclamo.agenda_fecha), "dd/MM/yyyy", { locale: es })}
                                {" "}
                                {reclamo.agenda_hora_desde} - {reclamo.agenda_hora_hasta}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{reclamo.cliente_complete_name}</span>
                          </div>

<div className="flex flex-wrap gap-2">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {reclamo.nombre_especialidad}
                            </span>
                            -
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              {reclamo.profesional}
                            </span>
                          </div>

                        </div>

                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleOpenSheet(reclamo)}
                        >
                          <Eye className="h-4 w-4 mr-0" />
                          Ver Detalle
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            {hasMoreReclamos && displayedReclamos.length > 0 && (
              <CardContent className="pt-0 flex justify-center mt-5">
                <Button
                  variant="default"
                  asChild
                >
                  <Link href={`/dashboard/${userRole}/trabajar-reclamos`}>
                    Ver la totalidad de {companyConfig?.plu_heading_reclamos?.toLowerCase() || "reclamos"} en curso
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            )}
          </div>
        </CardContent>
      )}

      <ReclamoDetailSheet
        reclamo={selectedReclamo}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        userRole={userRole}
        onUpdate={handleUpdate}
      />
    </Card>
  );
}

