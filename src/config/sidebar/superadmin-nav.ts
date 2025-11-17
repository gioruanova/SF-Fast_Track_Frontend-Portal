import {
    Users,
    Mail,
    Shield,
    SquareCheck,
    Wrench,
    House,
    Briefcase,
    Landmark,
    Radio
} from "lucide-react";
import { NavItem, TeamData, ProjectData } from "./types";

export const superAdminNavItems: NavItem[] = [
    {
        title: "Inicio",
        url: "/dashboard/superadmin",
        icon: House,
    },
    {
        title: "Empresas",
        url: "/dashboard/superadmin/empresas",
        icon: Landmark,
    },
    {
        title: "Usuarios",
        url: "/dashboard/superadmin/users",
        icon: Users,
    },
    {
        title: "Especialidades",
        url: "/dashboard/superadmin/especialidades",
        icon: Wrench,
    },
    {
        title: "Reclamos",
        url: "/dashboard/superadmin/reclamos",
        icon: SquareCheck,
    },
    {
        title: "Clientes Recurrentes",
        url: "/dashboard/superadmin/clientes",
        icon: Briefcase,
    },

];

export const superAdminTeamData: TeamData[] = [
    {
        name: "Fast Track Admin",
        logo: Shield,
        plan: "Super Admin",
        url: "/dashboard/superadmin",
    },
];

export const superAdminProjects: ProjectData[] = [
    {
        title: "Mensajes publicos",
        url: "/dashboard/superadmin/mensajes",
        icon: Mail,
    },
    {
        title: "Mensajes Plataforma",
        url: "/dashboard/superadmin/mensajes-plataforma",
        icon: Radio,
    },
];

