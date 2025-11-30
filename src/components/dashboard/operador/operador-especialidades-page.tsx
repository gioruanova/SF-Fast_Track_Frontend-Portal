"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Wrench,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { API_ROUTES } from "@/lib/api_routes";
import { apiClient } from "@/lib/apiClient";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useEspecialidades } from "@/hooks/especialidades/useEspecialidades";
import { Especialidad } from "@/types/especialidades";

interface ProfesionalData {
  user_id: number;
  user_complete_name: string;
  user_email: string;
  user_phone: string;
  user_dni: string;
  user_role: string;
  user_status: number;
  created_at: string;
  last_login?: string;
  especialidades?: Array<{
    id_asignacion: number;
    id_usuario: number;
    company_id: number;
    id_especialidad: number;
    created_at: string;
    updated_at: string;
    Especialidad: {
      nombre_especialidad: string;
    };
  }>;
}

interface EspecialidadWithProfesionales extends Especialidad {
  profesionales_count?: number;
  profesionales?: Array<{
    user_id: number;
    user_complete_name: string;
    user_email: string;
    user_status: number;
  }>;
}

export function OperadorEspecialidadesPage() {
  const { companyConfig } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [filterProfesionales, setFilterProfesionales] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    especialidades,
    isLoading: especialidadesLoading,
    fetchEspecialidades,
  } = useEspecialidades({ autoFetch: true });

  const [profesionales, setProfesionales] = useState<ProfesionalData[]>([]);
  const [isLoadingProfesionales, setIsLoadingProfesionales] = useState(true);

  const fetchProfesionales = useCallback(async () => {
    try {
      setIsLoadingProfesionales(true);
      const response = await apiClient.get<ProfesionalData[]>(API_ROUTES.GET_USERS);
      const profesionalesData = response.data.filter(
        (user) => user.user_role === "profesional"
      );
      setProfesionales(profesionalesData);
    } catch {
    } finally {
      setIsLoadingProfesionales(false);
    }
  }, []);

  useEffect(() => {
    fetchProfesionales();
  }, [fetchProfesionales]);

  const especialidadesConProfesionales = useMemo<EspecialidadWithProfesionales[]>(() => {
    return especialidades.map((esp) => {
      const profesionalesDeEstaEspecialidad = profesionales.filter(
        (prof) =>
          prof.especialidades &&
          prof.especialidades.some((e) => e.id_especialidad === esp.id_especialidad)
      );

      return {
        ...esp,
        profesionales_count: profesionalesDeEstaEspecialidad.length,
        profesionales: profesionalesDeEstaEspecialidad.map((prof) => ({
          user_id: prof.user_id,
          user_complete_name: prof.user_complete_name,
          user_email: prof.user_email,
          user_status: prof.user_status,
        })),
      };
    });
  }, [especialidades, profesionales]);

  const isLoading = especialidadesLoading || isLoadingProfesionales;

  const filteredEspecialidades = useMemo(() => {
    return especialidadesConProfesionales.filter((esp) => {
      const matchesSearch =
        esp.nombre_especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        esp.id_especialidad.toString().includes(searchTerm);

      const matchesEstado =
        filterEstado === "all" ||
        (filterEstado === "active" && esp.estado_especialidad === 1) ||
        (filterEstado === "inactive" && esp.estado_especialidad === 0);

      const matchesProfesionales =
        filterProfesionales === "all" ||
        (filterProfesionales === "with" && (esp.profesionales_count || 0) > 0) ||
        (filterProfesionales === "without" && (esp.profesionales_count || 0) === 0);

      return matchesSearch && matchesEstado && matchesProfesionales;
    });
  }, [especialidadesConProfesionales, searchTerm, filterEstado, filterProfesionales]);

  const totalPages = Math.ceil(filteredEspecialidades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEspecialidades = filteredEspecialidades.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterEstado, filterProfesionales]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  const getEstadoIcon = (estado_especialidad: number, profesionalesCount: number) => {
    if (estado_especialidad === 0) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (profesionalesCount === 0) {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getEstadoText = (estado_especialidad: number, profesionalesCount: number) => {
    if (estado_especialidad === 0) {
      return "Inactiva";
    }
    if (profesionalesCount === 0) {
      return `Sin ${companyConfig?.plu_heading_profesional?.toLowerCase() || "profesionales"}`;
    }
    return "Disponible";
  };

  const getEstadoColor = (estado_especialidad: number, profesionalesCount: number) => {
    if (estado_especialidad === 0) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
    if (profesionalesCount === 0) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  };

  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">
              {companyConfig?.plu_heading_especialidad || "Especialidades"} Disponibles
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 text-balance">
              Consulta las {companyConfig?.plu_heading_especialidad?.toLowerCase() || "especialidades"} y {companyConfig?.plu_heading_profesional?.toLowerCase() || "profesionales"} disponibles para brindar soporte
            </p>
          </div>
          <div className="flex flex-col items-start md:items-center md:flex-row md:gap-2 gap-1">
            <Badge variant="secondary" className="text-lg px-4 py-1">
              {filteredEspecialidades.length} de {especialidades.length}
            </Badge>
            <Button
              onClick={() => {
                fetchEspecialidades();
                fetchProfesionales();
              }}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
                onClick={clearSearch}
                title="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger className="w-full md:w-[200px] cursor-pointer">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">Todos los estados</SelectItem>
              <SelectItem value="active" className="cursor-pointer">Activas</SelectItem>
              <SelectItem value="inactive" className="cursor-pointer">Inactivas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterProfesionales} onValueChange={setFilterProfesionales}>
            <SelectTrigger className="w-full md:w-[200px] cursor-pointer">
              <SelectValue placeholder={`Filtrar por ${companyConfig?.plu_heading_profesional?.toLowerCase() || "profesionales"}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">Todas las {companyConfig?.plu_heading_especialidad?.toLowerCase() || "especialidades"}</SelectItem>
              <SelectItem value="with" className="cursor-pointer">Con {companyConfig?.plu_heading_profesional?.toLowerCase() || "profesionales"}</SelectItem>
              <SelectItem value="without" className="cursor-pointer">Sin {companyConfig?.plu_heading_profesional?.toLowerCase() || "profesionales"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedEspecialidades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron {companyConfig?.plu_heading_especialidad?.toLowerCase() || "especialidades"}
              </div>
            ) : (
              paginatedEspecialidades.map((especialidad) => (
                <div
                  key={especialidad.id_especialidad}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-base">{especialidad.nombre_especialidad}</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${getEstadoColor(especialidad.estado_especialidad, especialidad.profesionales_count || 0)}`}
                    >
                      {getEstadoIcon(especialidad.estado_especialidad, especialidad.profesionales_count || 0)}
                      {getEstadoText(especialidad.estado_especialidad, especialidad.profesionales_count || 0)}
                    </span>
                  </div>

                  <div className="pl-6">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">
                        {companyConfig?.plu_heading_profesional || "Profesionales"} asignados:
                      </span>{" "}
                      {especialidad.profesionales && especialidad.profesionales.length > 0 ? (
                        <span className="text-foreground">
                          {especialidad.profesionales.map((prof, index) => (
                            <span key={prof.user_id}>
                              {prof.user_complete_name}
                              {index < especialidad.profesionales!.length - 1 && ", "}
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">
                          No hay {companyConfig?.plu_heading_profesional?.toLowerCase() || "profesionales"} asignados
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredEspecialidades.length)} de {filteredEspecialidades.length} {companyConfig?.plu_heading_especialidad?.toLowerCase() || "especialidades"}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center gap-1 md:gap-2 justify-center md:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-xs md:text-sm px-2 md:px-3"
              >
                <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline ml-1">Anterior</span>
              </Button>

              <div className="flex flex-wrap items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-6 h-6 md:w-8 md:h-8 p-0 text-xs md:text-sm"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="text-xs md:text-sm px-2 md:px-3"
              >
                <span className="hidden sm:inline mr-1">Siguiente</span>
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
