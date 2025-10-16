"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { isSuperAdmin, isCompanyUser } from "@/types/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Building, Shield, Eye, EyeOff, Edit } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"
import { config } from "@/lib/config"
import { SUPER_API } from "@/lib/superApi/config"
import { EditProfileSheet } from "./edit-profile-sheet"

interface UserProfileSheetProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function UserProfileSheet({ children, open, onOpenChange }: UserProfileSheetProps) {
  const { user } = useAuth()
  const [internalOpen, setInternalOpen] = useState(false)
  
  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  if (!user) return null

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isSuperAdmin(user)) {
      toast.error("Solo los super administradores pueden cambiar contraseñas")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    try {
      setIsLoading(true)
      
      const apiClient = axios.create({
        baseURL: config.apiUrl,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const endpoint = SUPER_API.USER_RESTORE.replace("{id}", user.user_id.toString())
      
      await apiClient.put(endpoint, {
        new_password: passwordData.newPassword
      })

      toast.success("Contraseña cambiada exitosamente")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      setIsOpen(false)
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)
      toast.error("Error al cambiar la contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleDisplay = () => {
    if (isSuperAdmin(user)) {
      return "Super Administrador"
    }
    if (isCompanyUser(user)) {
      return `${user.company_name} - ${user.user_role}`
    }
    return (user as { user_role?: string }).user_role || "Usuario"
  }

  const getRoleColor = () => {
    if (isSuperAdmin(user)) {
      return "bg-red-100 text-red-800"
    }
    const userRole = (user as { user_role?: string }).user_role
    if (userRole === "owner") {
      return "bg-blue-100 text-blue-800"
    }
    if (userRole === "operador") {
      return "bg-green-100 text-green-800"
    }
    if (userRole === "profesional") {
      return "bg-purple-100 text-purple-800"
    }
    return "bg-gray-100 text-gray-800"
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            Mi Perfil
          </SheetTitle>
          <SheetDescription>
            Información de tu cuenta y configuración
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Información del Usuario */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">
                {user.user_name || user.user_email.split('@')[0]}
              </h3>
              <p className="text-sm text-muted-foreground">{user.user_email}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{user.user_email}</span>
              </div>

              {isCompanyUser(user) && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Empresa:</span>
                  <span className="text-sm">{user.company_name}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Rol:</span>
                <Badge className={getRoleColor()}>
                  {getRoleDisplay()}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Botón de Editar Perfil - Para todos los usuarios */}
          <div className="space-y-4">
            <EditProfileSheet>
              <Button className="w-full" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar Mi Perfil
              </Button>
            </EditProfileSheet>
          </div>

          <Separator />

          {/* Cambio de Contraseña - Solo para SuperAdmin */}
          {isSuperAdmin(user) && (
            <div className="space-y-4">
              <h4 className="font-medium">Cambiar Contraseña</h4>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Ingresa tu nueva contraseña"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirma tu nueva contraseña"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: ""
                      })
                      setIsOpen(false)
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? "Cambiando..." : "Cambiar Contraseña"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Información adicional para usuarios de empresa */}
          {isCompanyUser(user) && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">Información de la Empresa</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID de Empresa:</span>
                    <span className="font-medium">{user.company_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <Badge variant={user.company_status === 1 ? "default" : "secondary"}>
                      {user.company_status === 1 ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
