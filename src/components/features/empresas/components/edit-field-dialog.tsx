import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EditFieldDialogProps {
  isOpen: boolean;
  fieldKey: string | null;
  value: string;
  isSaving: boolean;
  onClose: () => void;
  onValueChange: (value: string) => void;
  onSave: () => void;
}

const LONG_TEXT_FIELDS = [
  "string_inicio_reclamo_solicitante",
  "string_recordatorio_reclamo_solicitante",
  "string_cierre_reclamo_solicitante",
  "string_inicio_reclamo_profesional",
  "string_recordatorio_reclamo_profesional",
  "string_cierre_reclamo_profesional",
];

export function EditFieldDialog({
  isOpen,
  fieldKey,
  value,
  isSaving,
  onClose,
  onValueChange,
  onSave,
}: EditFieldDialogProps) {
  const isLongText = fieldKey ? LONG_TEXT_FIELDS.includes(fieldKey) : false;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar valor</DialogTitle>
          <DialogDescription>Actualiza el contenido. No se permite dejarlo vacío.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {isLongText ? (
            <Textarea
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              rows={6}
              placeholder="Ingrese el texto"
            />
          ) : (
            <Input value={value} onChange={(e) => onValueChange(e.target.value)} placeholder="Ingrese el valor" />
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

