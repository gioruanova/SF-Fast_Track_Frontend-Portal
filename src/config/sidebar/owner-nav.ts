import {
  Briefcase,
  Users,
  Mail,
  Wrench,
  SquareCheck,
  House,
  GraduationCap,
  Landmark,
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
    icon: Landmark,

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
        title: "En curso",
        url: "/dashboard/owner/trabajar-reclamos",
      },
      {
        title: "Ver Historial",
        url: "/dashboard/owner/historial-reclamos",
      },
    ],

  },
  {
    title: `${config?.plu_heading_especialidad}`,
    url: "/dashboard/owner/especialidades",
    icon: Wrench,

  },
  {
    title: "Usuarios",
    url: "/dashboard/owner/users",
    icon: Users,

  },

  {
    title: `${config?.plu_heading_solicitante}`,
    url: "/dashboard/owner/clientes",
    icon: Briefcase,
  },

];

export const ownerTeamData = (companyName: string): TeamData[] => [
  {
    name: companyName,
    logo: Briefcase,
    plan: "Owner",
    url: "/dashboard/owner",
  },
];

export const ownerProjects: ProjectData[] = [

  {
    title: "Mensajes",
    url: "/dashboard/owner/mensajes",
    icon: Mail,
  },
  {
    title: "Tutoriales",
    url: "/dashboard/owner/tutoriales",
    icon: GraduationCap,
  },



];

