import {
    Users,
    Shield,
    Wrench,
    House,
    Briefcase,
    Landmark,
    MessageSquare
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
        title: "Clientes Recurrentes",
        url: "/dashboard/superadmin/clientes",
        icon: Briefcase,
    },
    {
        title: "Feedbacks",
        url: "/dashboard/superadmin/feedback",
        icon: MessageSquare,
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

export const superAdminProjects: ProjectData[] = [];

