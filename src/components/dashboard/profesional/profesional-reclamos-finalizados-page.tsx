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
import { Eye, Search, X, Calendar, User } from "lucide-react";
import { ReclamoDetailSheet } from "@/components/features/reclamos/reclamo-detail-sheet";
import { toast } from "sonner";
import axios from "axios";
import { config } from "@/lib/config";
import { CLIENT_API } from "@/lib/clientApi/config";
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

export function ProfesionalReclamosFinalizadosPage() {
  const { companyConfig } = useAuth();
  const [reclamos, setReclamos] = useState<ReclamoData[]>([]);
  const [filteredReclamos, setFilteredReclamos] = useState<ReclamoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [selectedReclamo, setSelectedReclamo] = useState<ReclamoData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchReclamos = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(CLIENT_API.GET_RECLAMOS_PROFESIONAL);
      
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
  }, []);

  useEffect(() => {
    fetchReclamos();
  }, [fetchReclamos]);

  useEffect(() => {
    let filtered = reclamos;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((reclamo) =>
        reclamo.reclamo_titulo.toLowerCase().includes(searchLower) ||
        reclamo.reclamo_detalle.toLowerCase().includes(searchLower)
      );
    }

    if (filterEstado !== "all") {
      filtered = filtered.filter((reclamo) => reclamo.reclamo_estado === filterEstado);
    }

    setFilteredReclamos(filtered);
  }, [searchTerm, filterEstado, reclamos]);

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

  const estadosUnicos = Array.from(new Set(reclamos.map(r => r.reclamo_estado)));

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                Historial de {companyConfig?.plu_heading_reclamos || "Reclamos"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Todos tus {companyConfig?.plu_heading_reclamos?.toLowerCase() || "reclamos"} finalizados
              </p>
            </div>
            <Badge variant="secondary" className="px-4 py-1.5 text-sm">
              {filteredReclamos.length} de {reclamos.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por título o descripción..."
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
              <SelectTrigger className="w-[200px] cursor-pointer">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {estadosUnicos.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${ESTADO_COLORS[estado]}`}></span>
                      {estado}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabla */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : filteredReclamos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm || filterEstado !== "all"
                ? "No se encontraron reclamos que coincidan con los filtros"
                : "No hay reclamos finalizados"}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReclamos.map((reclamo) => (
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
                      <TableCell className="text-right">
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
        </CardContent>
      </Card>

      <ReclamoDetailSheet
        reclamo={selectedReclamo}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        userRole="profesional"
        onUpdate={handleUpdate}
      />
    </>
  );
}

