"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Search, X, Calendar, User, Download, Loader2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { ReclamoDetailSheet } from "@/components/features/reclamos/reclamo-detail-sheet";
import { toast } from "sonner";
import axios from "axios";
import { config } from "@/lib/config";
import { API_ROUTES } from "@/lib/api_routes";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  "CERRADO": "bg-green-500",
  "CANCELADO": "bg-red-500",
};

interface CompanyReclamosFinalizadosPageProps {
  userRole: "owner" | "operador";
}

export function CompanyReclamosFinalizadosPage({ userRole }: CompanyReclamosFinalizadosPageProps) {
  const { companyConfig } = useAuth();
  const [reclamos, setReclamos] = useState<ReclamoData[]>([]);
  const [filteredReclamos, setFilteredReclamos] = useState<ReclamoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [selectedReclamo, setSelectedReclamo] = useState<ReclamoData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [downloadingType, setDownloadingType] = useState<'inactive' | 'all' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchReclamos = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(API_ROUTES.GET_RECLAMOS);

      const finishedReclamos = response.data
        .filter((r: ReclamoData) => r.reclamo_estado === "CERRADO" || r.reclamo_estado === "CANCELADO")
        .sort((a: ReclamoData, b: ReclamoData) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      setReclamos(finishedReclamos);
      setFilteredReclamos(finishedReclamos);
    } catch (error) {
      console.error("Error obteniendo reclamos:", error);
      toast.error("Error al cargar los reclamos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReclamos();
  }, []);

  useEffect(() => {
    let filtered = reclamos;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((reclamo) =>
        reclamo.reclamo_titulo.toLowerCase().includes(searchLower) ||
        reclamo.reclamo_detalle.toLowerCase().includes(searchLower) ||
        reclamo.cliente_complete_name.toLowerCase().includes(searchLower) ||
        reclamo.reclamo_id.toString().includes(searchTerm)
      );
    }

    if (filterEstado !== "all") {
      filtered = filtered.filter((reclamo) => reclamo.reclamo_estado === filterEstado);
    }

    setFilteredReclamos(filtered);
  }, [searchTerm, filterEstado, reclamos]);

  const totalPages = Math.ceil(filteredReclamos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReclamos = filteredReclamos.slice(startIndex, endIndex);

useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterEstado]);

  const handleViewDetails = (reclamo: ReclamoData) => {
    setSelectedReclamo(reclamo);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedReclamo(null);
  };

  const handleUpdate = () => {
    fetchReclamos();
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleDownloadReport = async (type: 'inactive' | 'all') => {
    try {
      setDownloadingType(type);

      const endpoint = API_ROUTES.RECLAMO_DESCARGA.replace('{type}', type);
      const response = await apiClient.get(endpoint, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-oficedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers['content-disposition'];
      let filename;

      if (contentDisposition) {
        const matches = /filename[^;=\n]*=\s*([^;\n]*)/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, '').trim();
        }
      }

      if (!filename) {
        const fecha = Date.now();
        const empresa = companyConfig?.company?.company_nombre || 'Empresa';
        const tipoReporte = type === 'inactive' ? 'Fuera de curso' : 'Historico';
        const heading = companyConfig?.plu_heading_reclamos || 'Reclamos';
        filename = `${empresa} - Reporte ${heading} - [${tipoReporte}]_${fecha}.xlsx`;
      }

      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Reporte descargado exitosamente");
    } catch (error) {
      console.error("Error descargando reporte:", error);
      toast.error("Error al descargar el reporte");
    } finally {
      setDownloadingType(null);
    }
  };

  const estadosUnicos = Array.from(new Set(reclamos.map(r => r.reclamo_estado)));

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">
                Historial de {companyConfig?.plu_heading_reclamos ?? "Reclamos"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 text-balance">
                Puede ver el detalle de  {(companyConfig?.plu_heading_reclamos ?? "Reclamos").toLowerCase()} en el tiemppo.
              </p>
            </div>
            <div className="flex items-start md:items-center flex-col md:flex-row gap-2 md:gap-1">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                {filteredReclamos.length} de {reclamos.length}
              </Badge>

              <Button
                onClick={() => handleDownloadReport('inactive')}
                disabled={downloadingType !== null || reclamos.length === 0}
                variant="default"
                size="sm"
                title={`Descargar reporte de ${companyConfig?.plu_heading_reclamos ?? "Reclamos"} ya finalizados/as`}
              >
                {downloadingType === 'inactive' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-0" />
                )}
                Cerrados/as
              </Button>

              <Button
                onClick={() => handleDownloadReport('all')}
                disabled={downloadingType !== null || reclamos.length <= 0}
                variant="default"
                size="sm"
              >
                {downloadingType === 'all' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-0" />
                )}
                Todos
              </Button>
              <Button onClick={fetchReclamos} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex  mb-6 flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Buscar por id de ${companyConfig?.sing_heading_reclamos?.toLowerCase() || "reclamo"}, por título, descripción o ${companyConfig?.sing_heading_solicitante?.toLowerCase() || "cliente"}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchTerm && (
                <Button
                  variant="default"
                  size="sm"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="md:w-[200px] w-auto cursor-pointer">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">Todos los estados</SelectItem>
                {estadosUnicos.map((estado) => (
                  <SelectItem key={estado} value={estado} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${ESTADO_COLORS[estado]}`}></span>
                      {estado}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : filteredReclamos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm || filterEstado !== "all"
                ? `No se encontraron ${companyConfig?.plu_heading_reclamos?.toLowerCase() || "reclamos"} que coincidan con los filtros`
                : `No se encontro historial de ${companyConfig?.plu_heading_reclamos?.toLowerCase() || "reclamos"}`}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>{companyConfig?.sing_heading_solicitante}</TableHead>
                    <TableHead>{companyConfig?.sing_heading_profesional}</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>{companyConfig?.sing_heading_especialidad}</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReclamos.map((reclamo) => (
                    <TableRow key={reclamo.reclamo_id}>
                      <TableCell className="font-medium">#{reclamo.reclamo_id}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium truncate">{reclamo.reclamo_titulo}</p>
                          <p className="text-xs text-muted-foreground truncate">{reclamo.reclamo_detalle}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${ESTADO_COLORS[reclamo.reclamo_estado]}`}></span>
                          <span className="text-sm">{reclamo.reclamo_estado}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {reclamo.cliente_complete_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{reclamo.profesional}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {format(parseISO(reclamo.agenda_fecha), "dd/MM/yyyy", { locale: es })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {reclamo.nombre_especialidad}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleViewDetails(reclamo)}
                        >
                          <Eye className="h-4 w-4 mr-0" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex flex-col gap-4 mt-6">
            <div className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredReclamos.length)} de {filteredReclamos.length} {companyConfig?.plu_heading_reclamos?.toLowerCase() || "reclamos"} ya finalizados/as
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

      <ReclamoDetailSheet
        reclamo={selectedReclamo}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        userRole={userRole}
        onUpdate={handleUpdate}
      />
    </div>
  );
}

