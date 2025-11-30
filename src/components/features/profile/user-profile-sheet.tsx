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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Building, Shield, Eye, EyeOff, Edit, Lock, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"
import { config } from "@/lib/config"
import { API_ROUTES } from "@/lib/api_routes"
import { EditProfileSheet } from "./edit-profile-sheet"

interface UserProfileSheetProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function UserProfileSheet({ children, open, onOpenChange }: UserProfileSheetProps) {
  const { user, companyConfig, isLoading: authLoading } = useAuth()
  const [internalOpen, setInternalOpen] = useState(false)

  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordChangeDialog, setShowPasswordChangeDialog] = useState(false)
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !isSuperAdmin(user)) {
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

    setShowPasswordChangeDialog(true)
  }

  const handleConfirmPasswordChange = async () => {
    if (!user) {
      toast.error("Usuario no encontrado")
      return
    }

    setShowPasswordChangeDialog(false)

    try {
      setIsLoading(true)

      const apiClient = axios.create({
        baseURL: config.apiUrl,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const endpoint = API_ROUTES.USERS_EDIT.replace("{id}", user.user_id.toString())

      await apiClient.put(endpoint, {
        user_password: passwordData.newPassword
      })

      setIsOpen(false)
      
      setShowLogoutOverlay(true)
      setTimeout(() => {
        window.location.href = '/login'
      }, 4000)
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)
      toast.error("Error al cambiar la contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleDisplayName = (role: string) => {
    const roleMapping: Record<string, string> = {
      owner: companyConfig?.sing_heading_owner || "Owner",
      operador: companyConfig?.sing_heading_operador || "Operador",
      profesional: companyConfig?.sing_heading_profesional || "Profesional"
    }
    return roleMapping[role] || role
  }

  const getRoleDisplay = () => {
    if (!user) return "Usuario"
    if (isSuperAdmin(user)) {
      return "Super Administrador"
    }
    if (isCompanyUser(user)) {
      const userRole = (user as { user_role?: string }).user_role
      return getRoleDisplayName(userRole || "")
    }
    return (user as { user_role?: string }).user_role || "Usuario"
  }

  const getRoleColor = () => {
    if (!user) return "bg-gray-100 text-gray-800"
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
      <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>
            Mi Perfil
          </SheetTitle>
          <SheetDescription>
            Información de tu cuenta y configuración
          </SheetDescription>
        </SheetHeader>

        <Separator />

                 {(authLoading || !user) ? (
           <div className="flex items-center justify-center py-8">
             <div className="text-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
               <p className="text-muted-foreground">Cargando información del perfil...</p>
             </div>
           </div>
         ) : (
          <div className="mt-0 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-lg">
                  {user.user_name || user.user_email.split('@')[0]}
                </h3>

            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{user.user_email}</span>
              </div>

              {user && isCompanyUser(user) && (
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

          <div className="space-y-4">
            <EditProfileSheet>
              <Button className="w-full" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar Mi Perfil
              </Button>
            </EditProfileSheet>
          </div>

          <Separator />

          {user && isSuperAdmin(user) && (
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

          {user && isCompanyUser(user) && (
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
        )}
      </SheetContent>

      <AlertDialog open={showPasswordChangeDialog} onOpenChange={setShowPasswordChangeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-full">
                <Lock className="h-5 w-5 text-amber-600" />
              </div>
              <AlertDialogTitle>¿Cambiar contraseña?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Esta acción cambiará tu contraseña y cerrará tu sesión actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-900">Información importante:</p>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>Este cambio es irreversible</li>
                  <li>Tu sesión se cerrará automáticamente</li>
                  <li>Deberás iniciar sesión nuevamente con tu nueva contraseña</li>
                  <li>Asegúrate de recordar tu nueva contraseña</li>
                </ul>
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPasswordChange}
              disabled={isLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isLoading ? "Cambiando..." : "Sí, cambiar contraseña"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showLogoutOverlay && (
        <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Lock className="h-8 w-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-foreground">
                Contraseña actualizada exitosamente
              </h3>
              <p className="text-lg text-muted-foreground">
                Cerrando sesión...
              </p>
            </div>

            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      )}
    </Sheet>
  )
}
