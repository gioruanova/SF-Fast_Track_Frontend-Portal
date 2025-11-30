export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export interface UserFormData {
  user_complete_name: string;
  user_dni: string;
  user_phone: string;
  user_email: string;
  user_role: string;
  user_password?: string;
  company_id?: number | null;
}

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  errors: string[];
}

export function validateUserForm(
  formData: UserFormData,
  isEditing: boolean = false,
  requireCompany: boolean = false
): ValidationResult {
  const missingFields: string[] = [];
  const errors: string[] = [];

  if (!formData.user_complete_name.trim()) {
    missingFields.push("Nombre completo");
  }

  if (!formData.user_dni.trim()) {
    missingFields.push("DNI");
  }

  if (!formData.user_phone.trim()) {
    missingFields.push("Teléfono");
  }

  if (!formData.user_email.trim()) {
    missingFields.push("Email");
  } else if (!validateEmail(formData.user_email)) {
    errors.push("El formato del email no es válido");
  }

  if (!formData.user_role) {
    missingFields.push("Rol");
  }

  if (requireCompany && (!formData.company_id || formData.company_id === 0)) {
    missingFields.push("Empresa");
  }

  if (!isEditing && !formData.user_password?.trim()) {
    missingFields.push("Contraseña");
  }

  return {
    isValid: missingFields.length === 0 && errors.length === 0,
    missingFields,
    errors,
  };
}

