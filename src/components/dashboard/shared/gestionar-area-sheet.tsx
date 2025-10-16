"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { config } from "@/lib/config";
import { CLIENT_API } from "@/lib/clientApi/config";
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
}

interface ProfesionalData {
  user_id: number;
  user_complete_name: string;
  user_email: string;
  user_status: number;
  especialidades?: Array<{
    id_asignacion: number;
    id_especialidad: number;
    Especialidad: {
      nombre_especialidad: string;
    };
  }>;
}

interface GestionarAreaSheetProps {
  profesional: ProfesionalData;
  onUpdate: () => void;
  userRole: "owner" | "operador";
}

export function GestionarAreaSheet({ profesional, onUpdate }: GestionarAreaSheetProps) {
  const { companyConfig } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [especialidades, setEspecialidades] = useState<EspecialidadData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAsignacion, setEditingAsignacion] = useState<string | null>(null);
  const [selectedEditEspecialidad, setSelectedEditEspecialidad] = useState<string>("");
  const [deletingAsignacion, setDeletingAsignacion] = useState<string | null>(null);

  const fetchEspecialidades = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(CLIENT_API.GET_ESPECIALIDADES);
      setEspecialidades(response.data);
    } catch {
      toast.error("Error al cargar las especialidades");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEspecialidades();
    }
  }, [isOpen]);

  const handleCrearAsignacion = async () => {
    if (!selectedEspecialidad) {
        toast.error(`Selecciona una ${companyConfig?.sing_heading_especialidad?.toLowerCase() || "especialidad"}`);
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        profesional_id: profesional.user_id,
        especialidad_id: parseInt(selectedEspecialidad)
      };
      
      console.log("Enviando payload:", payload);
      console.log("URL:", CLIENT_API.CREAR_ASIGNACION_ESPECIALIDAD);
      
      const response = await apiClient.post(CLIENT_API.CREAR_ASIGNACION_ESPECIALIDAD, payload);
      
      console.log("Respuesta del servidor:", response.data);
      
      toast.success(`${companyConfig?.sing_heading_especialidad || "Especialidad"} asignada correctamente`);
      onUpdate();
      setIsOpen(false);
      setSelectedEspecialidad("");
    } catch (error: unknown) {
      console.error("Error completo:", error);
      const axiosError = error as { response?: { data?: { error?: string }; status?: number }; message?: string };
      console.error("Error response:", axiosError.response?.data);
      console.error("Error status:", axiosError.response?.status);
      
      if (axiosError.response?.status === 400) {
        const errorMessage = axiosError.response?.data?.error || "Datos inválidos";
        toast.error(errorMessage);
      } else if (axiosError.response?.status === 404) {
        const errorMessage = axiosError.response?.data?.error || "Profesional o especialidad no encontrados";
        toast.error(errorMessage);
      } else if (axiosError.response?.status === 409) {
        toast.error("La especialidad ya está asignada al profesional");
      } else {
        toast.error(`Error al asignar la especialidad: ${axiosError.response?.data?.error || axiosError.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditarAsignacion = async (idAsignacion: string) => {
    if (!selectedEditEspecialidad) {
      toast.error(`Selecciona una ${companyConfig?.sing_heading_especialidad?.toLowerCase() || "especialidad"}`);
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        especialidad_id: parseInt(selectedEditEspecialidad)
      };
      
      const url = CLIENT_API.EDITAR_ASIGNACION_ESPECIALIDAD.replace('{id_asignacion}', idAsignacion);
      
      console.log("Editando asignación:", payload);
      console.log("URL:", url);
      
      const response = await apiClient.put(url, payload);
      
      console.log("Respuesta del servidor:", response.data);
      
      toast.success(`${companyConfig?.sing_heading_especialidad || "Especialidad"} actualizada correctamente`);
      onUpdate();
      setEditingAsignacion(null);
      setSelectedEditEspecialidad("");
    } catch (error: unknown) {
      console.error("Error completo:", error);
      const axiosError = error as { response?: { data?: { error?: string }; status?: number }; message?: string };
      console.error("Error response:", axiosError.response?.data);
      console.error("Error status:", axiosError.response?.status);
      
      if (axiosError.response?.status === 400) {
        const errorMessage = axiosError.response?.data?.error || "Datos inválidos";
        toast.error(errorMessage);
      } else if (axiosError.response?.status === 404) {
        const errorMessage = axiosError.response?.data?.error || "Asignación no encontrada";
        toast.error(errorMessage);
      } else if (axiosError.response?.status === 409) {
        toast.error("La especialidad ya está asignada al profesional");
      } else {
        toast.error(`Error al actualizar la especialidad: ${axiosError.response?.data?.error || axiosError.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEliminarAsignacion = async (idAsignacion: string) => {
    try {
      setIsSubmitting(true);
      
      const url = CLIENT_API.ELIMINAR_ASIGNACION_ESPECIALIDAD.replace('{id_asignacion}', idAsignacion);
      
      console.log("Eliminando asignación:", idAsignacion);
      console.log("URL:", url);
      
      const response = await apiClient.delete(url);
      
      console.log("Respuesta del servidor:", response.data);
      
      toast.success(`${companyConfig?.sing_heading_especialidad || "Especialidad"} eliminada correctamente`);
      onUpdate();
      setDeletingAsignacion(null);
    } catch (error: unknown) {
      console.error("Error completo:", error);
      const axiosError = error as { response?: { data?: { error?: string }; status?: number }; message?: string };
      console.error("Error response:", axiosError.response?.data);
      console.error("Error status:", axiosError.response?.status);
      
      if (axiosError.response?.status === 404) {
        const errorMessage = axiosError.response?.data?.error || "Asignación no encontrada";
        toast.error(errorMessage);
      } else {
        toast.error(`Error al eliminar la especialidad: ${axiosError.response?.data?.error || axiosError.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  const especialidadesDisponibles = especialidades.filter(esp => 
    esp.estado_especialidad === 1 && 
    !profesional.especialidades?.some(profEsp => profEsp.id_especialidad === esp.id_especialidad)
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setIsOpen(true)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Gestionar {companyConfig?.sing_heading_especialidad?.toLowerCase() || "especialidades"}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            Gestionar {companyConfig?.sing_heading_especialidad || "Especialidades"} - {profesional.user_complete_name}
          </SheetTitle>
          <SheetDescription>
            Asigna {companyConfig?.plu_heading_especialidad?.toLowerCase() || "especialidades"} al {companyConfig?.sing_heading_profesional?.toLowerCase() || "profesional"}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {/* Especialidades actuales */}
          <div>
            <h4 className="text-sm font-medium mb-2">{companyConfig?.plu_heading_especialidad || "Especialidades"} asignadas:</h4>
            {profesional.especialidades && profesional.especialidades.length > 0 ? (
              <div className="space-y-2">
                {profesional.especialidades.map((esp) => (
                  <div key={esp.id_asignacion} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {esp.Especialidad.nombre_especialidad}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingAsignacion(esp.id_asignacion.toString());
                          setSelectedEditEspecialidad(esp.id_especialidad.toString());
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingAsignacion(esp.id_asignacion.toString())}
                        className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">Sin {companyConfig?.plu_heading_especialidad?.toLowerCase() || "especialidades"} asignadas</p>
            )}
          </div>

          {/* Asignar nueva especialidad */}
          <div>
            <h4 className="text-sm font-medium mb-2">Agregar {companyConfig?.sing_heading_especialidad?.toLowerCase() || "especialidad"}:</h4>
            <div className="space-y-2">
              <Select value={selectedEspecialidad} onValueChange={setSelectedEspecialidad}>
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder={`Selecciona una ${companyConfig?.sing_heading_especialidad?.toLowerCase() || "especialidad"}`} />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Cargando...</SelectItem>
                  ) : especialidadesDisponibles.length > 0 ? (
                    especialidadesDisponibles.map((esp) => (
                      <SelectItem key={esp.id_especialidad} value={esp.id_especialidad.toString()} className="cursor-pointer">
                        {esp.nombre_especialidad}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-available" disabled>No hay {companyConfig?.plu_heading_especialidad?.toLowerCase() || "especialidades"} disponibles</SelectItem>
                  )}
                </SelectContent>
              </Select>

              {selectedEspecialidad && (
                <Button
                  onClick={handleCrearAsignacion}
                  disabled={isSubmitting}
                  size="sm"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {isSubmitting ? "Asignando..." : "Asignar"}
                </Button>
              )}
            </div>
          </div>

          {/* Editar asignación existente */}
          {editingAsignacion && (
            <div>
              <h4 className="text-sm font-medium mb-2">Editar {companyConfig?.sing_heading_especialidad?.toLowerCase() || "especialidad"}:</h4>
              <div className="space-y-2">
                <Select value={selectedEditEspecialidad} onValueChange={setSelectedEditEspecialidad}>
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue placeholder={`Selecciona una ${companyConfig?.sing_heading_especialidad?.toLowerCase() || "especialidad"}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>Cargando...</SelectItem>
                    ) : especialidades.length > 0 ? (
                      especialidades.map((esp) => (
                        <SelectItem key={esp.id_especialidad} value={esp.id_especialidad.toString()} className="cursor-pointer">
                          {esp.nombre_especialidad}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-available" disabled>No hay {companyConfig?.plu_heading_especialidad?.toLowerCase() || "especialidades"} disponibles</SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditarAsignacion(editingAsignacion)}
                    disabled={isSubmitting}
                    size="sm"
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    {isSubmitting ? "Actualizando..." : "Actualizar"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingAsignacion(null);
                      setSelectedEditEspecialidad("");
                    }}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Confirmar eliminación */}
          {deletingAsignacion && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-red-600">Eliminar {companyConfig?.sing_heading_especialidad?.toLowerCase() || "especialidad"}:</h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  ¿Estás seguro de que quieres eliminar esta asignación? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEliminarAsignacion(deletingAsignacion)}
                    disabled={isSubmitting}
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {isSubmitting ? "Eliminando..." : "Eliminar"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDeletingAsignacion(null)}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Especialidades disponibles - más muted */}
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">{companyConfig?.plu_heading_especialidad || "Especialidades"} en la empresa:</h4>
            <div className="flex flex-wrap gap-1">
              {especialidades.map((esp) => (
                <Badge 
                  key={esp.id_especialidad} 
                  variant="outline"
                  className="text-xs text-muted-foreground"
                >
                  {esp.nombre_especialidad}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
