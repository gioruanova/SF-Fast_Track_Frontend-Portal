import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { CompanyConfigData } from "@/types/company";

interface CompanyHeaderProps {
  companyConfig: CompanyConfigData | null;
}

export const CompanyHeader = memo(function CompanyHeader({ companyConfig }: CompanyHeaderProps) {
  const companyName = companyConfig?.company?.company_nombre || "Empresa";
  const companyStatus = companyConfig?.company?.company_estado === 1 ? "ACTIVA" : "INACTIVA";
  const isActive = companyConfig?.company?.company_estado === 1;
  const companyUniqueId = companyConfig?.company?.company_unique_id || "-";

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-xl font-semibold truncate">{companyName}</p>
          <Badge
            variant="secondary"
            className={`text-xs ${
              isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {companyStatus}
          </Badge>
        </div>
        {!isActive && (
          <span className="text-sm text-red-500">
            Su suscripción se encuentra cancelada. Por favor contacte al administrador
          </span>
        )}
        <p className="text-muted-foreground text-sm truncate">ID: {companyUniqueId}</p>
      </div>
    </div>
  );
});

