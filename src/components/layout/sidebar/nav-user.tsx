"use client"

import { useState } from "react"
import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"
import { isSuperAdmin, isCompanyUser } from "@/types/auth"
import { UserProfileSheet } from "@/components/features/profile/user-profile-sheet"

export function NavUser() {
  const { user, logout, companyConfig } = useAuth()
  const { isMobile } = useSidebar()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const isCompanyActive = companyConfig?.company?.company_estado === 1;

  async function handleLogout() {
    try {
      await logout()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  function getInitials(name?: string) {
    if (!name) return "U"
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  function getDisplayName() {
    if (!user) return "Usuario"
    const userName = 'user_name' in user ? user.user_name : undefined
    if (userName) {
      return userName
    }
    return user.user_email?.split('@')[0] || "Usuario"
  }

  function getRoleInfo() {
    if (!user) return "Usuario"
    if (isSuperAdmin(user)) {
      return "Super Administrador"
    }
    if (isCompanyUser(user)) {
      return `${user.company_name} - ${user.user_role}`
    }
    return "Usuario"
  }

  const displayName = getDisplayName()
  const roleInfo = getRoleInfo()

  if (!user) return null

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs">{user.user_email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >

              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {getInitials(getDisplayName())}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="truncate text-xs">{user.user_email}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {roleInfo}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setIsProfileOpen(true)}
                  disabled={!isSuperAdmin(user) && !isCompanyActive}
                  className={(!isSuperAdmin(user) && !isCompanyActive) ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <BadgeCheck />
                  Mi Perfil
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>

      </SidebarMenu>

      <UserProfileSheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>

        <div />
      </UserProfileSheet>
    </>
  )
}
