import {
  Briefcase,
  Users,
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
  
  const pluReclamos = config?.plu_heading_reclamos || "Reclamos";
  const singReclamos = config?.sing_heading_reclamos || "reclamo";
  const pluEspecialidad = config?.plu_heading_especialidad || "Especialidades";
  const pluProfesional = config?.plu_heading_profesional || "Profesionales";
  const pluSolicitante = config?.plu_heading_solicitante || "Solicitantes";

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
      title: pluReclamos,
      url: "#",
      icon: SquareCheck,
      isActive: !isCompanyActive ? false : true,
      disabled: !isCompanyActive,
      items: [
        {
          title: `Generar ${singReclamos}`,
          url: "/dashboard/owner/crear-reclamo",
          disabled: !isCompanyActive,
        },
        {
          title: `${pluReclamos} en curso`,
          url: "/dashboard/owner/trabajar-reclamos",
          disabled: !isCompanyActive,
        },
        {
          title: `Historial de ${pluReclamos.toLowerCase()}`,
          url: "/dashboard/owner/historial-reclamos",
          disabled: !isCompanyActive,
        },
      ],
    },
    {
      title: pluEspecialidad,
      url: "/dashboard/owner/especialidades",
      icon: Wrench,
      disabled: !isCompanyActive,
    },
    {
      title: pluProfesional,
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
      title: pluSolicitante,
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
    title: "Tutoriales",
    url: "/dashboard/owner/tutoriales",
    icon: GraduationCap,
  },
];

