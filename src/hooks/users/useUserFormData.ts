import { useMemo } from "react";
import { User } from "@/types/users";
import { generateSuggestedPassword } from "@/lib/passwordGenerator";

interface UseUserFormDataOptions {
  open: boolean;
  isEditing: boolean;
  editingUser: User | null;
  defaultRole: string;
}

export function useUserFormData({
  open,
  isEditing,
  editingUser,
  defaultRole,
}: UseUserFormDataOptions) {
  const editingUserId = editingUser?.user_id;
  const editingUserRole = editingUser?.user_role;
  const editingUserCompleteName = editingUser?.user_complete_name;
  const editingUserDni = editingUser?.user_dni;
  const editingUserPhone = editingUser?.user_phone;
  const editingUserEmail = editingUser?.user_email;
  const editingUserCompanyId = editingUser?.company_id;

  const initialFormData = useMemo(() => {
    if (!open) {
      return {
        user_complete_name: "",
        user_dni: "",
        user_phone: "",
        user_email: "",
        user_role: "",
        user_password: "",
        company_id: "",
      };
    }

    if (isEditing && editingUserId) {
      return {
        user_complete_name: editingUserCompleteName || "",
        user_dni: editingUserDni || "",
        user_phone: editingUserPhone || "",
        user_email: editingUserEmail || "",
        user_role: editingUserRole || "",
        user_password: "",
        company_id: editingUserCompanyId?.toString() || "",
      };
    }

    return {
      user_complete_name: "",
      user_dni: "",
      user_phone: "",
      user_email: "",
      user_role: defaultRole,
      user_password: generateSuggestedPassword(),
      company_id: "",
    };
  }, [
    open,
    isEditing,
    editingUserId,
    editingUserRole,
    editingUserCompleteName,
    editingUserDni,
    editingUserPhone,
    editingUserEmail,
    editingUserCompanyId,
    defaultRole,
  ]);

  return initialFormData;
}

