import { memo } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CompanyConfigData } from "@/types/company";

interface CompanyLimitsProps {
  companyConfig: CompanyConfigData | null;
}

interface LimitCardProps {
  label: string;
  value: number | undefined;
  tooltip: string;
}

function LimitCard({ label, value, tooltip }: LimitCardProps) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {label}
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/80 cursor-help" />
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </p>
      <p className="text-base font-medium">{value ?? "-"}</p>
    </div>
  );
}

export const CompanyLimits = memo(function CompanyLimits({ companyConfig }: CompanyLimitsProps) {
  const pluOperador = companyConfig?.plu_heading_operador || "operadores";
  const pluProfesional = companyConfig?.plu_heading_profesional || "profesionales";
  const pluEspecialidad = companyConfig?.plu_heading_especialidad || "especialidades";
  const pluReclamos = companyConfig?.plu_heading_reclamos || "reclamos";
  const reminderManual = companyConfig?.company?.reminder_manual === 1;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <LimitCard
        label={`Límite de ${pluOperador}`}
        value={companyConfig?.company?.limite_operadores}
        tooltip="Máximo de operadores habilitados en la empresa."
      />
      <LimitCard
        label={`Límite de ${pluProfesional}`}
        value={companyConfig?.company?.limite_profesionales}
        tooltip="Máximo de profesionales que pueden trabajar reclamos."
      />
      <LimitCard
        label={`Límite de ${pluEspecialidad}`}
        value={companyConfig?.company?.limite_especialidades}
        tooltip="Cantidad máxima de especialidades que puede crear la empresa."
      />
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          Servicio de recordatorios
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/80 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              Si tu plan cuenta con esta funcionalidad, vas a poder enviar recordatorios de {pluReclamos}
            </TooltipContent>
          </Tooltip>
        </p>
        {reminderManual ? (
          <Badge variant="secondary" className="text-xs bg-green-700">
            Activo
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Inactivo
          </Badge>
        )}
      </div>
    </div>
  );
});

