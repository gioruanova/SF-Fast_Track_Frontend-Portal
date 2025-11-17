"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  label = "Principal",
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    disabled?: boolean
    items?: {
      title: string
      url: string
      isCreateAction?: boolean
      disabled?: boolean
    }[]
  }[]
  label?: string
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const router = useRouter();

  const handleNavigation = useCallback((url: string, disabled?: boolean) => {
    if (disabled) {
      return;
    }
    
    router.push(url);
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [router, isMobile, setOpenMobile]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;

          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title}
                  onClick={() => handleNavigation(item.url, item.disabled)}
                  className={`cursor-pointer ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={item.disabled}
                >
                  {item.icon && <item.icon />}
                  <span className="flex-1">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={item.title} 
                    className={`cursor-pointer ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={item.disabled}
                  >
                    {item.icon && <item.icon />}
                    <span className="flex-1">{item.title}</span>
                    <ChevronRight className="cursor-pointer ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton 
                          onClick={() => handleNavigation(subItem.url, subItem.disabled)}
                          className={`cursor-pointer ${subItem.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span>{subItem.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
