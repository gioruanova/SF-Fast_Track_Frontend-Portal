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

export const getOperadorNavItems = (config: CompanyConfigData | null): NavItem[] => {
  const isCompanyActive = config?.company?.company_estado === 1;

  return [
    {
      title: "Inicio",
      url: "/dashboard/operador",
      icon: House,
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
          url: "/dashboard/reclamos/crear",
          disabled: !isCompanyActive,
        },
        {
          title: `${config?.plu_heading_reclamos} en curso`,
          url: "/dashboard/operador/trabajar-reclamos",
          disabled: !isCompanyActive,
        },
        {
          title: `Historial de ${config?.plu_heading_reclamos?.toLowerCase()}`,
          url: "/dashboard/operador/historial-reclamos",
          disabled: !isCompanyActive,
        },
      ],
    },
    {
      title: `${config?.plu_heading_especialidad}`,
      url: "/dashboard/operador/especialidades",
      icon: Wrench,
      disabled: !isCompanyActive,
    },
    {
      title: `${config?.plu_heading_profesional}`,
      url: "/dashboard/operador/profesionales",
      icon: ShieldUser,
      disabled: !isCompanyActive,
    },
    {
      title: "Usuarios",
      url: "/dashboard/operador/users",
      icon: Users,
      disabled: !isCompanyActive,
    },
    {
      title: `${config?.plu_heading_solicitante}`,
      url: "/dashboard/operador/clientes",
      icon: Briefcase,
      disabled: !isCompanyActive,
    },
  ];
};

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

