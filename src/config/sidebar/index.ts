import { User } from "@/types/auth";
import { isSuperAdmin, isCompanyUser } from "@/types/auth";
import { CompanyConfigData } from "@/types/company";
import { NavItem, TeamData } from "./types";
import { superAdminNavItems, superAdminTeamData, superAdminProjects } from "./superadmin-nav";
import {  ownerTeamData, ownerProjects, getOwnerNavItems } from "./owner-nav";
import { getOperadorNavItems, operadorTeamData, operadorProjects } from "./operador-nav";
import {  profesionalTeamData, profesionalProjects, getProfesionalNavItems } from "./profesional-nav";


export function getNavItems(user: User | null, config: CompanyConfigData | null = null): NavItem[] {
  if (!user) return [];

  if (isSuperAdmin(user)) {
    return superAdminNavItems;
  }

  if (isCompanyUser(user)) {
    switch (user.user_role) {
      case "owner":
        return getOwnerNavItems(config);
      case "profesional":
        return getProfesionalNavItems(config);
      case "operador":
        return getOperadorNavItems(config);
      default:
        return [];
    }
  }

  return [];
}

export function getTeamData(user: User | null): TeamData[] {
  if (!user) return [];

  if (isSuperAdmin(user)) {
    return superAdminTeamData;
  }

  if (isCompanyUser(user)) {
    switch (user.user_role) {
      case "owner":
        return ownerTeamData(user.company_name);
      case "profesional":
        return profesionalTeamData(user.company_name);
      case "operador":
        return operadorTeamData(user.company_name);
      default:
        return [];
    }
  }

  return [];
}

export function getProjects(user: User | null, config: CompanyConfigData | null = null): NavItem[] {
  if (!user) return [];

  if (isSuperAdmin(user)) {
    return superAdminProjects;
  }

  if (isCompanyUser(user)) {
    const isCompanyActive = config?.company?.company_estado === 1;
    
    switch (user.user_role) {
      case "owner":
        return ownerProjects.map(project => ({
          ...project,
          disabled: !isCompanyActive
        }));
      case "profesional":
        return profesionalProjects.map(project => ({
          ...project,
          disabled: !isCompanyActive
        }));
      case "operador":
        return operadorProjects.map(project => ({
          ...project,
          disabled: !isCompanyActive
        }));
      default:
        return [];
    }
  }

  return [];
}

export * from "./types";
