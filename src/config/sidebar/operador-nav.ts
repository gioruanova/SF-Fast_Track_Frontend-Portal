import {
  Users,
  Wrench,
  Briefcase,
  SquareCheck,
  House,
  Mail,
  GraduationCap,
  Landmark,
  ShieldUser
} from "lucide-react";
import { NavItem, TeamData, ProjectData } from "./types";
import { CompanyConfigData } from "@/types/company";

export const getOperadorNavItems = (config: CompanyConfigData | null): NavItem[] => [
  {
    title: "Inicio",
    url: "/dashboard/operador",
    icon: House,
  },
  {
    title: `${config?.plu_heading_reclamos}`,
    url: "#",
    icon: SquareCheck,
    items: [
      {
        title: `Generar ${config?.sing_heading_reclamos}`,
        url: "#",
      },
      {
        title: `${config?.plu_heading_reclamos} en curso`,
        url: "/dashboard/operador/trabajar-reclamos",
      },
      {
        title: `Historial de ${config?.plu_heading_reclamos?.toLowerCase()}`,
        url: "/dashboard/operador/historial-reclamos",
      },
    ],
  },
  {
    title: `${config?.plu_heading_especialidad}`,
    url: "/dashboard/operador/especialidades",
    icon: Wrench,
  },
  {
    title: `${config?.plu_heading_profesional}`,
    url: "/dashboard/operador/profesionales",
    icon: ShieldUser,

  },
  {
    title: "Usuarios",
    url: "/dashboard/operador/users",
    icon: Users,
  },
  {
    title: `${config?.plu_heading_solicitante}`,
    url: "/dashboard/operador/clientes",
    icon: Briefcase,

  },

];

export const operadorTeamData = (companyName: string): TeamData[] => [
  {
    name: companyName,
    logo: Landmark,
    plan: "Operador",
    url: "/dashboard/operador",
  },
];

export const operadorProjects: ProjectData[] = [
  {
    title: "Mensajes",
    url: "/dashboard/operador/mensajes",
    icon: Mail,
  },
  {
    title: "Tutoriales",
    url: "/dashboard/operador/tutoriales",
    icon: GraduationCap,
  },


];

