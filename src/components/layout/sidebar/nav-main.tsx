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
import { useDashboard } from "@/context/DashboardContext"

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
  const { unreadCount } = useUnreadMessagesCount();
  const { setShouldOpenCreateReclamo } = useDashboard();

  const handleNavigation = (url: string, isCreateAction?: boolean, disabled?: boolean) => {
    if (disabled) {
      return; // No hacer nada si está desactivado
    }
    
    if (isCreateAction) {
      setShouldOpenCreateReclamo(true);
      if (isMobile) {
        setOpenMobile(false);
      }
      return;
    }
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
                  onClick={() => handleNavigation(item.url, false, item.disabled)}
                  className={`cursor-pointer ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={item.disabled}
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
                  <SidebarMenuButton 
                    tooltip={item.title} 
                    className={`cursor-pointer ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={item.disabled}
                  >
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
                          onClick={() => handleNavigation(subItem.url, subItem.isCreateAction, subItem.disabled)}
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
