import {
    BriefcaseBusiness,
    Users,
    Mail,
    Mails,
    Shield,
    SquareCheck,
    Hammer,
    Megaphone,
    House
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
        icon: BriefcaseBusiness,

    },
    {
        title: "Usuarios",
        url: "/dashboard/users",
        icon: Users,

    },
    {
        title: "Especialidades",
        url: "/admin/especialidades",
        icon: Hammer,

    },
    {
        title: "Reclamos",
        url: "/admin/reclamos",
        icon: SquareCheck,

    },



];

export const superAdminTeamData: TeamData[] = [
    {
        name: "Fast Track Admin",
        logo: Shield,
        plan: "Super Admin",
    },
];

export const superAdminProjects: ProjectData[] = [

    {
        title: "Mensajes publicos",
        url: "/admin/mensajes",
        icon: Mail,

    },
    {
        title: "Mensajes Plataforma",
        url: "/admin/mensajes-plataforma",
        icon: Mails,

    },

    {
        title: "Banner general",
        url: "/admin/banner",
        icon: Megaphone,
    },
];

