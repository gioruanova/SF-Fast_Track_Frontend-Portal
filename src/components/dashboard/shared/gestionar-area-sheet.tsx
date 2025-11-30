"use client";

import { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEspecialidades } from "@/hooks/especialidades/useEspecialidades";
import { useProfesionalEspecialidad } from "@/hooks/profesional-especialidad/useProfesionalEspecialidad";

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
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string>("");
  const [deletingAsignacion, setDeletingAsignacion] = useState<string | null>(null);

  const {
    especialidades,
    isLoading: especialidadesLoading,
    fetchEspecialidades,
  } = useEspecialidades({ autoFetch: false });

  const {
    createAsignacion,
    deleteAsignacion,
    isLoading: asignacionesLoading,
  } = useProfesionalEspecialidad({ autoFetch: false });

  const isLoading = especialidadesLoading || asignacionesLoading;

  useEffect(() => {
    if (isOpen) {
      fetchEspecialidades();
    }
  }, [isOpen, fetchEspecialidades]);

  const handleCrearAsignacion = async () => {
    if (!selectedEspecialidad) {
      return;
    }

    const success = await createAsignacion({
      profesional_id: profesional.user_id,
      especialidad_id: parseInt(selectedEspecialidad),
    });

    if (success) {
      onUpdate();
      setIsOpen(false);
      setSelectedEspecialidad("");
    }
  };

  const handleEliminarAsignacion = async (asignacionId: string) => {
    const success = await deleteAsignacion(parseInt(asignacionId));

    if (success) {
      onUpdate();
      setDeletingAsignacion(null);
    }
  };

  const especialidadesDisponibles = useMemo(() => {
    return especialidades.filter(
      (esp) =>
        esp.estado_especialidad === 1 &&
        !profesional.especialidades?.some(
          (profEsp) => profEsp.id_especialidad === esp.id_especialidad
        )
    );
  }, [especialidades, profesional.especialidades]);

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
      <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>
            Gestionar {companyConfig?.sing_heading_especialidad || "Especialidades"} - {profesional.user_complete_name}
          </SheetTitle>
          <SheetDescription>
            Asigna {companyConfig?.plu_heading_especialidad?.toLowerCase() || "especialidades"} al {companyConfig?.sing_heading_profesional?.toLowerCase() || "profesional"}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
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
                  disabled={asignacionesLoading}
                  size="sm"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {asignacionesLoading ? "Asignando..." : "Asignar"}
                </Button>
              )}
            </div>
          </div>

          {deletingAsignacion && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-red-600">Eliminar {companyConfig?.sing_heading_especialidad?.toLowerCase() || "especialidad"}:</h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  ¿Estás seguro de que quieres eliminar esta asignación? Esta acción no se puede deshacer.
                </p>
                <ul>
                  <li className="text-xs text-red-400 list-disc ml-4 mb-2">
                    Tenga en cuenta que al hacer la actualización, cualquier{" "}
                    {companyConfig?.sing_heading_reclamos?.toLowerCase() || "reclamo"} con el
                    nombre actual, no se verá afectado
                  </li>
                  <li className="text-xs text-red-400 list-disc ml-4">
                    Cualquier{" "}
                    {companyConfig?.sing_heading_profesional?.toLowerCase() || "profesional"} que
                    actualmente tenga{" "}
                    {companyConfig?.plu_heading_reclamos?.toLowerCase() || "reclamos"} con este
                    nombre, tampoco verán el cambio
                  </li>
                </ul>
                <div className="flex gap-2">

                  <Button
                    onClick={() => handleEliminarAsignacion(deletingAsignacion)}
                    disabled={asignacionesLoading}
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {asignacionesLoading ? "Eliminando..." : "Eliminar"}
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
