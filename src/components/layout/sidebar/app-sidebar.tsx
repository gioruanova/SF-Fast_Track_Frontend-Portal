"use client";

import * as React from "react";
import { useMemo } from "react";
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

  const navItems = useMemo(() => getNavItems(user, companyConfig), [user, companyConfig]);
  const teams = useMemo(() => getTeamData(user), [user]);
  const projects = useMemo(() => getProjects(user, companyConfig), [user, companyConfig]);
  const showFeedback = useMemo(() => 
    (user?.user_role === "owner" || user?.user_role === "operador") && 
    companyConfig?.company?.company_estado === 1,
    [user?.user_role, companyConfig?.company?.company_estado]
  );

  if (!user) return null;

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
      {showFeedback && <FeedbackSheet />}

      <SidebarFooter>

        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
