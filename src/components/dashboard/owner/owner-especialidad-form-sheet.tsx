"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEspecialidadForm } from "@/hooks/especialidades/useEspecialidadForm";
import { Especialidad } from "@/types/especialidades";

interface OwnerEspecialidadFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  especialidad: Especialidad | null;
  onSuccess: () => void;
}

export function OwnerEspecialidadFormSheet({
  isOpen,
  onClose,
  especialidad,
  onSuccess,
}: OwnerEspecialidadFormSheetProps) {
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
    requiresCompanyId: false,
  });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Editar Especialidad" : "Nueva Especialidad"}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
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
                placeholder="Ingrese el nombre de la especialidad"
                required
                disabled={isLoading}
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
