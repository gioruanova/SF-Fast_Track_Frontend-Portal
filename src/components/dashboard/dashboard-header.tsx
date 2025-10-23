"use client";

import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationCenter } from "./NotificationCenter";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  rightContent?: React.ReactNode;
  userRole?: string;
}

export function DashboardHeader({ breadcrumbs, rightContent, userRole }: DashboardHeaderProps) {
  
  const canSeeNotifications = userRole && ['owner', 'operador', 'profesional'].includes(userRole);
  return (
    <header className="flex h-16 shrink-0 items-center transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 z-50 bg-sidebar md:bg-card border-b border-border">
      <div className="flex items-center gap-2 px-4 flex-1 min-w-0">
        <SidebarTrigger className="-ml-1 flex-shrink-0" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {item.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {rightContent}
          {canSeeNotifications && <NotificationCenter />}
        </div>
      </div>
    </header>
  );
}

