"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";
import { config } from "@/lib/config";
import { CLIENT_API } from "@/lib/clientApi/config";

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
  company_id: number;
}

interface EspecialidadFormData {
  nombre_especialidad: string;
}

interface OwnerEspecialidadFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  especialidad: EspecialidadData | null;
  onSuccess: () => void;
}

export function OwnerEspecialidadFormSheet({
  isOpen,
  onClose,
  especialidad,
  onSuccess,
}: OwnerEspecialidadFormSheetProps) {
  const [formData, setFormData] = useState<EspecialidadFormData>({
    nombre_especialidad: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!especialidad;

  useEffect(() => {
    if (isOpen) {
      if (especialidad) {
        setFormData({
          nombre_especialidad: especialidad.nombre_especialidad,
        });
      } else {
        setFormData({
          nombre_especialidad: "",
        });
      }
    }
  }, [isOpen, especialidad]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre_especialidad.trim()) {
      toast.error("El nombre de la especialidad es requerido");
      return;
    }

    try {
      setIsLoading(true);

      if (isEditing) {
        // Editar especialidad existente
        await apiClient.put(
          CLIENT_API.EDIT_ESPECIALIDADES.replace("{id_especialidad}", especialidad.id_especialidad.toString()),
          {
            nombre_especialidad: formData.nombre_especialidad,
          }
        );
        toast.success("Especialidad actualizada correctamente");
      } else {
        // Crear nueva especialidad
        await apiClient.post(CLIENT_API.CREATE_ESPECIALIDADES, {
          nombre_especialidad: formData.nombre_especialidad,
        });
        toast.success("Especialidad creada correctamente");
      }

      onSuccess();
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message;
        const status = error.response.status;
        
        switch (status) {
          case 400:
            if (errorMessage.includes("nombre_especialidad")) {
              toast.error("El nombre de la especialidad es requerido");
            } else {
              toast.error("Datos inválidos. Verifica la información ingresada.");
            }
            break;
          case 404:
            toast.error("Especialidad no encontrada");
            break;
          case 409:
            toast.error("Ya existe una especialidad con ese nombre en esta empresa");
            break;
          case 500:
            toast.error("Error interno del servidor. Intenta nuevamente más tarde.");
            break;
          default:
            toast.error(errorMessage || "Error al guardar la especialidad.");
        }
      } else {
        toast.error("Error de conexión. Verifica tu conexión a internet.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof EspecialidadFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Editar Especialidad" : "Nueva Especialidad"}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_especialidad">Nombre de la Especialidad</Label>
              <Input
                id="nombre_especialidad"
                value={formData.nombre_especialidad}
                onChange={(e) => handleChange("nombre_especialidad", e.target.value)}
                placeholder="Ingrese el nombre de la especialidad"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
