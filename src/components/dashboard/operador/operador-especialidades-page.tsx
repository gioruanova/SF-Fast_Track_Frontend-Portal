"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Search, X, ChevronLeft, ChevronRight, Wrench, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { config } from "@/lib/config";
import { CLIENT_API } from "@/lib/clientApi/config";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface EspecialidadData {
  id_especialidad: number;
  nombre_especialidad: string;
  estado_especialidad: number;
  created_at: string;
  updated_at: string;
  profesionales_count?: number;
  profesionales?: Array<{
    user_id: number;
    user_complete_name: string;
    user_email: string;
    user_status: number;
  }>;
}

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

export function OperadorEspecialidadesPage() {
  const { companyConfig } = useAuth();
  const [especialidades, setEspecialidades] = useState<EspecialidadData[]>([]);
  const [profesionales, setProfesionales] = useState<ProfesionalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [filterProfesionales, setFilterProfesionales] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // mostrar 6 cards por pagina

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [especialidadesResponse, profesionalesResponse] = await Promise.all([
        apiClient.get(CLIENT_API.GET_ESPECIALIDADES),
        apiClient.get(CLIENT_API.GET_USERS)
      ]);

      const especialidadesData = especialidadesResponse.data;
      const profesionalesData = profesionalesResponse.data.filter((user: ProfesionalData) =>
        user.user_role === "profesional"
      );

      // mapear especialidades con sus profesionales
      const especialidadesConProfesionales = especialidadesData.map((esp: EspecialidadData) => {
        const profesionalesDeEstaEspecialidad = profesionalesData.filter((prof: ProfesionalData) =>
          prof.especialidades && prof.especialidades.some((e) => e.id_especialidad === esp.id_especialidad)
        );

        return {
          ...esp,
          profesionales_count: profesionalesDeEstaEspecialidad.length,
          profesionales: profesionalesDeEstaEspecialidad.map((prof: ProfesionalData) => ({
            user_id: prof.user_id,
            user_complete_name: prof.user_complete_name,
            user_email: prof.user_email,
            user_status: prof.user_status
          }))
        };
      });

      setEspecialidades(especialidadesConProfesionales);
      setProfesionales(profesionalesData);
    } catch {
      toast.error(`Error al cargar las ${companyConfig?.plu_heading_especialidad?.toLowerCase() || "especialidades"}`);
    } finally {
      setIsLoading(false);
    }
  }, [companyConfig?.plu_heading_especialidad]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredEspecialidades = especialidades.filter((esp) => {
    const matchesSearch =
      esp.nombre_especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      esp.id_especialidad.toString().includes(searchTerm);

    const matchesEstado = filterEstado === "all" ||
      (filterEstado === "active" && esp.estado_especialidad === 1) ||
      (filterEstado === "inactive" && esp.estado_especialidad === 0);

    const matchesProfesionales = filterProfesionales === "all" ||
      (filterProfesionales === "with" && (esp.profesionales_count || 0) > 0) ||
      (filterProfesionales === "without" && (esp.profesionales_count || 0) === 0);

    return matchesSearch && matchesEstado && matchesProfesionales;
  });

  // calcular paginado
  const totalPages = Math.ceil(filteredEspecialidades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEspecialidades = filteredEspecialidades.slice(startIndex, endIndex);

  // resetear pagina cuando cambien los filtros
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
          <div className="flex flex-col md:flex-row gap-2 md:gap-0">
            <Badge variant="secondary" className="text-lg px-4 py-1">
              {filteredEspecialidades.length} de {especialidades.length}
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {profesionales.filter(p => p.user_status === 1).length} {profesionales.filter(p => p.user_status === 1).length === 1 
                ? (companyConfig?.sing_heading_profesional?.toLowerCase() || "profesional")
                : (companyConfig?.plu_heading_profesional?.toLowerCase() || "profesionales")
              } activo{profesionales.filter(p => p.user_status === 1).length !== 1 ? 's' : ''}
            </Badge>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedEspecialidades.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No se encontraron {companyConfig?.plu_heading_especialidad?.toLowerCase() || "especialidades"}
              </div>
            ) : (
              paginatedEspecialidades.map((especialidad) => (
                <Card key={especialidad.id_especialidad} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{especialidad.nombre_especialidad}</CardTitle>
                        
                        </div>
                      </div>
                      {getEstadoIcon(especialidad.estado_especialidad, especialidad.profesionales_count || 0)}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Estado:</span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap uppercase ${getEstadoColor(especialidad.estado_especialidad, especialidad.profesionales_count || 0)}`}
                        >
                          {getEstadoText(especialidad.estado_especialidad, especialidad.profesionales_count || 0)}
                        </span>
                      </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{companyConfig?.plu_heading_profesional || "profesionales"}:</span>
                          <Badge variant="outline" className="text-sm">
                            {especialidad.profesionales_count || 0} disponible{(especialidad.profesionales_count || 0) !== 1 ? 's' : ''}
                          </Badge>
                        </div>

                      {especialidad.profesionales && especialidad.profesionales.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{companyConfig?.plu_heading_profesional || "profesionales"} asignados:</span>
                          </div>
                          <div className="space-y-1 max-h-20 overflow-y-auto">
                            {especialidad.profesionales.map((prof) => (
                              <div key={prof.user_id} className="text-xs bg-muted/50 rounded px-2 py-1">
                                <div className="font-medium">{prof.user_complete_name}</div>
                                <div className="text-muted-foreground">{prof.user_email}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
