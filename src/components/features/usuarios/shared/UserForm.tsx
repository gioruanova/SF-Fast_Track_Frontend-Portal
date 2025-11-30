import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, USER_ROLES, USER_STATUS, UserRole } from "@/types/users";
import { Building2 } from "lucide-react";
import { PasswordInput } from "./PasswordInput";
import { RoleSelect } from "./RoleSelect";
import { useUserPermissions } from "@/hooks/users/useUserPermissions";
import { useUserFormHandlers } from "@/hooks/users/useUserFormHandlers";
import { useUserFormPermissions } from "@/hooks/users/useUserFormPermissions";
import { useUserFormConfig } from "@/hooks/users/useUserFormConfig";
import { useUserFormData } from "@/hooks/users/useUserFormData";

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  isEditing: boolean;
  companies?: Array<{ company_id: number; company_nombre: string }>;
  currentUserRole?: string;
  onSubmit: (data: {
    user_complete_name: string;
    user_dni: string;
    user_phone: string;
    user_email: string;
    user_role: string;
    user_password?: string;
    company_id?: number | null;
  }) => Promise<void>;
}

export function UserForm({
  open,
  onOpenChange,
  editingUser,
  isEditing,
  companies = [],
  currentUserRole,
  onSubmit,
}: UserFormProps) {
  const { allowedRoles: baseAllowedRoles, shouldShowCompanyField } = useUserFormConfig({
    currentUserRole,
    isEditing,
  });

  const allowedRoles = useMemo(() => {
    if (isEditing && editingUser && !baseAllowedRoles.includes(editingUser.user_role)) {
      return [...baseAllowedRoles, editingUser.user_role];
    }
    return baseAllowedRoles;
  }, [baseAllowedRoles, isEditing, editingUser]);

  const defaultRole = useMemo(() => {
    if (isEditing && editingUser) {
      return editingUser.user_role;
    }
    return "";
  }, [isEditing, editingUser]);
  
  const initialFormData = useUserFormData({
    open,
    isEditing,
    editingUser,
    defaultRole,
  });

  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData(initialFormData);
    }
  }, [open, initialFormData]);

  const targetUser = useMemo(() => {
    if (isEditing && editingUser) {
      return editingUser;
    }
    return null;
  }, [isEditing, editingUser]);

  const { canChangeRole } = useUserPermissions({
    currentUserRole,
    targetUser: targetUser || {
      user_id: 0,
      user_complete_name: "",
      user_dni: "",
      user_phone: "",
      user_email: "",
      user_role: "" as UserRole,
      user_status: USER_STATUS.ACTIVO,
      company_id: null,
      created_at: "",
      updated_at: "",
    },
  });

  const effectiveCanChangeRole = isEditing ? canChangeRole : true;

  const { shouldIncludeCompanyIdInSubmit } = useUserFormPermissions({
    currentUserRole,
    isEditing,
    showCompanySelect: shouldShowCompanyField,
  });

  const handleCreateUser = useCallback(async (data: {
    user_complete_name: string;
    user_dni: string;
    user_phone: string;
    user_email: string;
    user_role: string;
    user_password?: string;
    company_id?: number | null;
  }) => {
    await onSubmit(data);
    return true;
  }, [onSubmit]);

  const handleUpdateUser = useCallback(async (userId: number, data: Partial<{
    user_complete_name: string;
    user_dni: string;
    user_phone: string;
    user_email: string;
    user_role: string;
    user_password?: string;
    company_id?: number | null;
  }>) => {
    await onSubmit(data as {
      user_complete_name: string;
      user_dni: string;
      user_phone: string;
      user_email: string;
      user_role: string;
      user_password?: string;
      company_id?: number | null;
    });
    return true;
  }, [onSubmit]);

  const { handleSubmit: handleFormSubmit, isSubmitting } = useUserFormHandlers({
    isEditing,
    editingUser,
    currentUserRole,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    onSuccess: () => onOpenChange(false),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData };
    
    if (shouldIncludeCompanyIdInSubmit && formData.company_id) {
      (submitData as { company_id?: string }).company_id = formData.company_id;
    } else {
      delete (submitData as { company_id?: string }).company_id;
    }
    
    await handleFormSubmit({
      ...submitData,
      company_id: submitData.company_id ? parseInt(submitData.company_id) : undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Editar Usuario" : "Crear Usuario"}
          </SheetTitle>
          <SheetDescription>
            {isEditing ? "Modifica los datos del usuario" : "Completa los datos para crear un nuevo usuario"}
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <form onSubmit={handleSubmit} className="mt-0 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="complete_name">
              Nombre Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="complete_name"
              value={formData.user_complete_name}
              onChange={(e) => setFormData(prev => ({ ...prev, user_complete_name: e.target.value }))}
              placeholder="Nombre completo del usuario"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dni">
              DNI <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dni"
              value={formData.user_dni}
              onChange={(e) => setFormData(prev => ({ ...prev, user_dni: e.target.value }))}
              placeholder="12345678"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Teléfono <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              value={formData.user_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, user_phone: e.target.value }))}
              placeholder="+54 9 11 1234-5678"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.user_email}
              onChange={(e) => setFormData(prev => ({ ...prev, user_email: e.target.value }))}
              placeholder="usuario@empresa.com"
              required
              disabled={isSubmitting}
            />
          </div>

          {allowedRoles.length > 0 && (
            <RoleSelect
              value={formData.user_role}
              onChange={(value) => setFormData(prev => ({ ...prev, user_role: value }))}
              allowedRoles={allowedRoles}
              isEditing={isEditing}
              disabled={isSubmitting || (isEditing && !effectiveCanChangeRole) || (!isEditing && allowedRoles.length === 1)}
              canChangeRole={effectiveCanChangeRole && allowedRoles.length > 1}
            />
          )}

          {shouldShowCompanyField && formData.user_role !== USER_ROLES.SUPERADMIN && (
            <div className="space-y-2">
              <Label htmlFor="company">
                Empresa <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.company_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, company_id: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger className="min-w-full cursor-pointer">
                  <SelectValue placeholder="Selecciona una empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.company_id} value={company.company_id.toString()} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3 w-3" />
                        {company.company_nombre}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!isEditing && (
            <PasswordInput
              id="password"
              label="Contraseña"
              value={formData.user_password}
              onChange={(value) => setFormData(prev => ({ ...prev, user_password: value }))}
              placeholder="Contraseña del usuario"
              required
              disabled={isSubmitting}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              hint="Sugerencia: Fast + hora actual"
            />
          )}

          {isEditing && (
            <PasswordInput
              id="edit_password"
              label="Nueva Contraseña (opcional)"
              value={formData.user_password}
              onChange={(value) => setFormData(prev => ({ ...prev, user_password: value }))}
              placeholder="Dejar vacío para mantener la contraseña actual"
              disabled={isSubmitting}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting
                ? "Guardando..."
                : isEditing
                ? "Actualizar"
                : "Crear Usuario"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

