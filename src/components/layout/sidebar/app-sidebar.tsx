"use client";

import * as React from "react";
import { NavMain } from "@/components/layout/sidebar/nav-main";
import { NavUser } from "@/components/layout/sidebar/nav-user";
import { TeamSwitcher } from "@/components/layout/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { getNavItems, getTeamData, getProjects } from "@/config/sidebar";
import { FeedbackSheet } from "@/components/features/feedback/feedback-sheet";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, companyConfig } = useAuth();

  if (!user) return null;

  const navItems = getNavItems(user, companyConfig);
  const teams = getTeamData(user);
  const projects = getProjects(user, companyConfig);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} label="Panel Principal" />

        {projects.length > 0 && (
          <NavMain items={projects} label="Otras acciones" />
        )}

      </SidebarContent>
      {((user.user_role === "owner" || user.user_role === "operador") && companyConfig?.company?.company_estado === 1) && (
        <FeedbackSheet />
      )}

      <SidebarFooter>

        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
