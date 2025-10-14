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
import { Eye, Search, X, Building2 } from "lucide-react";
import { ReclamoDetailSheet } from "@/components/features/reclamos/reclamo-detail-sheet";
import { toast } from "sonner";
import axios from "axios";
import { config } from "@/lib/config";
import { SUPER_API } from "@/lib/superApi/config";
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
  company_name: string;
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

export function SuperadminReclamosPage() {
  const [reclamos, setReclamos] = useState<ReclamoData[]>([]);
  const [filteredReclamos, setFilteredReclamos] = useState<ReclamoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [selectedReclamo, setSelectedReclamo] = useState<ReclamoData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [reclamosRes] = await Promise.all([
        apiClient.get(SUPER_API.GET_RECLAMOS),
        apiClient.get(SUPER_API.GET_COMPANIES),
      ]);

      const sortedReclamos = reclamosRes.data.sort((a: ReclamoData, b: ReclamoData) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setReclamos(sortedReclamos);
      setFilteredReclamos(sortedReclamos);
    } catch (error) {
      console.error("Error obteniendo datos:", error);
      toast.error("Error al cargar los reclamos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let filtered = reclamos;

    // Filtro de búsqueda (título, descripción, especialidad)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((reclamo) =>
        reclamo.reclamo_titulo.toLowerCase().includes(searchLower) ||
        reclamo.reclamo_detalle.toLowerCase().includes(searchLower) ||
        reclamo.nombre_especialidad.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado
    if (filterEstado !== "all") {
      filtered = filtered.filter((reclamo) => reclamo.reclamo_estado === filterEstado);
    }

    // Filtro por empresa
    if (filterCompany !== "all") {
      filtered = filtered.filter((reclamo) => reclamo.company_name === filterCompany);
    }

    setFilteredReclamos(filtered);
  }, [searchTerm, filterEstado, filterCompany, reclamos]);

  const handleViewDetails = (reclamo: ReclamoData) => {
    setSelectedReclamo(reclamo);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedReclamo(null);
  };

  const handleUpdate = () => {
    fetchData();
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const estadosUnicos = Array.from(new Set(reclamos.map(r => r.reclamo_estado)));
  const empresasUnicas = Array.from(new Set(reclamos.map(r => r.company_name))).sort();

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Gestión de Reclamos</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Visualiza y gestiona todos los reclamos del sistema
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {filteredReclamos.length} de {reclamos.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, descripción o especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filtro por Estado */}
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full md:w-[200px] cursor-pointer">
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

            {/* Filtro por Empresa */}
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="w-full md:w-[200px] cursor-pointer">
                <SelectValue placeholder="Filtrar por empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las empresas</SelectItem>
                {empresasUnicas.map((empresa) => (
                  <SelectItem key={empresa} value={empresa}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3" />
                      {empresa}
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
              {searchTerm || filterEstado !== "all" || filterCompany !== "all"
                ? "No se encontraron reclamos que coincidan con los filtros"
                : "No hay reclamos"}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Empresa</TableHead>
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
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          {reclamo.company_name}
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
        userRole="superadmin"
        onUpdate={handleUpdate}
      />
    </>
  );
}

