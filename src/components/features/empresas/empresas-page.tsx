"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Plus, Edit, Lock, Unlock, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { EmpresaFormSheet } from "@/components/features/empresas/empresa-form-sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import axios from "axios";
import { API_ROUTES } from "@/lib/api_routes";
import { getCompanyUpdateEndpoint } from "@/lib/apiHelpers";
import { apiClient } from "@/lib/apiClient";

interface CompanyData {
  company_id: number;
  company_unique_id: string;
  company_nombre: string;
  company_estado: number;
  company_email: string;
  company_phone: string;
  company_whatsapp?: string;
  company_telegram?: string;
  limite_operadores: number;
  limite_profesionales: number;
  limite_especialidades: number;
  reminder_manual: boolean;
}

interface UserCounts {
  owners: number;
  operadores: number;
  profesionales: number;
}

export function EmpresasPage() {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [userCounts, setUserCounts] = useState<Record<number, UserCounts>>({});
  const [especialidadesCounts, setEspecialidadesCounts] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [showToggleDialog, setShowToggleDialog] = useState(false);
  const [companyToToggle, setCompanyToToggle] = useState<{ id: number; estado: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [companiesRes, usersRes, especialidadesRes] = await Promise.all([
        apiClient.get(API_ROUTES.GET_COMPANIES),
        apiClient.get(API_ROUTES.GET_USERS),
        apiClient.get(API_ROUTES.GET_ESPECIALIDADES),
      ]);

      interface CompanyApiResponse {
        company_id: number;
        company_unique_id: string;
        company_nombre: string;
        company_estado: number | boolean;
        company_email: string;
        company_phone: string;
        company_whatsapp?: string;
        company_telegram?: string;
        limite_operadores: number;
        limite_profesionales: number;
        limite_especialidades: number;
        reminder_manual: number | boolean;
      }

      const companiesData = companiesRes.data.map((company: CompanyApiResponse): CompanyData => ({
        ...company,
        company_estado: (company.company_estado === 1 || company.company_estado === true) ? 1 : 0,
        reminder_manual: (company.reminder_manual === 1 || company.reminder_manual === true),
      }));

      setCompanies(companiesData);

      const counts: Record<number, UserCounts> = {};
      
      usersRes.data.forEach((user: { company_id: number; user_role: string }) => {
        if (user.company_id && user.user_role !== "superadmin") {
          if (!counts[user.company_id]) {
            counts[user.company_id] = { owners: 0, operadores: 0, profesionales: 0 };
          }
          
          switch (user.user_role) {
            case "owner":
              counts[user.company_id].owners++;
              break;
            case "operador":
              counts[user.company_id].operadores++;
              break;
            case "profesional":
              counts[user.company_id].profesionales++;
              break;
          }
        }
      });
      
      setUserCounts(counts);

      const especialidadesCounts: Record<number, number> = {};
      especialidadesRes.data.forEach((especialidad: { company_id: number }) => {
        if (especialidad.company_id) {
          especialidadesCounts[especialidad.company_id] = (especialidadesCounts[especialidad.company_id] || 0) + 1;
        }
      });
      setEspecialidadesCounts(especialidadesCounts);
    } catch (error) {
      console.error("Error obteniendo empresas:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.company_nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      company.company_id.toString().includes(searchTerm);

    const matchesEstado = filterEstado === "all" || 
      (filterEstado === "active" && company.company_estado === 1) ||
      (filterEstado === "inactive" && company.company_estado === 0);

    return matchesSearch && matchesEstado;
  });

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterEstado]);

  const handleToggleEstado = (companyId: number, currentEstado: number) => {
    setCompanyToToggle({ id: companyId, estado: currentEstado });
    setShowToggleDialog(true);
  };

  const confirmToggleEstado = async () => {
    if (!companyToToggle) return;

    try {
      const endpoint = getCompanyUpdateEndpoint(companyToToggle.id);
      const newEstado = companyToToggle.estado === 1 ? false : true;

      await apiClient.put(endpoint, {
        company_estado: newEstado,
      });

      await fetchCompanies();
      toast.success(newEstado ? "Empresa desbloqueada correctamente" : "Empresa bloqueada correctamente");
      setShowToggleDialog(false);
      setCompanyToToggle(null);
    } catch (error) {
      console.error("Error cambiando estado:", error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message;
        const status = error.response.status;
        
        if (status === 404) {
          toast.error("Empresa no encontrada.");
        } else if (status === 500) {
          toast.error("Error interno del servidor. Intenta nuevamente más tarde.");
        } else {
          toast.error(errorMessage || "Error al cambiar el estado de la empresa.");
        }
      } else {
        toast.error("Error de conexión. Verifica tu conexión a internet.");
      }
    }
  };

  const handleEdit = (company: CompanyData) => {
    setSelectedCompany(company);
    setIsSheetOpen(true);
  };

  const handleCreate = () => {
    setSelectedCompany(null);
    setIsSheetOpen(true);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setSelectedCompany(null);
  };

  const handleSuccess = () => {
    fetchCompanies();
  };

  return (
    <>
      {isLoading ? (
        <Card>
          <CardHeader className="h-24 bg-muted/50 animate-pulse"></CardHeader>
          <CardContent className="h-96 bg-muted/30 animate-pulse"></CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="border-b border-border pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-2xl">Gestión de Empresas</CardTitle>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-0" />
                Nueva empresa
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
                  <SelectItem value="all" className="cursor-pointer">Todas</SelectItem>
                  <SelectItem value="active" className="cursor-pointer">Activas</SelectItem>
                  <SelectItem value="inactive" className="cursor-pointer">Inactivas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">ID</TableHead>
                    <TableHead className="min-w-[140px]">CUIT/CUIL</TableHead>
                    <TableHead className="min-w-[200px]">Empresa</TableHead>
                    <TableHead className="w-[110px] text-center">Estado</TableHead>
                    <TableHead className="hidden md:table-cell w-[120px] text-start">Usuarios</TableHead>
                    <TableHead className="hidden lg:table-cell w-[100px] text-center">Especialidades</TableHead>
                    <TableHead className="w-[140px] text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No se encontraron empresas
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCompanies.map((company) => (
                      <TableRow key={company.company_id}>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {company.company_id}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {company.company_unique_id}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{company.company_nombre}</span>
                            <a 
                              href={`mailto:${company.company_email}`}
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              {company.company_email}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap uppercase ${
                              company.company_estado === 1
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {company.company_estado === 1 ? 'Activa' : 'Inactiva'}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center">
                          <div className="flex flex-col gap-1 text-xs">
                            <div className="flex justify-between gap-2">
                              <span className="text-muted-foreground">Owners:</span>
                              <span className="font-medium">{userCounts[company.company_id]?.owners || 0} / 1</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="text-muted-foreground">Operadores:</span>
                              <span className="font-medium">{userCounts[company.company_id]?.operadores || 0} / {company.limite_operadores}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="text-muted-foreground">Profesionales:</span>
                              <span className="font-medium">{userCounts[company.company_id]?.profesionales || 0} / {company.limite_profesionales}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-medium text-lg">
                              {especialidadesCounts[company.company_id] || 0}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              de {company.limite_especialidades}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleEdit(company)}
                              title="Editar empresa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleEstado(company.company_id, company.company_estado)}
                              className={company.company_estado === 1 ? 'text-destructive hover:text-destructive' : 'text-green-600 hover:text-green-600'}
                              title={company.company_estado === 1 ? 'Bloquear Empresa' : 'Desbloquear Empresa'}
                            >
                              {company.company_estado === 1 ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <Unlock className="h-4 w-4" />
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
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredCompanies.length)} de {filteredCompanies.length} empresas
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
      )}

      <EmpresaFormSheet
        isOpen={isSheetOpen}
        onClose={handleSheetClose}
        company={selectedCompany}
        onSuccess={handleSuccess}
      />

      <AlertDialog open={showToggleDialog} onOpenChange={setShowToggleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar cambio de estado?</AlertDialogTitle>
            <AlertDialogDescription>
              {companyToToggle?.estado === 1
                ? "¿Estás seguro de que deseas bloquear esta empresa? Los usuarios no podrán acceder."
                : "¿Estás seguro de que deseas desbloquear esta empresa?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleEstado}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

