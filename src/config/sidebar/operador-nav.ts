import {
  Users,
  Hammer,
  BriefcaseBusiness,
  SquareCheck,
  House,
  Mail
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
    url: "/dashboard/operador/reclamos",
    icon: SquareCheck,

  },
  {
    title: "Usuarios",
    url: "/dashboard/operador/users",
    icon: Users,

  },
  {
    title: `${config?.plu_heading_especialidad}`,
    url: "/dashboard/operador/especialidades",
    icon: Hammer,

  },
];

export const operadorTeamData = (companyName: string): TeamData[] => [
  {
    name: companyName,
    logo: BriefcaseBusiness,
    plan: "Operador",
  },
];

export const operadorProjects: ProjectData[] = [

  {
    title: "Mensajes",
    url: "/dashboard/operador/mensajes",
    icon: Mail,

  },



];

