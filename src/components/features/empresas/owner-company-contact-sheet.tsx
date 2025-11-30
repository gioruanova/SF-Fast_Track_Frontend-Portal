"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/api_routes";

interface ContactValues {
  company_phone: string;
  company_email: string;
  company_whatsapp: string;
  company_telegram: string;
}

interface OwnerCompanyContactSheetProps {
  isOpen: boolean;
  onClose: () => void;
  values: ContactValues;
  onSaved: () => Promise<void> | void;
}

export function OwnerCompanyContactSheet({ isOpen, onClose, values, onSaved }: OwnerCompanyContactSheetProps) {
  const [form, setForm] = useState<ContactValues>(values);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(values);
    }
  }, [isOpen, values]);

  const handleChange = useCallback((field: keyof ContactValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedEmail = form.company_email.trim();
      if (!trimmedEmail) {
        toast.error("El email es requerido");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        toast.error("El formato del email no es válido");
        return;
      }

      try {
        setIsSubmitting(true);
        await apiClient.put(API_ROUTES.COMPANY_UPDATE_OWNER, {
          company_phone: form.company_phone || null,
          company_email: trimmedEmail,
          company_whatsapp: form.company_whatsapp || null,
          company_telegram: form.company_telegram || null,
        });
        toast.success("Datos actualizados correctamente");
        await onSaved();
        onClose();
      } catch {
        toast.error("No se pudo actualizar. Intenta nuevamente");
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, onSaved, onClose]
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>Editar datos de contacto</SheetTitle>
          <SheetDescription>Modifica los datos de contacto de la organización</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="space-y-4">
            <div className="gap-2 flex flex-col">
              <Label htmlFor="company_email">Email</Label>
              <Input
                id="company_email"
                type="email"
                placeholder="empresa@correo.com"
                value={form.company_email}
                onChange={(e) => handleChange("company_email", e.target.value)}
                required
              />
            </div>

            <div className="gap-2 flex flex-col">
              <Label htmlFor="company_phone">Teléfono</Label>
              <Input
                id="company_phone"
                placeholder="Ej: +54 11 1234-5678"
                value={form.company_phone}
                onChange={(e) => handleChange("company_phone", e.target.value)}
              />
            </div>

            <div className="gap-2 flex flex-col">
              <Label htmlFor="company_whatsapp">WhatsApp</Label>
              <Input
                id="company_whatsapp"
                placeholder="Ej: +54 9 11 1234-5678"
                value={form.company_whatsapp}
                onChange={(e) => handleChange("company_whatsapp", e.target.value)}
              />
            </div>

            <div className="gap-2 flex flex-col">
              <Label htmlFor="company_telegram">Telegram</Label>
              <Input
                id="company_telegram"
                placeholder="Usuario o número"
                value={form.company_telegram}
                onChange={(e) => handleChange("company_telegram", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

