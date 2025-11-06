"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Search, Plus, UserCheck, UserX, Key, X, ChevronLeft, ChevronRight, RefreshCw, Edit } from "lucide-react"
import axios from "axios"
import { config } from "@/lib/config"
import { CLIENT_API } from "@/lib/clientApi/config"


type UserRole = "operador" | "profesional";

interface User {
  user_id: number
  user_complete_name: string
  user_dni: string
  user_phone: string
  user_email: string
  user_role: UserRole
  user_status: number
  created_at: string
  updated_at: string
  apto_recibir?: boolean | number
}


export function OperadorUsuariosPage() {
  const { companyConfig, user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const [isUserSheetOpen, setIsUserSheetOpen] = useState(false)
  const [isPasswordSheetOpen, setIsPasswordSheetOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const nameRef = useRef<HTMLInputElement>(null)
  const dniRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const [selectedRole, setSelectedRole] = useState<UserRole>("profesional")

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

  useEffect(() => {
    if (isUserSheetOpen && editingUser && isEditing) {
      setTimeout(() => {
        if (nameRef.current) nameRef.current.value = editingUser.user_complete_name
        if (dniRef.current) dniRef.current.value = editingUser.user_dni
        if (phoneRef.current) phoneRef.current.value = editingUser.user_phone
        if (emailRef.current) emailRef.current.value = editingUser.user_email
        if (passwordRef.current) passwordRef.current.value = ""
        setSelectedRole(editingUser.user_role)
      }, 0)
    } else if (isUserSheetOpen && !isEditing) {
      setTimeout(() => {
        if (nameRef.current) nameRef.current.value = ""
        if (dniRef.current) dniRef.current.value = ""
        if (phoneRef.current) phoneRef.current.value = ""
        if (emailRef.current) emailRef.current.value = ""
        if (passwordRef.current) passwordRef.current.value = ""
        setSelectedRole("profesional")
      }, 0)
    }
  }, [isUserSheetOpen, editingUser, isEditing])

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
    setIsUserSheetOpen(true)
  }

  const handleEditUser = (user: User) => {
    setIsEditing(true)
    setEditingUser(user)
    setIsUserSheetOpen(true)
  }

  const handleSaveUser = async () => {
    try {
      const formData = {
        user_complete_name: nameRef.current?.value.trim() || "",
        user_dni: dniRef.current?.value.trim() || "",
        user_phone: phoneRef.current?.value.trim() || "",
        user_email: emailRef.current?.value.trim() || "",
        user_role: selectedRole,
        user_password: passwordRef.current?.value.trim() || ""
      }

      const camposFaltantes: string[] = []

      if (!formData.user_complete_name) {
        camposFaltantes.push("Nombre completo")
      }
      if (!formData.user_dni) {
        camposFaltantes.push("DNI")
      }
      if (!formData.user_phone) {
        camposFaltantes.push("Teléfono")
      }
      if (!formData.user_email) {
        camposFaltantes.push("Email")
      }

      if (!isEditing && !formData.user_password) {
        camposFaltantes.push("Contraseña")
      }

      if (camposFaltantes.length > 0) {
        toast.error(`Por favor completa los siguientes campos: ${camposFaltantes.join(", ")}`)
        return
      }

      if (isEditing && editingUser) {
        const url = CLIENT_API.USERS_EDIT.replace('{id}', editingUser.user_id.toString())
        const editData: Record<string, unknown> = {
          user_complete_name: formData.user_complete_name,
          user_dni: formData.user_dni,
          user_phone: formData.user_phone,
          user_email: formData.user_email
        }
        if (formData.user_password) {
          editData.user_password = formData.user_password
        }
        await apiClient.put(url, editData)
        toast.success("Usuario actualizado correctamente")
      } else {
        await apiClient.post(CLIENT_API.USERS_CREATE, formData)
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

  const handleDniChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const dni = e.target.value
    if (!isEditing && passwordRef.current && dni.length >= 4) {
      const lastFourDigits = dni.slice(-4)
      passwordRef.current.value = `Fast${lastFourDigits}`
    }
  }, [isEditing])

  const filteredUsers = useMemo(() => {
    return users.filter(userItem => {
      if (user && userItem.user_id === user.user_id) {
        return false
      }

      const matchesSearch = userItem.user_complete_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userItem.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userItem.user_dni.includes(searchTerm)

      const matchesRole = filterRole === "all" || userItem.user_role === filterRole
      const matchesStatus = filterStatus === "all" ||
        (filterStatus === "active" && userItem.user_status === 1) ||
        (filterStatus === "blocked" && userItem.user_status === 0)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, filterRole, filterStatus, user])

  const { totalPages, startIndex, endIndex, paginatedUsers } = useMemo(() => {
    const total = Math.ceil(filteredUsers.length / itemsPerPage)
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    const paginated = filteredUsers.slice(start, end)
    return { totalPages: total, startIndex: start, endIndex: end, paginatedUsers: paginated }
  }, [filteredUsers, currentPage, itemsPerPage])

  const getRoleDisplayName = (role: UserRole) => {
    const roleMapping: Record<UserRole, string> = {
      operador: companyConfig?.sing_heading_operador || "Operador",
      profesional: companyConfig?.sing_heading_profesional || "Profesional"
    }
    return roleMapping[role] || role
  }

  const getRoleBadge = (role: UserRole) => {
    const roleColors: Record<UserRole, string> = {
      operador: "bg-purple-100 text-purple-800",
      profesional: "bg-orange-100 text-orange-800"
    }

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${roleColors[role] || "bg-gray-100 text-gray-800"
          }`}
      >
        {getRoleDisplayName(role)}
      </span>
    )
  }

  const getStatusBadge = (status: number) => {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap uppercase ${status === 1
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
      >
        {status === 1 ? 'Activo' : 'Inactivo'}
      </span>
    )
  }

  const handleRefreshUsers = () => {
    fetchUsers()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-2 md:gap-0">
            <div>
              <CardTitle className="text-2xl">Gestión de Usuarios</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 text-balance">
                Gestiona {companyConfig?.plu_heading_operador} y {companyConfig?.plu_heading_profesional} de tu empresa
              </p>
            </div>
            <div className="flex flex-col items-start md:items-center md:flex-row md:gap-2 gap-1">
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {filteredUsers.length} de {users.length}
              </Badge>
              <Button onClick={handleCreateUser}>
                <Plus className="h-4 w-4" />
                Crear Usuario
              </Button>
              <Button onClick={handleRefreshUsers} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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

            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="md:w-[140px] w-auto">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="operador">{companyConfig?.sing_heading_operador || "Operador"}</SelectItem>
                <SelectItem value="profesional">{companyConfig?.sing_heading_profesional || "Profesional"}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="md:w-[140px] w-auto">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="blocked">Bloqueados</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                    <TableHead>Teléfono</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead className="text-center">Rol</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Recibiendo?</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">
                        {user.user_complete_name}
                      </TableCell>
                      <TableCell>
                        <a href={`mailto:${user.user_email}`} className="text-primary hover:underline">{user.user_email}</a>
                      </TableCell>
                      <TableCell>
                        <a href={`tel:${user.user_phone}`} className="text-primary hover:underline">{user.user_phone}</a>
                      </TableCell>
                      <TableCell>{user.user_dni}</TableCell>
                      <TableCell className="text-center">
                        {getRoleBadge(user.user_role)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(user.user_status)}
                      </TableCell>
                      <TableCell className="text-center">
                        {user.apto_recibir === 1 ? (user.user_role !== "operador" ? <Badge variant="default" className="bg-green-500 text-white px-2 py-1 rounded-md">Si</Badge> : "-") : (user.user_role !== "operador" ? <Badge variant="default" className="bg-red-500 text-white px-2 py-1 rounded-md">No</Badge> : "-")}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">

                          {
                            user.user_role === "operador" ? (
                              <span>-</span>
                            ) : (

                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                  title="Editar usuario"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>


                                {
                                  user.user_status === 0 ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      title="Restaurar usuario"
                                      onClick={() => handleOpenPasswordSheet(user)}
                                    >
                                      <Key className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    null
                                  )
                                }


                                <Button
                                  variant="outline"
                                  size="sm"
                                  title={user.user_status === 1 ? "Bloquear usuario" : "Desbloquear usuario"}
                                  onClick={() => handleToggleUserStatus(user)}
                                  className={user.user_status === 1 ? "text-red-600" : "text-green-600"}
                                >
                                  {user.user_status === 1 ? (
                                    <UserX className="h-4 w-4" />
                                  ) : (
                                    <UserCheck className="h-4 w-4" />
                                  )}
                                </Button>
                              </>
                            )
                          }

                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col gap-4 mt-4">
                <div className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuarios
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center gap-1 md:gap-2 justify-center md:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="text-xs md:text-sm px-2 md:px-3"
                    >
                      <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden sm:inline ml-1">Anterior</span>
                    </Button>

                    <div className="flex flex-wrap items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-6 h-6 md:w-8 md:h-8 p-0 text-xs md:text-sm"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="text-xs md:text-sm px-2 md:px-3"
                    >
                      <span className="hidden sm:inline mr-1">Siguiente</span>
                      <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Sheet open={isUserSheetOpen} onOpenChange={setIsUserSheetOpen} key={`${isEditing}-${editingUser?.user_id || 'new'}`}>
        <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? `Editar ${companyConfig?.sing_heading_profesional}` :  `Crear  ${companyConfig?.sing_heading_profesional}`}
            </SheetTitle>
            <SheetDescription>
              {isEditing ? `Modifica la información del usuario` : `Completa la información para crear un nuevo usuario (rol ${companyConfig?.sing_heading_profesional} por defecto)`}
            </SheetDescription>
          </SheetHeader>

          <Separator />
          <div className="mt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="complete_name">Nombre Completo <span className="text-red-500">*</span></Label>
              <Input
                key={`name-${editingUser?.user_id || 'new'}`}
                id="complete_name"
                ref={nameRef}
                defaultValue={isEditing && editingUser ? editingUser.user_complete_name : ""}
                placeholder="Nombre completo del usuario"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dni">DNI <span className="text-red-500">*</span></Label>
              <Input
                key={`dni-${editingUser?.user_id || 'new'}`}
                id="dni"
                ref={dniRef}
                defaultValue={isEditing && editingUser ? editingUser.user_dni : ""}
                onChange={handleDniChange}
                placeholder="DNI del usuario"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono <span className="text-red-500">*</span></Label>
              <Input
                key={`phone-${editingUser?.user_id || 'new'}`}
                id="phone"
                ref={phoneRef}
                defaultValue={isEditing && editingUser ? editingUser.user_phone : ""}
                placeholder="+54 9 11 1234-5678"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                key={`email-${editingUser?.user_id || 'new'}`}
                id="email"
                type="email"
                ref={emailRef}
                defaultValue={isEditing && editingUser ? editingUser.user_email : ""}
                placeholder="usuario@empresa.com"
                required
              />
            </div>
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña <span className="text-red-500">*</span></Label>
                <Input
                  key={`password-${editingUser?.user_id || 'new'}`}
                  id="password"
                  type="text"
                  ref={passwordRef}
                  defaultValue=""
                  placeholder="Contraseña del usuario"
                  required
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
                  key={`password-${editingUser?.user_id || 'new'}`}
                  id="edit_password"
                  type="text"
                  ref={passwordRef}
                  defaultValue=""
                  placeholder="Dejar vacío para mantener la contraseña actual"
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

      <Sheet open={isPasswordSheetOpen} onOpenChange={setIsPasswordSheetOpen}>
        <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>Cambiar Contraseña</SheetTitle>
            <SheetDescription className="flex flex-col gap-2">
              <span>Esta opcion es unicamente para cuando el usuario este bloqueado y necesita reestablecerse.</span>
              <span>Cambia la contraseña del usuario {selectedUser?.user_complete_name}</span>
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
