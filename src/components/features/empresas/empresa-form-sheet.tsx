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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import axios from "axios";
import { API_ROUTES } from "@/lib/api_routes";
import { getCompanyUpdateEndpoint } from "@/lib/apiHelpers";
import { apiClient } from "@/lib/apiClient";

interface CompanyDataBackend {
  company_id?: number;
  company_unique_id: string;
  company_nombre: string;
  company_phone: string;
  company_email: string;
  company_whatsapp?: string;
  company_telegram?: string;
  company_estado?: number | boolean;
  limite_operadores: number;
  limite_profesionales: number;
  limite_especialidades: number;
  reminder_manual: number | boolean;
}

interface CompanyData {
  company_id?: number;
  company_unique_id: string;
  company_nombre: string;
  company_phone: string;
  company_email: string;
  company_whatsapp?: string;
  company_telegram?: string;
  company_estado?: number;
  limite_operadores: number;
  limite_profesionales: number;
  limite_especialidades: number;
  reminder_manual: boolean;
}

interface EmpresaFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  company?: CompanyDataBackend | null;
  onSuccess: () => void;
}

export function EmpresaFormSheet({ isOpen, onClose, company, onSuccess }: EmpresaFormSheetProps) {
  const [formData, setFormData] = useState<CompanyData>({
    company_nombre: "",
    company_phone: "",
    company_email: "",
    company_whatsapp: "",
    company_telegram: "",
    company_unique_id: "",
    limite_operadores: 5,
    limite_profesionales: 10,
    limite_especialidades: 5,
    reminder_manual: false,
  });
  const [originalData, setOriginalData] = useState<CompanyData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (company) {
      const data = {
        company_nombre: company.company_nombre,
        company_phone: company.company_phone,
        company_email: company.company_email,
        company_whatsapp: company.company_whatsapp || "",
        company_telegram: company.company_telegram || "",
        company_unique_id: company.company_unique_id,
        limite_operadores: company.limite_operadores,
        limite_profesionales: company.limite_profesionales,
        limite_especialidades: company.limite_especialidades,
        reminder_manual: company.reminder_manual === 1 || company.reminder_manual === true,
      };
      setFormData(data);
      setOriginalData(data);
    } else {
      setFormData({
        company_nombre: "",
        company_phone: "",
        company_email: "",
        company_whatsapp: "",
        company_telegram: "",
        company_unique_id: "",
        limite_operadores: 3,
        limite_profesionales: 10,
        limite_especialidades: 5,
        reminder_manual: true,
      });
      setOriginalData(null);
    }
  }, [company, isOpen]);

  const handleChange = (field: keyof CompanyData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCuitCuil = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 10) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(10, 11)}`;
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company_nombre.trim() || !formData.company_email.trim() || !formData.company_phone.trim()) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    if (!validateEmail(formData.company_email.trim())) {
      toast.error("Por favor ingresa un email válido");
      return;
    }

    if (!formData.company_unique_id.trim()) {
      toast.error("El CUIT/CUIL es obligatorio");
      return;
    }

    const cuitRegex = /^\d{2}-?\d{8}-?\d{1}$/;
    if (!cuitRegex.test(formData.company_unique_id.replace(/-/g, ''))) {
      toast.error("El CUIT/CUIL debe tener 11 dígitos (formato: XX-XXXXXXXX-X)");
      return;
    }

    try {
      setIsSubmitting(true);

      if (company && originalData) {
        const endpoint = getCompanyUpdateEndpoint(company.company_id!);
        
        const changedFields: Record<string, string | number | boolean> = {};
        (Object.keys(formData) as Array<keyof CompanyData>).forEach((key) => {
          if (formData[key] !== originalData[key]) {
            const value = formData[key];
            if (value !== "" && value !== undefined && value !== null) {
              changedFields[key] = value as string | number | boolean;
            }
          }
        });

        if (Object.keys(changedFields).length === 0) {
          toast.info("No hay cambios para guardar");
          setIsSubmitting(false);
          return;
        }

        await apiClient.put(endpoint, changedFields);
        toast.success("Empresa actualizada correctamente");
      } else {
        const createPayload = {
          company_unique_id: formData.company_unique_id,
          company_nombre: formData.company_nombre,
          company_phone: formData.company_phone,
          company_email: formData.company_email,
          limite_operadores: formData.limite_operadores,
          limite_profesionales: formData.limite_profesionales,
          limite_especialidades: formData.limite_especialidades,
          reminder_manual: formData.reminder_manual,
        };
        await apiClient.post(API_ROUTES.COMPANY_CREATE, createPayload);
        toast.success("Empresa creada correctamente");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error guardando empresa:", error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message;
        const status = error.response.status;

        if (status === 409) {
          if (errorMessage?.includes('company_unique_id')) {
            toast.error("El CUIT/CUIL ingresado ya está registrado en otra empresa.");
          } else if (errorMessage?.includes('email')) {
            toast.error("El email ingresado ya está registrado en otra empresa.");
          } else {
            toast.error(errorMessage || "Ya existe un registro con estos datos.");
          }
        } else if (status === 400) {
          toast.error(errorMessage || "Todos los campos son requeridos. Verifica la información.");
        } else if (status === 500) {
          toast.error("Error interno del servidor. Intenta nuevamente más tarde.");
        } else {
          toast.error(errorMessage || "Error al guardar la empresa.");
        }
      } else {
        toast.error("Error de conexión. Verifica tu conexión a internet.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>{company ? "Editar Empresa" : "Crear Nueva Empresa"}</SheetTitle>
          <SheetDescription>
            {company ? "Actualiza la información de la empresa" : "Completa los datos para crear una nueva empresa"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="space-y-4">
            <div className="gap-2 flex flex-col">
              <Label htmlFor="company_nombre">
                Nombre de la Empresa <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company_nombre"
                value={formData.company_nombre}
                onChange={(e) => handleChange("company_nombre", e.target.value)}
                placeholder="Ej: Mi Empresa S.A."
                required
              />
            </div>

            <div className="gap-2 flex flex-col">
              <Label htmlFor="company_unique_id">
                CUIT/CUIL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company_unique_id"
                value={formData.company_unique_id}
                onChange={(e) => {
                  const formatted = formatCuitCuil(e.target.value);
                  handleChange("company_unique_id", formatted);
                }}
                placeholder="20-12345678-9"
                maxLength={13}
                required
              />
              <p className="text-xs text-muted-foreground">
                Formato: XX-XXXXXXXX-X (solo números y guiones)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="gap-2 flex flex-col">
                <Label htmlFor="company_email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="company_email"
                  type="email"
                  value={formData.company_email}
                  onChange={(e) => handleChange("company_email", e.target.value)}
                  placeholder="contacto@empresa.com"
                  required
                />
              </div>

              <div className="gap-2 flex flex-col">
                <Label htmlFor="company_phone">
                  Teléfono <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="company_phone"
                  value={formData.company_phone}
                  onChange={(e) => handleChange("company_phone", e.target.value)}
                  placeholder="123-456-7890"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="gap-2 flex flex-col">
                <Label htmlFor="company_whatsapp">WhatsApp</Label>
                <Input
                  id="company_whatsapp"
                  value={formData.company_whatsapp}
                  onChange={(e) => handleChange("company_whatsapp", e.target.value)}
                  placeholder="+5491133334444"
                />
              </div>

              <div className="gap-2 flex flex-col">
                <Label htmlFor="company_telegram">Telegram</Label>
                <Input
                  id="company_telegram"
                  value={formData.company_telegram}
                  onChange={(e) => handleChange("company_telegram", e.target.value)}
                  placeholder="+5491133334444"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Límites de Recursos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="gap-2 flex flex-col">
                  <Label htmlFor="limite_operadores">Límite Operadores</Label>
                  <Input
                    id="limite_operadores"
                    type="number"
                    min="0"
                    value={formData.limite_operadores}
                    onChange={(e) => handleChange("limite_operadores", parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="gap-2 flex flex-col">
                  <Label htmlFor="limite_profesionales">Límite Profesionales</Label>
                  <Input
                    id="limite_profesionales"
                    type="number"
                    min="0"
                    value={formData.limite_profesionales}
                    onChange={(e) => handleChange("limite_profesionales", parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="gap-2 flex flex-col">
                  <Label htmlFor="limite_especialidades">Límite Especialidades</Label>
                  <Input
                    id="limite_especialidades"
                    type="number"
                    min="0"
                    value={formData.limite_especialidades}
                    onChange={(e) => handleChange("limite_especialidades", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-0.5">
                <Label htmlFor="reminder_manual">Recordatorio Manual</Label>
                <p className="text-sm text-muted-foreground">
                  Activar recordatorios manuales para esta empresa
                </p>
              </div>
              <Switch
                id="reminder_manual"
                checked={formData.reminder_manual === true}
                onCheckedChange={(checked) => handleChange("reminder_manual", checked)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Guardando..." : company ? "Actualizar" : "Crear Empresa"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

