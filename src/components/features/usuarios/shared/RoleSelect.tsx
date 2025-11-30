import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

interface RoleSelectProps {
  value: string;
  onChange: (value: string) => void;
  allowedRoles: string[];
  isEditing: boolean;
  disabled?: boolean;
  canChangeRole: boolean;
}

export function RoleSelect({
  value,
  onChange,
  allowedRoles,
  isEditing,
  disabled = false,
  canChangeRole,
}: RoleSelectProps) {
  const { companyConfig } = useAuth();

  return (
    <div className="space-y-2">
      <Label htmlFor="role">
        Rol <span className="text-red-500">*</span>
      </Label>
      <Select
        value={value || undefined}
        onValueChange={onChange}
        disabled={disabled || !canChangeRole}
      >
        <SelectTrigger className="min-w-full cursor-pointer">
          <SelectValue placeholder="Seleccionar rol" />
        </SelectTrigger>
        <SelectContent>
          {allowedRoles.includes("superadmin") && (
            <SelectItem value="superadmin" className="cursor-pointer">
              Superadmin
            </SelectItem>
          )}
          {allowedRoles.includes("owner") && (
            <SelectItem value="owner" className="cursor-pointer">
              Owner
            </SelectItem>
          )}
          {allowedRoles.includes("operador") && (
            <SelectItem value="operador" className="cursor-pointer">
              {companyConfig?.sing_heading_operador || "Operador"}
            </SelectItem>
          )}
          {allowedRoles.includes("profesional") && (
            <SelectItem value="profesional" className="cursor-pointer">
              {companyConfig?.sing_heading_profesional || "Profesional"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {!canChangeRole && isEditing && (
        <p className="text-xs text-muted-foreground">
          No puedes cambiar el rol de este usuario
        </p>
      )}
    </div>
  );
}

