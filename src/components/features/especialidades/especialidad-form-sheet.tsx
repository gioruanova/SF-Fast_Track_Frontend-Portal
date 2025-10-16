"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  company_nombre: string;
}

interface EspecialidadFormData {
  company_id: number;
  nombre_especialidad: string;
}

interface EspecialidadFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  especialidad?: {
    id_especialidad: number;
    nombre_especialidad: string;
    company_id: number;
    company_nombre: string;
    estado_especialidad: number;
  } | null;
}

export function EspecialidadFormSheet({
  isOpen,
  onClose,
  onSuccess,
  especialidad,
}: EspecialidadFormSheetProps) {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<EspecialidadFormData>({
    company_id: 0,
    nombre_especialidad: "",
  });

  const isEditing = !!especialidad;

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      if (especialidad) {
        setFormData({
          company_id: especialidad.company_id,
          nombre_especialidad: especialidad.nombre_especialidad,
        });
      } else {
        setFormData({
          company_id: 0,
          nombre_especialidad: "",
        });
      }
    }
  }, [isOpen, especialidad]);

  const fetchCompanies = async () => {
    try {
      const response = await apiClient.get(SUPER_API.GET_COMPANIES);
      setCompanies(response.data);
    } catch {
      toast.error("Error al cargar las empresas");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company_id || !formData.nombre_especialidad.trim()) {
      toast.error("Todos los campos son requeridos");
      return;
    }

    try {
      setIsLoading(true);

      if (isEditing) {
        // Editar especialidad existente
        await apiClient.put(
          SUPER_API.EDIT_ESPECIALIDADES.replace("{id_especialidad}", especialidad.id_especialidad.toString()),
          {
            nombre_especialidad: formData.nombre_especialidad,
          }
        );
        toast.success("Especialidad actualizada correctamente");
      } else {
        // Crear nueva especialidad
        await apiClient.post(SUPER_API.CREATE_ESPECIALIDADES, {
          company_id: formData.company_id,
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

  const handleChange = (field: keyof EspecialidadFormData, value: string | number) => {
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
          <SheetDescription>
            {isEditing 
              ? "Modifica los datos de la especialidad seleccionada."
              : "Crea una nueva especialidad para una empresa."
            }
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_id">Empresa</Label>
              <Select
                value={formData.company_id > 0 ? formData.company_id.toString() : ""}
                onValueChange={(value) => handleChange("company_id", parseInt(value))}
                disabled={isEditing} // No permitir cambiar empresa al editar
              >
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="Seleccione empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem 
                      key={company.company_id} 
                      value={company.company_id.toString()}
                      className="cursor-pointer"
                    >
                      {company.company_id} - {company.company_nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEditing && (
                <p className="text-sm text-muted-foreground">
                  No se puede cambiar la empresa de una especialidad existente
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre_especialidad">Nombre de la Especialidad</Label>
              <Input
                id="nombre_especialidad"
                value={formData.nombre_especialidad}
                onChange={(e) => handleChange("nombre_especialidad", e.target.value)}
                placeholder="Ej: Pintura, Plomería, Electricidad..."
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditing ? "Actualizando..." : "Creando..."}
                </span>
              ) : (
                isEditing ? "Actualizar" : "Crear"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
