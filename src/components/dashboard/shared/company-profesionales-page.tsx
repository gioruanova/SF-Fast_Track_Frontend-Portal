"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, ChevronLeft, ChevronRight, Mail, Phone } from "lucide-react";
import { GestionarAreaSheet } from "./gestionar-area-sheet";
import { toast } from "sonner";
import axios from "axios";
import { config } from "@/lib/config";
import { API_ROUTES } from "@/lib/api_routes";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { User, USER_STATUS } from "@/types/users";

const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ProfesionalData extends User {
  last_login?: string;
}

interface CompanyProfesionalesPageProps {
  userRole: "owner" | "operador";
}

export function CompanyProfesionalesPage({ userRole }: CompanyProfesionalesPageProps) {
  const { companyConfig } = useAuth();
  const [profesionales, setProfesionales] = useState<ProfesionalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProfesionales = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(API_ROUTES.GET_USERS);

      const profesionalesData = response.data.filter((user: ProfesionalData) =>
        user.user_role === "profesional"
      );

      setProfesionales(profesionalesData);
    } catch {
      toast.error("Error al cargar los profesionales");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfesionales();
  }, []);

  const filteredProfesionales = profesionales.filter((prof) => {
    const matchesSearch =
      prof.user_complete_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.user_dni.includes(searchTerm);

    const matchesEstado = filterEstado === "all" ||
      (filterEstado === "active" && prof.user_status === USER_STATUS.ACTIVO) ||
      (filterEstado === "inactive" && prof.user_status === USER_STATUS.BLOQUEADO);

    return matchesSearch && matchesEstado;
  });

  const totalPages = Math.ceil(filteredProfesionales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProfesionales = filteredProfesionales.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterEstado]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">
              Gestión de {companyConfig?.plu_heading_profesional || "Profesionales"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 text-balance">
              Administra los {companyConfig?.plu_heading_profesional?.toLowerCase() || "profesionales"} de tu empresa
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-1">
            {filteredProfesionales.length} de {profesionales.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o DNI..."
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
              <SelectItem value="active" className="cursor-pointer">Activos</SelectItem>
              <SelectItem value="inactive" className="cursor-pointer">Inactivos</SelectItem>
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
                  <TableHead>{companyConfig?.sing_heading_profesional || "Profesional"}</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Especialidades</TableHead>
                  <TableHead className="w-[120px] text-center">Estado</TableHead>
                  <TableHead className="w-[140px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProfesionales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron {companyConfig?.sing_heading_profesional?.toLowerCase() || "profesionales"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProfesionales.map((profesional) => (
                    <TableRow key={profesional.user_id}>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {profesional.user_id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{profesional.user_complete_name}</p>
                          <p className="text-sm text-muted-foreground">DNI: {profesional.user_dni}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${profesional.user_email}`} className="text-primary hover:underline">{profesional.user_email}</a>
                          </div>
                          {profesional.user_phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <a href={`tel:${profesional.user_phone}`} className="text-primary hover:underline">{profesional.user_phone}</a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {profesional.especialidades && profesional.especialidades.length > 0 ? (
                            profesional.especialidades.map((esp) => (
                              <div key={esp.id_asignacion} className="text-sm">
                                <span className="font-mono text-muted-foreground">{esp.id_especialidad}</span>
                                <span className="mx-1">-</span>
                                <span>{esp.Especialidad.nombre_especialidad}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">Sin especialidades</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap uppercase ${profesional.user_status === USER_STATUS.ACTIVO
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                        >
                          {profesional.user_status === USER_STATUS.ACTIVO ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <GestionarAreaSheet
                          profesional={profesional}
                          onUpdate={fetchProfesionales}
                          userRole={userRole}
                        />
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
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProfesionales.length)} de {filteredProfesionales.length} {companyConfig?.plu_heading_profesional?.toLowerCase() || "profesionales"}
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
