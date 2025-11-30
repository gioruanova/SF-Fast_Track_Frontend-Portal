import {
  Users,
  Wrench,
  Briefcase,
  SquareCheck,
  House,
  GraduationCap,
  Landmark,
  ShieldUser
} from "lucide-react";
import { NavItem, TeamData, ProjectData } from "./types";
import { CompanyConfigData } from "@/types/company";

export const getOperadorNavItems = (config: CompanyConfigData | null): NavItem[] => {
  const isCompanyActive = config === null ? true : config?.company?.company_estado === 1;
  
  const pluReclamos = config?.plu_heading_reclamos || "Reclamos";
  const singReclamos = config?.sing_heading_reclamos || "reclamo";
  const pluEspecialidad = config?.plu_heading_especialidad || "Especialidades";
  const pluProfesional = config?.plu_heading_profesional || "Profesionales";
  const pluSolicitante = config?.plu_heading_solicitante || "Solicitantes";

  return [
    {
      title: "Inicio",
      url: "/dashboard/operador",
      icon: House,
      disabled: false,
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
          url: "/dashboard/operador/crear-reclamo",
          disabled: !isCompanyActive,
        },
        {
          title: `${pluReclamos} en curso`,
          url: "/dashboard/operador/trabajar-reclamos",
          disabled: !isCompanyActive,
        },
        {
          title: `Historial de ${pluReclamos.toLowerCase()}`,
          url: "/dashboard/operador/historial-reclamos",
          disabled: !isCompanyActive,
        },
      ],
    },
    {
      title: pluEspecialidad,
      url: "/dashboard/operador/especialidades",
      icon: Wrench,
      disabled: !isCompanyActive,
    },
    {
      title: pluProfesional,
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
      title: pluSolicitante,
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
    title: "Tutoriales",
    url: "/dashboard/operador/tutoriales",
    icon: GraduationCap,
  },
];

