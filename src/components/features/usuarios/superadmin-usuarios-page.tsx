"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search, X, ChevronLeft, ChevronRight, Plus, Edit, Lock, Unlock, Building2, Shield } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { config } from "@/lib/config";
import { SUPER_API } from "@/lib/superApi/config";

const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface UserData {
  user_id: number;
  user_complete_name: string;
  user_email: string;
  user_phone: string;
  user_dni: string;
  user_role: string;
  user_status: number;
  company_id: number;
  company_nombre?: string;
  created_at: string;
  last_login?: string;
}

interface CompanyData {
  company_id: number;
  company_nombre: string;
}

export function SuperadminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UserData[]>([]);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // maximo 5 usuarios por pagina

  // estados para el sheet de cambio de contraseña
  const [isPasswordSheetOpen, setIsPasswordSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // estados para crear/editar usuario
  const [isUserSheetOpen, setIsUserSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [userFormData, setUserFormData] = useState({
    user_complete_name: "",
    user_email: "",
    user_phone: "",
    user_dni: "",
    user_role: "",
    company_id: 0,
    user_password: ""
  });

  const fetchUsuarios = async () => {
    try {
      setIsLoading(true);
      const [usuariosResponse, companiesResponse] = await Promise.all([
        apiClient.get(SUPER_API.GET_USERS),
        apiClient.get(SUPER_API.GET_COMPANIES)
      ]);

      // filtrar superadmin y agregar nombre de empresa
      const usuariosData = usuariosResponse.data
        .filter((user: UserData) => user.user_role !== "superadmin")
        .map((user: UserData) => {
          const company = companiesResponse.data.find((c: CompanyData) => c.company_id === user.company_id);
          return {
            ...user,
            company_nombre: company?.company_nombre || "Empresa no encontrada"
          };
        });

      setUsuarios(usuariosData);
      setCompanies(companiesResponse.data);
    } catch {
      toast.error("Error al cargar los usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // resetear pagina cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus, filterCompany]);

  const filteredUsuarios = usuarios.filter((user) => {
    const matchesSearch =
      user.user_complete_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_dni.includes(searchTerm) ||
      user.company_nombre?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.user_role === filterRole;
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" && user.user_status === 1) ||
      (filterStatus === "inactive" && user.user_status === 0);
    const matchesCompany = filterCompany === "all" || user.company_nombre === filterCompany;

    return matchesSearch && matchesRole && matchesStatus && matchesCompany;
  });

  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsuarios = filteredUsuarios.slice(startIndex, endIndex);

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
    );
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      owner: "bg-blue-100 text-blue-800",
      operador: "bg-purple-100 text-purple-800",
      profesional: "bg-orange-100 text-orange-800"
    };

    const roleNames: Record<string, string> = {
      owner: "Owner",
      operador: "Operador",
      profesional: "Profesional"
    };

    return (
      <Badge variant="secondary" className={roleColors[role] || "bg-gray-100 text-gray-800"}>
        {roleNames[role] || role}
      </Badge>
    );
  };

  const handleToggleStatus = async (userId: number, currentStatus: number) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      const endpoint = newStatus === 1 ? SUPER_API.USER_UNBLOCK : SUPER_API.USER_BLOCK;
      const url = endpoint.replace('{id}', userId.toString());

      await apiClient.post(url);

      setUsuarios(prev =>
        prev.map(user =>
          user.user_id === userId
            ? { ...user, user_status: newStatus }
            : user
        )
      );

      toast.success(newStatus === 1 ? "Usuario activado" : "Usuario desactivado");
    } catch {
      toast.error("Error al cambiar el estado del usuario");
    }
  };

  const handleOpenPasswordSheet = (user: UserData) => {
    setSelectedUser(user);
    const lastFourDigits = user.user_dni.slice(-4);
    setNewPassword(`Fast${lastFourDigits}`);
    setIsPasswordSheetOpen(true);
  };

  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      const url = SUPER_API.USER_RESTORE.replace('{id}', selectedUser.user_id.toString());
      await apiClient.put(url, { new_password: newPassword });

      toast.success(`Contraseña cambiada a: ${newPassword}`);
      setIsPasswordSheetOpen(false);
      setSelectedUser(null);
      setNewPassword("");
    } catch {
      toast.error("Error al cambiar la contraseña");
    }
  };

  const handleCreateUser = () => {
    setIsEditing(false);
    setEditingUser(null);
    setUserFormData({
      user_complete_name: "",
      user_email: "",
      user_phone: "",
      user_dni: "",
      user_role: "",
      company_id: 0,
      user_password: ""
    });
    setIsUserSheetOpen(true);
  };

  const handleEditUser = (user: UserData) => {
    setIsEditing(true);
    setEditingUser(user);
    setUserFormData({
      user_complete_name: user.user_complete_name,
      user_email: user.user_email,
      user_phone: user.user_phone,
      user_dni: user.user_dni,
      user_role: user.user_role,
      company_id: user.company_id,
      user_password: "" // no pre-llenar contraseña por seguridad
    });
    setIsUserSheetOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      if (isEditing && editingUser) {
        // editar usuario existente
        const url = SUPER_API.USERS_EDIT.replace('{id}', editingUser.user_id.toString());
        const editData: Record<string, unknown> = { ...userFormData };
        // solo incluir contraseña si se proporciono
        if (!editData.user_password) {
          delete editData.user_password;
        }
        await apiClient.put(url, editData);
        toast.success("Usuario actualizado correctamente");
      } else {
        // crear nuevo usuario - validar que tenga contraseña
        if (!userFormData.user_password) {
          toast.error("La contraseña es obligatoria para crear un usuario");
          return;
        }
        await apiClient.post(SUPER_API.USERS_CREATE, userFormData);
        toast.success("Usuario creado correctamente");
      }

      setIsUserSheetOpen(false);
      setEditingUser(null);
      fetchUsuarios(); // recargar la lista
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { error?: string }; status?: number }; message?: string })?.response?.data?.error ||
        (error as { message?: string })?.message ||
        "Error al guardar el usuario";
      toast.error(errorMessage);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleDniChange = (dni: string) => {
    setUserFormData(prev => ({ ...prev, user_dni: dni }));
    // generar contraseña sugerida si no es edicion y hay dni
    if (!isEditing && dni.length >= 4) {
      const lastFourDigits = dni.slice(-4);
      setUserFormData(prev => ({ ...prev, user_password: `Fast${lastFourDigits}` }));
    }
  };

  const empresasUnicas = Array.from(new Set(usuarios.map(u => u.company_nombre).filter(Boolean))).sort();

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Gestión de Usuarios</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 text-balance">
                Gestiona todos los usuarios del sistema
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {filteredUsuarios.length} de {usuarios.length}
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
                placeholder="Buscar por nombre, email, DNI o empresa..."
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

            {/* Filtro por Rol */}
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full md:w-[200px] cursor-pointer">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">Todos los roles</SelectItem>
                <SelectItem value="owner" className="cursor-pointer">Owner</SelectItem>
                <SelectItem value="operador" className="cursor-pointer">Operadores</SelectItem>
                <SelectItem value="profesional" className="cursor-pointer">Profesionales</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por Estado */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px] cursor-pointer">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">Todos los estados</SelectItem>
                <SelectItem value="active" className="cursor-pointer">Activos</SelectItem>
                <SelectItem value="inactive" className="cursor-pointer">Inactivos</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por Empresa */}
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="w-full md:w-[200px] cursor-pointer">
                <SelectValue placeholder="Filtrar por empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">Todas las empresas</SelectItem>
                {empresasUnicas.map((empresa) => (
                  <SelectItem key={empresa} value={empresa || ""} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3" />
                      {empresa}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabla */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm || filterRole !== "all" || filterStatus !== "all" || filterCompany !== "all"
                ? "No se encontraron usuarios que coincidan con los filtros"
                : "No hay usuarios"}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead className="min-w-[250px]">Nombre</TableHead>
                    <TableHead className="w-[120px] text-center">Rol</TableHead>
                    <TableHead className="w-[100px] text-center">Estado</TableHead>
                    <TableHead className="min-w-[200px]">Empresa</TableHead>
                    <TableHead className="w-[120px] text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsuarios.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">#{user.user_id}</TableCell>
                      <TableCell>
                        <div className="max-w-[230px]">
                          <p className="font-medium truncate">{user.user_complete_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getRoleBadge(user.user_role)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(user.user_status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm max-w-[180px]">
                          <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{user.company_nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleEditUser(user)}
                            title="Editar usuario"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(user.user_id, user.user_status)}
                            className={user.user_status === 1 ? 'text-destructive hover:text-destructive' : 'text-green-600 hover:text-green-600'}
                            title={user.user_status === 1 ? "Desactivar usuario" : "Activar usuario"}
                          >
                            {user.user_status === 1 ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleOpenPasswordSheet(user)}
                            title="Cambiar contraseña"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Paginación */}
          <div className="flex flex-col gap-4">
            <div className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredUsuarios.length)} de {filteredUsuarios.length} usuarios
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
        </CardContent>
      </Card>

      {/* Sheet para crear/editar usuario */}
      <Sheet open={isUserSheetOpen} onOpenChange={setIsUserSheetOpen}>
        <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Editar Usuario" : "Crear Usuario"}
            </SheetTitle>
            <SheetDescription>
              {isEditing ? "Modifica los datos del usuario" : "Completa los datos para crear un nuevo usuario"}
            </SheetDescription>
          </SheetHeader>
          <Separator />
          <div className="space-y-4 mt-0">
            <div>
              <label className="text-sm font-medium">Nombre completo</label>
              <Input
                value={userFormData.user_complete_name}
                onChange={(e) => setUserFormData(prev => ({ ...prev, user_complete_name: e.target.value }))}
                placeholder="Ingresa el nombre completo"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={userFormData.user_email}
                onChange={(e) => setUserFormData(prev => ({ ...prev, user_email: e.target.value }))}
                placeholder="usuario@empresa.com"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Teléfono</label>
              <Input
                value={userFormData.user_phone}
                onChange={(e) => setUserFormData(prev => ({ ...prev, user_phone: e.target.value }))}
                placeholder="+54 9 11 1234-5678"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">DNI</label>
              <Input
                value={userFormData.user_dni}
                onChange={(e) => handleDniChange(e.target.value)}
                placeholder="12345678"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Rol</label>
              <Select value={userFormData.user_role} onValueChange={(value) => setUserFormData(prev => ({ ...prev, user_role: value }))}>
                <SelectTrigger className="min-w-full cursor-pointer">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner" className="cursor-pointer">Owner</SelectItem>
                  <SelectItem value="operador" className="cursor-pointer">Operador</SelectItem>
                  <SelectItem value="profesional" className="cursor-pointer">Profesional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Empresa</label>
              <Select value={userFormData.company_id.toString()} onValueChange={(value) => setUserFormData(prev => ({ ...prev, company_id: parseInt(value) }))}>
                <SelectTrigger className="min-w-full cursor-pointer">
                  <SelectValue placeholder="Selecciona una empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.company_id} value={company.company_id.toString()} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3 w-3" />
                        {company.company_nombre}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">
                Contraseña {isEditing ? "(opcional)" : "(obligatoria)"}
              </label>
              <Input
                type="text"
                value={userFormData.user_password}
                onChange={(e) => setUserFormData(prev => ({ ...prev, user_password: e.target.value }))}
                placeholder={isEditing ? "Dejar vacío para mantener la actual" : "Ingresa la contraseña"}
                className="mt-1"
              />
              {!isEditing && (
                <p className="text-xs text-muted-foreground mt-1">
                  Sugerencia: Fast + últimos 4 dígitos del DNI
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => setIsUserSheetOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveUser} className="flex-1">
                {isEditing ? "Actualizar" : "Crear Usuario"}
              </Button>

            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet para cambio de contraseña */}
      <Sheet open={isPasswordSheetOpen} onOpenChange={setIsPasswordSheetOpen}>
        <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>Cambiar Contraseña</SheetTitle>
            <SheetDescription>
              Cambiar la contraseña para {selectedUser?.user_complete_name}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <label className="text-sm font-medium">Nueva contraseña</label>
              <Input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ingresa la nueva contraseña"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Sugerencia: Fast + últimos 4 dígitos del DNI
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleChangePassword} className="flex-1">
                Cambiar Contraseña
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsPasswordSheetOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}