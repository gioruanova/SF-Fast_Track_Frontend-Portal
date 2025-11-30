import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface LabelEditorCardProps {
  group: string;
  singKey: string;
  pluKey: string;
  singValue: string;
  pluValue: string;
  onEditSingular: () => void;
  onEditPlural: () => void;
}

export function LabelEditorCard({
  group,
  singValue,
  pluValue,
  onEditSingular,
  onEditPlural,
}: LabelEditorCardProps) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-foreground">Etiquetas {group}</h4>
        <p className="text-xs text-muted-foreground">
          Acá podés editar cómo se visualizarán los rótulos para la categoría &quot;{group}&quot;
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm flex flex-col">
            <span className="text-base font-medium">{singValue || "-"}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onEditSingular}>
            Editar
          </Button>
        </div>
        <Separator />

        <div className="flex items-center justify-between">
          <div className="text-sm flex flex-col">
            <div className="flex gap-2 flex-col items-start">
              <span>Ejemplo:</span>
              <span>
                &quot;Ejemplo de <span className="font-medium underline text-primary">{singValue || "-"}</span> a visualizar&quot;
              </span>
              <span>
                &quot;En esta sección podés ver el listado de tus{" "}
                <span className="font-medium underline text-primary">{pluValue || "-"}</span>&quot;
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onEditPlural}>
            Editar
          </Button>
        </div>
      </div>
    </div>
  );
}

