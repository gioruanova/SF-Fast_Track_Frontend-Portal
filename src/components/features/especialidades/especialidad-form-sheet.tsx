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
import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/api_routes";
import { useEspecialidadForm } from "@/hooks/especialidades/useEspecialidadForm";
import { Especialidad } from "@/types/especialidades";

interface CompanyData {
  company_id: number;
  company_nombre: string;
}

interface EspecialidadFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  especialidad?: Especialidad | null;
}

export function EspecialidadFormSheet({
  isOpen,
  onClose,
  onSuccess,
  especialidad,
}: EspecialidadFormSheetProps) {
  const [companies, setCompanies] = useState<CompanyData[]>([]);

  const {
    formData,
    isLoading,
    isEditing,
    handleChange,
    handleSubmit,
  } = useEspecialidadForm({
    especialidad: especialidad || undefined,
    onSuccess,
    onClose,
    requiresCompanyId: true,
  });

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  const fetchCompanies = async () => {
    try {
      const response = await apiClient.get<CompanyData[]>(API_ROUTES.GET_COMPANIES);
      setCompanies(response.data);
    } catch {
      toast.error("Error al cargar las empresas");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
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
                value={formData.company_id ? formData.company_id.toString() : ""}
                onValueChange={(value) =>
                  handleChange("company_id", parseInt(value))
                }
                disabled={isEditing}
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
              <Label htmlFor="nombre_especialidad">
                Nombre de la Especialidad
              </Label>
              <Input
                id="nombre_especialidad"
                value={formData.nombre_especialidad}
                onChange={(e) =>
                  handleChange("nombre_especialidad", e.target.value)
                }
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
