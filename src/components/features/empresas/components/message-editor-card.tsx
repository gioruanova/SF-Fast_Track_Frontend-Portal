import { Button } from "@/components/ui/button";

interface MessageEditorCardProps {
  label: string;
  description: string;
  value: string;
  onEdit: () => void;
}

export function MessageEditorCard({ label, description, value, onEdit }: MessageEditorCardProps) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" title={label}>
            {label}
          </p>
          <p className="text-sm mt-1 break-words">{value || "-"}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          Editar
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{description}</p>
    </div>
  );
}

