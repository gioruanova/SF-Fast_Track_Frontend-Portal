"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Search, Plus, Edit, UserCheck, UserX, Key, X, ChevronLeft, ChevronRight } from "lucide-react"
import axios from "axios"
import { config } from "@/lib/config"
import { CLIENT_API } from "@/lib/clientApi/config"

interface User {
  user_id: number
  user_complete_name: string
  user_dni: string
  user_phone: string
  user_email: string
  user_role: "operador" | "profesional"
  user_status: number
  created_at: string
  updated_at: string
}

// Interfaces eliminadas ya que no se usan

export function OperadorUsuariosPage() {
  const { companyConfig } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Estados para sheets
  const [isUserSheetOpen, setIsUserSheetOpen] = useState(false)
  const [isPasswordSheetOpen, setIsPasswordSheetOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [userFormData, setUserFormData] = useState({
    user_complete_name: "",
    user_dni: "",
    user_phone: "",
    user_email: "",
    user_role: "profesional" as const,
    user_password: ""
  })

  const [newPassword, setNewPassword] = useState("")

  const apiClient = axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get(CLIENT_API.GET_USERS)
      // Filtrar operadores y profesionales (no owners)
      const usuariosPermitidos = (response.data || []).filter((user: User) => 
        user.user_role === "profesional" || user.user_role === "operador"
      )
      setUsers(usuariosPermitidos)
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
      toast.error("Error al cargar usuarios")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleUserStatus = async (user: User) => {
    try {
      const endpoint = user.user_status === 1 
        ? CLIENT_API.USER_BLOCK.replace("{id}", user.user_id.toString())
        : CLIENT_API.USER_UNBLOCK.replace("{id}", user.user_id.toString())
      
      await apiClient.post(endpoint)
      toast.success(`Usuario ${user.user_status === 1 ? 'bloqueado' : 'desbloqueado'} exitosamente`)
      fetchUsers()
    } catch (error) {
      console.error("Error al cambiar estado del usuario:", error)
      toast.error("Error al cambiar estado del usuario")
    }
  }

  const handleOpenPasswordSheet = (user: User) => {
    setSelectedUser(user)
    const lastFourDigits = user.user_dni.slice(-4)
    setNewPassword(`Fast${lastFourDigits}`)
    setIsPasswordSheetOpen(true)
  }

  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword) return

    try {
      const url = CLIENT_API.USER_RESTORE.replace('{id}', selectedUser.user_id.toString())
      await apiClient.put(url, { new_password: newPassword })

      toast.success(`Contraseña cambiada a: ${newPassword}`)
      setIsPasswordSheetOpen(false)
      setSelectedUser(null)
      setNewPassword("")
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)
      toast.error("Error al cambiar contraseña")
    }
  }

  const handleCreateUser = () => {
    setIsEditing(false)
    setEditingUser(null)
    setUserFormData({
      user_complete_name: "",
      user_dni: "",
      user_phone: "",
      user_email: "",
      user_role: "profesional",
      user_password: ""
    })
    setIsUserSheetOpen(true)
  }

  const handleEditUser = (user: User) => {
    setIsEditing(true)
    setEditingUser(user)
    setUserFormData({
      user_complete_name: user.user_complete_name,
      user_dni: user.user_dni,
      user_phone: user.user_phone,
      user_email: user.user_email,
      user_role: "profesional", // Siempre profesional al editar (no se puede cambiar)
      user_password: ""
    })
    setIsUserSheetOpen(true)
  }

  const handleSaveUser = async () => {
    try {
      if (isEditing && editingUser) {
        const url = CLIENT_API.USERS_EDIT.replace('{id}', editingUser.user_id.toString())
        const editData: Record<string, unknown> = { 
          user_complete_name: userFormData.user_complete_name,
          user_dni: userFormData.user_dni,
          user_phone: userFormData.user_phone,
          user_email: userFormData.user_email
          // No incluir user_role ni user_password si está vacío
        }
        if (userFormData.user_password) {
          editData.user_password = userFormData.user_password
        }
        await apiClient.put(url, editData)
        toast.success("Usuario actualizado correctamente")
      } else {
        if (!userFormData.user_password) {
          toast.error("La contraseña es obligatoria para crear un usuario")
          return
        }
        await apiClient.post(CLIENT_API.USERS_CREATE, userFormData)
        toast.success("Usuario creado correctamente")
      }
      
      setIsUserSheetOpen(false)
      setEditingUser(null)
      fetchUsers()
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { error?: string }; status?: number }; message?: string })?.response?.data?.error || 
                          (error as { message?: string })?.message || 
                          "Error al guardar el usuario"
      toast.error(errorMessage)
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  const handleDniChange = (dni: string) => {
    setUserFormData(prev => ({ ...prev, user_dni: dni }))
    if (!isEditing && dni.length >= 4) {
      const lastFourDigits = dni.slice(-4)
      setUserFormData(prev => ({ ...prev, user_password: `Fast${lastFourDigits}` }))
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.user_complete_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.user_dni.includes(searchTerm)
    
    const matchesRole = filterRole === "all" || user.user_role === filterRole
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && user.user_status === 1) ||
                         (filterStatus === "blocked" && user.user_status === 0)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      operador: "bg-purple-100 text-purple-800",
      profesional: "bg-orange-100 text-orange-800"
    }

    const roleNames: Record<string, string> = {
      operador: "Operador",
      profesional: "Profesional"
    }

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
          roleColors[role] || "bg-gray-100 text-gray-800"
        }`}
      >
        {roleNames[role] || role}
      </span>
    )
  }

  const getStatusBadge = (status: number) => {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap uppercase ${
          status === 1
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}
      >
        {status === 1 ? 'Activo' : 'Inactivo'}
      </span>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Gestión de Usuarios</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gestiona operadores y profesionales de tu empresa
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {filteredUsers.length} de {users.length}
              </Badge>
              <Button onClick={handleCreateUser}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Usuario
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filtro por rol */}
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="operador">Operador</SelectItem>
                <SelectItem value="profesional">Profesional</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por estado */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="blocked">Bloqueados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabla */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando usuarios...</p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead className="text-center">Rol</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">
                        {user.user_complete_name}
                      </TableCell>
                      <TableCell>{user.user_email}</TableCell>
                      <TableCell>{user.user_dni}</TableCell>
                      <TableCell>{user.user_phone}</TableCell>
                      <TableCell className="text-center">
                        {getRoleBadge(user.user_role)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(user.user_status)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenPasswordSheet(user)}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user)}
                            className={user.user_status === 1 ? "text-red-600" : "text-green-600"}
                          >
                            {user.user_status === 1 ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Sheet para crear/editar usuario */}
      <Sheet open={isUserSheetOpen} onOpenChange={setIsUserSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Editar Usuario" : "Crear Nuevo Usuario"}
            </SheetTitle>
            <SheetDescription>
              {isEditing ? "Modifica la información del usuario" : `Completa la información para crear un nuevo usuario (rol ${companyConfig?.sing_heading_profesional} por defecto)`}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="complete_name">Nombre Completo</Label>
              <Input
                id="complete_name"
                value={userFormData.user_complete_name}
                onChange={(e) => setUserFormData(prev => ({ ...prev, user_complete_name: e.target.value }))}
                placeholder="Nombre completo del usuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                value={userFormData.user_dni}
                onChange={(e) => handleDniChange(e.target.value)}
                placeholder="DNI del usuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={userFormData.user_phone}
                onChange={(e) => setUserFormData(prev => ({ ...prev, user_phone: e.target.value }))}
                placeholder="Teléfono del usuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userFormData.user_email}
                onChange={(e) => setUserFormData(prev => ({ ...prev, user_email: e.target.value }))}
                placeholder="Email del usuario"
              />
            </div>
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="text"
                  value={userFormData.user_password}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, user_password: e.target.value }))}
                  placeholder="Contraseña del usuario"
                />
                <p className="text-xs text-muted-foreground">
                  Sugerencia: Fast + últimos 4 dígitos del DNI
                </p>
              </div>
            )}
            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="edit_password">Nueva Contraseña (opcional)</Label>
                <Input
                  id="edit_password"
                  type="text"
                  value={userFormData.user_password}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, user_password: e.target.value }))}
                  placeholder="Dejar vacío para mantener la actual"
                />
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsUserSheetOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveUser} className="flex-1">
                {isEditing ? "Guardar Cambios" : "Crear Usuario"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet para cambiar contraseña */}
      <Sheet open={isPasswordSheetOpen} onOpenChange={setIsPasswordSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Cambiar Contraseña</SheetTitle>
            <SheetDescription>
              Cambia la contraseña del usuario {selectedUser?.user_complete_name}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">Nueva Contraseña</Label>
              <Input
                id="new_password"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña"
              />
              <p className="text-xs text-muted-foreground">
                Sugerencia: Fast + últimos 4 dígitos del DNI
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsPasswordSheetOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleChangePassword} className="flex-1">
                Cambiar Contraseña
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
