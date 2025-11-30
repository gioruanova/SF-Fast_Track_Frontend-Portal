"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Power,
  PowerOff,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { EspecialidadFormSheet } from "@/components/features/especialidades/especialidad-form-sheet";
import { useEspecialidades } from "@/hooks/especialidades/useEspecialidades";
import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/api_routes";
import { Especialidad } from "@/types/especialidades";

interface CompanyData {
  company_id: number;
  company_nombre: string;
}

export function SuperadminEspecialidadesPage() {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<Especialidad | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const {
    especialidades,
    isLoading,
    fetchEspecialidades,
    toggleEspecialidadStatus,
  } = useEspecialidades({ autoFetch: true });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await apiClient.get<CompanyData[]>(API_ROUTES.GET_COMPANIES);
        setCompanies(response.data);
      } catch {
      }
    };
    fetchCompanies();
  }, []);

  const especialidadesWithCompanyNames = useMemo(() => {
    return especialidades.map((esp) => {
      const company = companies.find((c) => c.company_id === esp.company_id);
      return {
        ...esp,
        company_nombre: company?.company_nombre || "Empresa no encontrada",
      };
    });
  }, [especialidades, companies]);

  const filteredEspecialidades = useMemo(() => {
    return especialidadesWithCompanyNames.filter((esp) => {
      const matchesSearch =
        esp.nombre_especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        esp.company_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        esp.id_especialidad.toString().includes(searchTerm) ||
        esp.company_id.toString().includes(searchTerm);

      const matchesCompany =
        filterCompany === "all" || esp.company_id.toString() === filterCompany;

      const matchesEstado =
        filterEstado === "all" ||
        (filterEstado === "active" && esp.estado_especialidad === 1) ||
        (filterEstado === "inactive" && esp.estado_especialidad === 0);

      return matchesSearch && matchesCompany && matchesEstado;
    });
  }, [especialidadesWithCompanyNames, searchTerm, filterCompany, filterEstado]);

  const totalPages = Math.ceil(filteredEspecialidades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEspecialidades = filteredEspecialidades.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCompany, filterEstado]);

  const handleToggleEstado = async (especialidadId: number, currentEstado: number) => {
    await toggleEspecialidadStatus(especialidadId, currentEstado);
  };

  const handleEdit = (especialidad: Especialidad) => {
    setSelectedEspecialidad(especialidad);
    setIsSheetOpen(true);
  };

  const handleCreate = () => {
    setSelectedEspecialidad(null);
    setIsSheetOpen(true);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setSelectedEspecialidad(null);
  };

  const handleSuccess = () => {
    fetchEspecialidades();
  };

  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-2xl">Gestión de Especialidades</CardTitle>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-0" />
            Nueva especialidad
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, empresa o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
                onClick={() => setSearchTerm("")}
                title="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Select value={filterCompany} onValueChange={setFilterCompany}>
            <SelectTrigger className="w-full md:w-[200px] cursor-pointer">
              <SelectValue placeholder="Filtrar por empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">Todas las empresas</SelectItem>
              {companies.map((company) => (
                <SelectItem 
                  key={company.company_id} 
                  value={company.company_id.toString()}
                  className="cursor-pointer"
                >
                  {company.company_id} - {company.company_nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger className="w-full md:w-[150px] cursor-pointer">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">Todos</SelectItem>
              <SelectItem value="active" className="cursor-pointer">Activas</SelectItem>
              <SelectItem value="inactive" className="cursor-pointer">Inactivas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead className="min-w-[200px]">Especialidad</TableHead>
                <TableHead className="min-w-[150px]">Empresa</TableHead>
                <TableHead className="w-[100px] text-center">Estado</TableHead>
                <TableHead className="w-[120px] text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="animate-pulse">Cargando...</div>
                  </TableCell>
                </TableRow>
              ) : filteredEspecialidades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No se encontraron especialidades
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEspecialidades.map((especialidad) => (
                  <TableRow key={especialidad.id_especialidad}>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {especialidad.id_especialidad}
                    </TableCell>
                    <TableCell className="font-medium">
                      {especialidad.nombre_especialidad}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">
                          {especialidad.company_nombre}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ID: {especialidad.company_id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap uppercase ${
                          especialidad.estado_especialidad === 1
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {especialidad.estado_especialidad === 1
                          ? "Activa"
                          : "Inactiva"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleEdit(especialidad)}
                          title="Editar especialidad"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleToggleEstado(
                              especialidad.id_especialidad,
                              especialidad.estado_especialidad
                            )
                          }
                          className={
                            especialidad.estado_especialidad === 1
                              ? "text-destructive hover:text-destructive"
                              : "text-green-600 hover:text-green-600"
                          }
                          title={
                            especialidad.estado_especialidad === 1
                              ? "Desactivar especialidad"
                              : "Activar especialidad"
                          }
                        >
                          {especialidad.estado_especialidad === 1 ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredEspecialidades.length)} de {filteredEspecialidades.length} especialidades
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

      <EspecialidadFormSheet
        isOpen={isSheetOpen}
        onClose={handleSheetClose}
        especialidad={selectedEspecialidad}
        onSuccess={handleSuccess}
      />
    </Card>
  );
}
