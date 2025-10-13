import {
  House,
  Mail,
  SquareCheck,
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
    url: "/reclamos",
    icon: SquareCheck,
    isActive: true,

  },
];

export const profesionalTeamData = (companyName: string): TeamData[] => [
  {
    name: companyName,
    logo: SquareCheck,
    plan: "Profesional",
  },
];




export const profesionalProjects: ProjectData[] = [

  {
    title: "Ver Mensajes",
    url: "/owner/mensajes",
    icon: Mail,
  },

];

