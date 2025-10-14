import {
  House,
  Mail,
  SquareCheck,
  Phone,
  GraduationCap
} from "lucide-react";
import { NavItem, TeamData, ProjectData } from "./types";
import { CompanyConfigData } from "@/types/company";


export const getProfesionalNavItems = (config: CompanyConfigData | null): NavItem[] => [
  {
    title: "Inicio",
    url: "/dashboard/profesional",
    icon: House,

  },
  {
    title: `${config?.plu_heading_reclamos}`,
    url: "#",
    icon: SquareCheck,
    items: [
      {
        title: "En curso",
        url: "/dashboard/profesional/trabajar-reclamos",
      },
      {
        title: "Ver Historial",
        url: "/dashboard/profesional/historial-reclamos",
      },
    ],
  },
];

export const profesionalTeamData = (companyName: string): TeamData[] => [
  {
    name: companyName,
    logo: SquareCheck,
    plan: "Profesional",
    url: "/dashboard/profesional",
  },
];




export const profesionalProjects: ProjectData[] = [
  {
    title: "Contactar Empresa",
    url: "/dashboard/profesional/contactar-empresa",
    icon: Phone,
  },
  {
    title: "Ver Mensajes",
    url: "/dashboard/profesional/mensajes",
    icon: Mail,
  },

  {
    title: "Tutoriales",
    url: "/dashboard/profesional/tutoriales",
    icon: GraduationCap,
  },
];

