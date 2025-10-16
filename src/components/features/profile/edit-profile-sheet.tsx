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
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Edit, Eye, EyeOff, AlertTriangle } from "lucide-react"
import axios from "axios"
import { config } from "@/lib/config"
import { CLIENT_API } from "@/lib/clientApi/config"

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

    try {
      const response = await apiClient.get(CLIENT_API.GET_USERS)
      const users: UserData[] = response.data
      
      // Buscar el usuario actual en el array
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

      // Validaciones básicas
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

      const updateData: Record<string, string> = {}

      // Solo incluir campos que hayan cambiado
      if (profileData.user_complete_name !== originalData.user_complete_name) {
        updateData.user_complete_name = profileData.user_complete_name
      }

      if (profileData.user_phone !== originalData.user_phone) {
        updateData.user_phone = profileData.user_phone
      }

      if (profileData.user_email !== originalData.user_email) {
        updateData.user_email = profileData.user_email
      }

      // Solo incluir contraseña si se proporcionó
      if (profileData.user_password) {
        updateData.user_password = profileData.user_password
      }

      // Si no hay cambios, no hacer nada
      if (Object.keys(updateData).length === 0) {
        toast.info("No hay cambios para guardar")
        return
      }

      const url = CLIENT_API.USERS_EDIT.replace("{id}", user.user_id.toString())
      await apiClient.put(url, updateData)

      toast.success("Perfil actualizado exitosamente")
      
      if (emailChanged) {
        toast.info("El email ha cambiado. La próxima vez que inicies sesión deberás usar el nuevo email.", {
          duration: 5000
        })
      }

      handleOpen(false)
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      toast.error("Error al actualizar el perfil")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <Sheet open={isOpen} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Mi Perfil
          </SheetTitle>
          <SheetDescription>
            Actualiza tu información personal
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h4 className="font-medium">Información Personal</h4>
            
            {/* User ID - Solo lectura */}
            <div className="space-y-2">
              <Label htmlFor="user_id">ID de Usuario</Label>
              <Input
                id="user_id"
                value={profileData.user_id}
                disabled
                className="bg-muted"
                placeholder="ID del usuario"
              />
            </div>

            {/* DNI - Solo lectura */}
            <div className="space-y-2">
              <Label>DNI</Label>
              <div className="p-3 bg-muted rounded-md border">
                <span className="text-sm font-medium">{profileData.user_dni || "No disponible"}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                El DNI no se puede modificar por seguridad
              </p>
            </div>

            {/* Nombre Completo */}
            <div className="space-y-2">
              <Label htmlFor="complete_name">Nombre Completo</Label>
              <Input
                id="complete_name"
                value={profileData.user_complete_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, user_complete_name: e.target.value }))}
                placeholder="Tu nombre completo"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={profileData.user_phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, user_phone: e.target.value }))}
                placeholder="Tu número de teléfono"
              />
            </div>

            {/* Email */}
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

          {/* Cambio de Contraseña */}
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

          {/* Botones */}
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
    </Sheet>
  )
}
