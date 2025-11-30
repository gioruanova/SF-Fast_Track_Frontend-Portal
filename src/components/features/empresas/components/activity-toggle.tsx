import { Switch } from "@/components/ui/switch";
import { CompanyConfigData } from "@/types/company";

interface ActivityToggleProps {
  toggleKey: "requiere_domicilio" | "requiere_url" | "requiere_fecha_final";
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
  companyConfig: CompanyConfigData | null;
}

export function ActivityToggle({
  toggleKey,
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
  companyConfig,
}: ActivityToggleProps) {
  const singReclamos = companyConfig?.sing_heading_reclamos?.toLowerCase() || "reclamo";
  const pluProfesional = companyConfig?.plu_heading_profesional?.toLowerCase() || "profesionales";
  const singProfesional = companyConfig?.sing_heading_profesional?.toLowerCase() || "profesional";

  const getDescription = () => {
    if (toggleKey === "requiere_domicilio") {
      return `En caso de estar encendido, el sistema va a exigir un domicilio físico al momento de generar cualquier ${singReclamos} y se compartirá con tus ${pluProfesional} que se asignen a dicha actividad.`;
    }
    if (toggleKey === "requiere_url") {
      return `En caso de estar encendido, el sistema va a exigir que para cada ${singReclamos} se agregue una URL asociada para esa actividad.`;
    }
    if (toggleKey === "requiere_fecha_final") {
      return (
        <>
          En caso de estar encendida, cada {singReclamos} va a requerir un horario de finalización exacto.
          <br />
          <strong>Importante: </strong>de no estar encendida esta opción, el sistema bloqueará la agenda para todo ese día del {singProfesional} que se seleccionó.
        </>
      );
    }
    return description;
  };

  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{getDescription()}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}

