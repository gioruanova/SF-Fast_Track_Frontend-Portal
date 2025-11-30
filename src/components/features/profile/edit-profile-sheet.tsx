"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
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
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Edit, Eye, EyeOff, AlertTriangle, Lock, Loader2 } from "lucide-react"
import axios from "axios"
import { config } from "@/lib/config"
import { API_ROUTES } from "@/lib/api_routes"
import { isCompanyUser } from "@/types/auth"

interface EditProfileSheetProps {
  children: React.ReactNode
  onOpenChange?: (open: boolean) => void
}

interface ProfileData {
  user_id: number
  user_complete_name: string
  user_dni: string
  user_phone: string
  user_email: string
  user_password: string
}

interface UserData {
  user_id: number
  user_complete_name: string
  user_dni: string
  user_phone: string
  user_email: string
  user_role: string
  user_status: number
  company_id: number
  created_at: string
  updated_at: string
  especialidades: unknown[]
}

export function EditProfileSheet({ children, onOpenChange }: EditProfileSheetProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(true)
  const [emailChanged, setEmailChanged] = useState(false)
  const [showPasswordChangeDialog, setShowPasswordChangeDialog] = useState(false)
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false)

  const [profileData, setProfileData] = useState<ProfileData>({
    user_id: 0,
    user_complete_name: "",
    user_dni: "",
    user_phone: "",
    user_email: "",
    user_password: ""
  })

  const [originalData, setOriginalData] = useState<ProfileData>({
    user_id: 0,
    user_complete_name: "",
    user_dni: "",
    user_phone: "",
    user_email: "",
    user_password: ""
  })

  const [, setUserData] = useState<UserData | null>(null)

  const apiClient = axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const fetchUserData = async () => {
    if (!user) return

if (isCompanyUser(user) && (user.user_role === "owner" || user.user_role === "operador")) {
      const profileInfo: ProfileData = {
        user_id: user.user_id,
        user_complete_name: user.user_name || "",
        user_dni: user.user_dni || "",
        user_phone: user.user_phone || "",
        user_email: user.user_email || "",
        user_password: ""
      }

      setProfileData(profileInfo)
      setOriginalData(profileInfo)
      setEmailChanged(false)
      return
    }

try {
      const endpoint = API_ROUTES.GET_USERS
      const response = await apiClient.get(endpoint)
      const users: UserData[] = response.data

      const userInfo = users.find(u => u.user_id === user.user_id)

      if (!userInfo) {
        toast.error("No se pudo encontrar la información del usuario")
        return
      }

      setUserData(userInfo)

      const profileInfo: ProfileData = {
        user_id: userInfo.user_id,
        user_complete_name: userInfo.user_complete_name || "",
        user_dni: userInfo.user_dni || "",
        user_phone: userInfo.user_phone || "",
        user_email: userInfo.user_email || "",
        user_password: ""
      }

      setProfileData(profileInfo)
      setOriginalData(profileInfo)
      setEmailChanged(false)
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error)
      toast.error("Error al cargar información del usuario")
    }
  }

  const handleOpen = (open: boolean) => {
    if (open && user) {
      fetchUserData()
    }
    setIsOpen(open)
    onOpenChange?.(open)
  }

  const handleEmailChange = (email: string) => {
    setProfileData(prev => ({ ...prev, user_email: email }))
    setEmailChanged(email !== originalData.user_email)
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      if (!profileData.user_complete_name.trim()) {
        toast.error("El nombre completo es requerido")
        return
      }

      if (!profileData.user_email.trim()) {
        toast.error("El email es requerido")
        return
      }

      if (emailChanged && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.user_email)) {
        toast.error("El formato del email no es válido")
        return
      }

      if (profileData.user_password && profileData.user_password.length < 6) {
        toast.error("La contraseña debe tener al menos 6 caracteres")
        return
      }

      if (profileData.user_password) {
        setIsLoading(false)
        setShowPasswordChangeDialog(true)
        return
      }

      await saveProfileChanges()
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      toast.error("Error al actualizar el perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfileChanges = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      const updateData: Record<string, string> = {}

      if (profileData.user_complete_name !== originalData.user_complete_name) {
        updateData.user_complete_name = profileData.user_complete_name
      }

      if (profileData.user_phone !== originalData.user_phone) {
        updateData.user_phone = profileData.user_phone
      }

      if (profileData.user_email !== originalData.user_email) {
        updateData.user_email = profileData.user_email
      }

      if (profileData.user_password) {
        updateData.user_password = profileData.user_password
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("No hay cambios para guardar")
        return
      }

if (isCompanyUser(user) && (user.user_role === "owner" || user.user_role === "operador")) {
        await apiClient.put(API_ROUTES.PROFILE, updateData)
      } else {
        
        const url = API_ROUTES.USERS_EDIT.replace("{id}", user.user_id.toString())
        await apiClient.put(url, updateData)
      }

      toast.success("Perfil actualizado exitosamente")

      if (emailChanged) {
        toast.info("El email ha cambiado. La próxima vez que inicies sesión deberás usar el nuevo email.", {
          duration: 5000
        })
      }

      handleOpen(false)

      if (profileData.user_password) {
        setShowLogoutOverlay(true)
        setTimeout(() => {
          window.location.href = '/login'
        }, 4000)
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      toast.error("Error al actualizar el perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmPasswordChange = () => {
    setShowPasswordChangeDialog(false)
    saveProfileChanges()
  }

  if (!user) return null

  return (
    <Sheet open={isOpen} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Mi Perfil
          </SheetTitle>
          <SheetDescription>
            Actualiza tu información personal
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <div className="mt-0 space-y-6">
          <div className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="user_id">ID Unico</Label>
              <div className="p-2 bg-muted rounded-md "
                id="user_id"

              >{profileData.user_id}</div>
            </div>

            <div className="space-y-2">
              <Label>DNI</Label>
              <div className="p-2 bg-muted rounded-md ">
                <span className="text-sm font-medium">{profileData.user_dni || "No disponible"}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="complete_name">Nombre Completo</Label>
              <Input
                id="complete_name"
                value={profileData.user_complete_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, user_complete_name: e.target.value }))}
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={profileData.user_phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, user_phone: e.target.value }))}
                placeholder="Tu número de teléfono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.user_email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="Tu dirección de email"
              />
              {emailChanged && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <p className="text-xs text-amber-800">
                    Cambiar el email afectará tu proceso de login
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Cambio de Contraseña</h4>
            <p className="text-sm text-muted-foreground">
              Deja el campo vacío si no deseas cambiar tu contraseña
            </p>

            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={profileData.user_password}
                  onChange={(e) => setProfileData(prev => ({ ...prev, user_password: e.target.value }))}
                  placeholder="Nueva contraseña (opcional)"
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
              <p className="text-xs text-muted-foreground">
                Mínimo 6 caracteres
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => handleOpen(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
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
