"use client";

import { useState, useEffect } from "react";
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
import { Plus, Edit, Lock, Unlock, Search, X } from "lucide-react";
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
import { config } from "@/lib/config";
import { SUPER_API } from "@/lib/superApi/config";

const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export function EmpresasPage() {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [userCounts, setUserCounts] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [showToggleDialog, setShowToggleDialog] = useState(false);
  const [companyToToggle, setCompanyToToggle] = useState<{ id: number; estado: number } | null>(null);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const [companiesRes, usersRes] = await Promise.all([
        apiClient.get(SUPER_API.GET_COMPANIES),
        apiClient.get(SUPER_API.GET_USERS),
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

      const counts: Record<number, number> = {};
      usersRes.data.forEach((user: { company_id: number }) => {
        if (user.company_id) {
          counts[user.company_id] = (counts[user.company_id] || 0) + 1;
        }
      });
      setUserCounts(counts);
    } catch (error) {
      console.error("Error obteniendo empresas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

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

  const handleToggleEstado = (companyId: number, currentEstado: number) => {
    setCompanyToToggle({ id: companyId, estado: currentEstado });
    setShowToggleDialog(true);
  };

  const confirmToggleEstado = async () => {
    if (!companyToToggle) return;

    try {
      const endpoint = SUPER_API.COMPANY_EDIT.replace("{id}", companyToToggle.id.toString());
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
                    <TableHead className="hidden md:table-cell w-[80px] text-center">Usuarios</TableHead>
                    <TableHead className="w-[140px] text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No se encontraron empresas
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompanies.map((company) => (
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
                        <TableCell className="hidden md:table-cell text-center font-medium">
                          {userCounts[company.company_id] || 0}
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

            <div className="text-sm text-muted-foreground">
              Mostrando {filteredCompanies.length} de {companies.length} empresas
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

