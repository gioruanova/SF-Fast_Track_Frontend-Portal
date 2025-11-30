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
  const { user, companyConfig, isLoading } = useAuth();

  const navItems = React.useMemo(() => getNavItems(user, companyConfig), [user, companyConfig]);
  const teams = React.useMemo(() => getTeamData(user), [user]);
  const projects = React.useMemo(() => getProjects(user, companyConfig), [user, companyConfig]);
  const showFeedback = React.useMemo(() => 
    (user?.user_role === "owner" || user?.user_role === "operador") && 
    companyConfig?.company?.company_estado === 1,
    [user?.user_role, companyConfig?.company?.company_estado]
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        {!isLoading && user && (
          <>
            <NavMain items={navItems} label="Panel Principal" />

            {projects.length > 0 && (
              <NavMain items={projects} label="Otras acciones" />
            )}
          </>
        )}
      </SidebarContent>
      {showFeedback && <FeedbackSheet />}

      <SidebarFooter>
        {!isLoading && user && <NavUser />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
