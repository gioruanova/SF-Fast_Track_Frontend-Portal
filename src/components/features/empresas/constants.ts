export const LABEL_GROUPS = [
  {
    group: "Propietario",
    sing: { key: "sing_heading_owner", label: "Singular" },
    plu: { key: "plu_heading_owner", label: "Plural" },
  },
  {
    group: "Profesional",
    sing: { key: "sing_heading_profesional", label: "Singular" },
    plu: { key: "plu_heading_profesional", label: "Plural" },
  },
  {
    group: "Operador",
    sing: { key: "sing_heading_operador", label: "Singular" },
    plu: { key: "plu_heading_operador", label: "Plural" },
  },
  {
    group: "Solicitante",
    sing: { key: "sing_heading_solicitante", label: "Singular" },
    plu: { key: "plu_heading_solicitante", label: "Plural" },
  },
  {
    group: "Reclamos",
    sing: { key: "sing_heading_reclamos", label: "Singular" },
    plu: { key: "plu_heading_reclamos", label: "Plural" },
  },
  {
    group: "Especialidad/Actividad",
    sing: { key: "sing_heading_especialidad", label: "Singular" },
    plu: { key: "plu_heading_especialidad", label: "Plural" },
  },
] as const;

export const MESSAGE_FIELDS = [
  {
    key: "string_inicio_reclamo_profesional",
    label: "Mensaje inicio: Profesional",
    desc: "Mensaje enviado al profesional al asignar una actividad.",
  },
  {
    key: "string_actualizacion_reclamo_profesional",
    label: "Mensaje actualización: Profesional",
    desc: "Mensaje de actualización para el profesional.",
  },
] as const;

export const REMINDER_MESSAGE_FIELD = {
  key: "string_recordatorio_reclamo_profesional",
  label: "Mensaje recordatorio: Profesional",
  desc: "Mensaje de recordatorio para el profesional.",
} as const;

export const ACTIVITY_TOGGLES = [
  {
    key: "requiere_domicilio" as const,
    label: "Requiere domicilio",
    description: "",
  },
  {
    key: "requiere_url" as const,
    label: "Requiere URL",
    description: "",
  },
  {
    key: "requiere_fecha_final" as const,
    label: "Requiere hora de finalización",
    description: "",
  },
] as const;

