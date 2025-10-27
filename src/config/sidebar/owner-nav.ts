import {
  Briefcase,
  Users,
  Mail,
  Wrench,
  SquareCheck,
  House,
  GraduationCap,
  Landmark,
  ShieldUser
} from "lucide-react";
import { NavItem, TeamData, ProjectData } from "./types";
import { CompanyConfigData } from "@/types/company";

export const getOwnerNavItems = (config: CompanyConfigData | null): NavItem[] => {
  const isCompanyActive = config?.company?.company_estado === 1;

  return [
    {
      title: "Inicio",
      url: "/dashboard/owner",
      icon: House,

    },
    {
      title: "Mi Organizacion",
      url: "/dashboard/owner/mi-empresa",
      icon: Landmark,
      disabled: !isCompanyActive,

    },
    {
      title: `${config?.plu_heading_reclamos}`,
      url: "#",
      icon: SquareCheck,
      isActive: !isCompanyActive ? false : true,
      disabled: !isCompanyActive,
      items: [
        {
          title: `Generar ${config?.sing_heading_reclamos}`,
          url: "#",
          isCreateAction: true,
          disabled: !isCompanyActive,
        },
        {
          title: `${config?.plu_heading_reclamos} en curso`,
          url: "/dashboard/owner/trabajar-reclamos",
          disabled: !isCompanyActive,
        },
        {
          title: `Historial de ${config?.plu_heading_reclamos?.toLowerCase()}`,
          url: "/dashboard/owner/historial-reclamos",
          disabled: !isCompanyActive,
        },
      ],

    },
    {
      title: `${config?.plu_heading_especialidad}`,
      url: "/dashboard/owner/especialidades",
      icon: Wrench,
      disabled: !isCompanyActive,

    },
    {
      title: `${config?.plu_heading_profesional}`,
      url: "/dashboard/owner/profesionales",
      icon: ShieldUser,
      disabled: !isCompanyActive,

    },
    {
      title: "Usuarios",
      url: "/dashboard/owner/users",
      icon: Users,
      disabled: !isCompanyActive,

    },

    {
      title: `${config?.plu_heading_solicitante}`,
      url: "/dashboard/owner/clientes",
      icon: Briefcase,
      disabled: !isCompanyActive,
    },

  ];
};

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

