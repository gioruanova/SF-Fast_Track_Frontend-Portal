import { useState } from "react";
import { User, USER_ROLES } from "@/types/users";
import { validateUserForm } from "@/lib/utils/userValidation";
import { toast } from "sonner";

interface UserFormData {
  user_complete_name: string;
  user_dni: string;
  user_phone: string;
  user_email: string;
  user_role: string;
  user_password?: string;
  company_id?: number | null;
}

interface UseUserFormHandlersOptions {
  isEditing: boolean;
  editingUser: User | null;
  currentUserRole?: string;
  createUser: (data: UserFormData) => Promise<boolean>;
  updateUser: (userId: number, data: UserFormData) => Promise<boolean>;
  onSuccess?: () => void;
}

export function useUserFormHandlers({
  isEditing,
  editingUser,
  currentUserRole,
  createUser,
  updateUser,
  onSuccess,
}: UseUserFormHandlersOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: UserFormData) => {
    setIsSubmitting(true);

    try {
      const isSuperAdmin = currentUserRole === USER_ROLES.SUPERADMIN;
      const isNonSuperadminEditing = isEditing && currentUserRole && currentUserRole !== USER_ROLES.SUPERADMIN;
      const requireCompany = isSuperAdmin && !isNonSuperadminEditing && formData.user_role !== USER_ROLES.SUPERADMIN;
      const validation = validateUserForm(formData, isEditing, requireCompany);

      if (!validation.isValid) {
        if (validation.missingFields.length > 0) {
          toast.error(`Por favor completa los siguientes campos: ${validation.missingFields.join(", ")}`);
        }
        if (validation.errors.length > 0) {
          validation.errors.forEach((error) => toast.error(error));
        }
        return false;
      }

      const submitData = { ...formData };
      
      if (currentUserRole === USER_ROLES.OPERADOR && submitData.user_role !== USER_ROLES.PROFESIONAL) {
        submitData.user_role = USER_ROLES.PROFESIONAL;
      }

      if (isNonSuperadminEditing) {
        delete (submitData as { company_id?: number | null }).company_id;
      }

      let success = false;
      if (isEditing && editingUser) {
        success = await updateUser(editingUser.user_id, submitData);
      } else {
        success = await createUser(submitData);
      }

      if (success && onSuccess) {
        onSuccess();
      }

      return success;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
  };
}

