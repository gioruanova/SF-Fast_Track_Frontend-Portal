import {
  BriefcaseBusiness,
  Users,
  Mail,
  Hammer,
  SquareCheck,
  House
} from "lucide-react";
import { NavItem, TeamData, ProjectData } from "./types";
import { CompanyConfigData } from "@/types/company";

export const getOwnerNavItems = (config: CompanyConfigData | null): NavItem[] => [
  {
    title: "Inicio",
    url: "/dashboard/owner",
    icon: House,

  },
  {
    title: "Mi Organizacion",
    url: "/dashboard/owner/mi-empresa",
    icon: BriefcaseBusiness,

  },
  {
    title: `${config?.plu_heading_reclamos}`,
    url: "/dashboard/owner/reclamos",
    icon: SquareCheck,

  },
  {
    title: "Usuarios",
    url: "/dashboard/owner/users",
    icon: Users,

  },
  {
    title: `${config?.plu_heading_especialidad}`,
    url: "/dashboard/owner/especialidades",
    icon: Hammer,

  },
  {
    title: `${config?.plu_heading_solicitante}`,
    url: "/dashboard/owner/clientess",
    icon: Hammer,

  },

];

export const ownerTeamData = (companyName: string): TeamData[] => [
  {
    name: companyName,
    logo: BriefcaseBusiness,
    plan: "Owner",
  },
];

export const ownerProjects: ProjectData[] = [

  {
    title: "Mensajes",
    url: "/dashboard/owner/mensajes",
    icon: Mail,

  },



];

