"use client"

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
import { useUnreadMessagesCount } from "@/hooks/useUnreadMessagesCount"
import { NotificationBadge } from "@/components/ui/notification-badge"

export function NavMain({
  items,
  label = "Principal",
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  label?: string
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const router = useRouter();
  const { unreadCount } = useUnreadMessagesCount();

  const handleNavigation = (url: string) => {
    router.push(url);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          const isMessagesItem = item.title.toLowerCase().includes('mensaje') || item.url.includes('mensaje');
          const isPlatformMessagesItem = item.title.toLowerCase().includes('plataforma') || item.url.includes('plataforma');
          
          // Para superadmin: solo mostrar badge en "Mensajes publicos", no en "Mensajes Plataforma"
          // Para otros roles: mostrar badge en cualquier mensaje
          const shouldShowBadge = isMessagesItem && unreadCount > 0 && !isPlatformMessagesItem;

          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title}
                  onClick={() => handleNavigation(item.url)}
                  className="cursor-pointer"
                >
                  {item.icon && <item.icon />}
                  <span className="flex-1">{item.title}</span>
                  {shouldShowBadge && <NotificationBadge count={unreadCount} />}
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
                  <SidebarMenuButton tooltip={item.title} className="cursor-pointer">
                    {item.icon && <item.icon />}
                    <span className="flex-1">{item.title}</span>
                    {shouldShowBadge && <NotificationBadge count={unreadCount} />}
                    <ChevronRight className="cursor-pointer ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton 
                          onClick={() => handleNavigation(subItem.url)}
                          className="cursor-pointer"
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
