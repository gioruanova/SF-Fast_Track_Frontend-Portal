"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item, index) => {
          const hasSubItems = item.items && item.items.length > 0;
          const itemKey = item.title || `item-${index}-${item.url}`;

          if (!hasSubItems) {
            const isActive = pathname === item.url;
            
            if (item.disabled) {
              return (
                <SidebarMenuItem key={itemKey}>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    className="opacity-50 cursor-not-allowed"
                    disabled
                  >
                    {item.icon && <item.icon />}
                    <span className="flex-1">{item.title || 'Sin título'}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            return (
              <SidebarMenuItem key={itemKey}>
                <SidebarMenuButton 
                  tooltip={item.title}
                  asChild
                  isActive={isActive}
                >
                  <Link 
                    href={item.url}
                    prefetch={true}
                    onClick={() => {
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                  >
                    {item.icon && <item.icon />}
                    <span className="flex-1">{item.title || 'Sin título'}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={itemKey}
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
                    <span className="flex-1">{item.title || 'Sin título'}</span>
                    <ChevronRight className="cursor-pointer ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem, subIndex) => {
                      const subItemKey = subItem.title || `subitem-${index}-${subIndex}-${subItem.url}`;
                      const isSubActive = pathname === subItem.url;
                      
                      if (subItem.disabled) {
                        return (
                          <SidebarMenuSubItem key={subItemKey}>
                            <SidebarMenuSubButton 
                              className="opacity-50 cursor-not-allowed"
                              aria-disabled="true"
                            >
                              <span>{subItem.title || 'Sin título'}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      }

                      return (
                        <SidebarMenuSubItem key={subItemKey}>
                          <SidebarMenuSubButton 
                            asChild
                            isActive={isSubActive}
                          >
                            <Link 
                              href={subItem.url}
                              prefetch={true}
                              onClick={() => {
                                if (isMobile) {
                                  setOpenMobile(false);
                                }
                              }}
                            >
                              <span>{subItem.title || 'Sin título'}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
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
