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
import { OwnerEspecialidadFormSheet } from "@/components/dashboard/owner/owner-especialidad-form-sheet";
import { useEspecialidades } from "@/hooks/especialidades/useEspecialidades";
import { useAuth } from "@/context/AuthContext";
import { Especialidad } from "@/types/especialidades";

export function OwnerEspecialidadesPage() {
  const { companyConfig } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredEspecialidades = useMemo(() => {
    return especialidades.filter((esp) => {
      const matchesSearch =
        esp.nombre_especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        esp.id_especialidad.toString().includes(searchTerm);

      const matchesEstado =
        filterEstado === "all" ||
        (filterEstado === "active" && esp.estado_especialidad === 1) ||
        (filterEstado === "inactive" && esp.estado_especialidad === 0);

      return matchesSearch && matchesEstado;
    });
  }, [especialidades, searchTerm, filterEstado]);

  const totalPages = Math.ceil(filteredEspecialidades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEspecialidades = filteredEspecialidades.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterEstado]);

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
          <div>
            <CardTitle className="text-2xl">Gestión de {companyConfig?.plu_heading_especialidad || "Especialidades"}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1 text-balance">
              Administra las {companyConfig?.plu_heading_especialidad?.toLowerCase() || "especialidades"} de tu empresa
            </p>
          </div>
          <Button onClick={handleCreate} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-0" />
            Nueva {companyConfig?.plu_heading_especialidad?.slice(0, -1) || "Especialidad"}
          </Button>
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
                onClick={() => setSearchTerm("")}
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
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="w-[120px] text-center">Estado</TableHead>
                  <TableHead className="w-[140px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEspecialidades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
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
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap uppercase ${
                            especialidad.estado_especialidad === 1
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {especialidad.estado_especialidad === 1 ? 'Activa' : 'Inactiva'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(especialidad)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleEstado(especialidad.id_especialidad, especialidad.estado_especialidad)}
                          >
                            {especialidad.estado_especialidad === 1 ? (
                              <PowerOff className="h-4 w-4 text-red-500" />
                            ) : (
                              <Power className="h-4 w-4 text-green-500" />
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

      <OwnerEspecialidadFormSheet
        isOpen={isSheetOpen}
        onClose={handleSheetClose}
        especialidad={selectedEspecialidad}
        onSuccess={handleSuccess}
      />
    </Card>
  );
}
