import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface UserFiltersProps {
  searchTerm: string;
  filterRole: string;
  filterStatus: string;
  filterCompany?: string;
  companies?: Array<{ company_id: number; company_nombre: string }>;
  uniqueCompanies?: string[];
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCompanyChange?: (value: string) => void;
  allowedRoles?: string[];
  showCompanyFilter?: boolean;
}

export function UserFilters({
  searchTerm,
  filterRole,
  filterStatus,
  filterCompany,
  companies,
  uniqueCompanies,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onCompanyChange,
  allowedRoles,
  showCompanyFilter = false,
}: UserFiltersProps) {
  const { companyConfig } = useAuth();

  const clearSearch = () => {
    onSearchChange("");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email, DNI..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Select value={filterRole} onValueChange={onRoleChange}>
        <SelectTrigger className="w-full md:w-[200px] cursor-pointer">
          <SelectValue placeholder="Filtrar por rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="cursor-pointer">Todos los roles</SelectItem>
          {allowedRoles?.includes("superadmin") && (
            <SelectItem value="superadmin" className="cursor-pointer">Superadmin</SelectItem>
          )}
          {allowedRoles?.includes("owner") && (
            <SelectItem value="owner" className="cursor-pointer">Owner</SelectItem>
          )}
          {allowedRoles?.includes("operador") && (
            <SelectItem value="operador" className="cursor-pointer">
              {companyConfig?.sing_heading_operador || "Operador"}
            </SelectItem>
          )}
          {allowedRoles?.includes("profesional") && (
            <SelectItem value="profesional" className="cursor-pointer">
              {companyConfig?.sing_heading_profesional || "Profesional"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      <Select value={filterStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full md:w-[200px] cursor-pointer">
          <SelectValue placeholder="Filtrar por estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="cursor-pointer">Todos los estados</SelectItem>
          <SelectItem value="active" className="cursor-pointer">Activos</SelectItem>
          <SelectItem value="blocked" className="cursor-pointer">Bloqueados</SelectItem>
        </SelectContent>
      </Select>

      {showCompanyFilter && onCompanyChange && (
        <Select value={filterCompany || "all"} onValueChange={onCompanyChange}>
          <SelectTrigger className="w-full md:w-[200px] cursor-pointer">
            <SelectValue placeholder="Filtrar por empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">Todas las empresas</SelectItem>
            {uniqueCompanies?.map((empresa) => (
              <SelectItem key={empresa} value={empresa || ""} className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3 w-3" />
                  {empresa}
                </div>
              </SelectItem>
            ))}
            {companies?.map((company) => (
              <SelectItem key={company.company_id} value={company.company_id.toString()} className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3 w-3" />
                  {company.company_nombre}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

