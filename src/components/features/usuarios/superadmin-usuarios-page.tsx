"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { Search, X, ChevronLeft, ChevronRight, Plus, Edit, Lock, Unlock, Building2, Shield, RefreshCw } from "lucide-react";
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
  const itemsPerPage = 10;

  const [isPasswordSheetOpen, setIsPasswordSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [isUserSheetOpen, setIsUserSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const dniRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [selectedRole, setSelectedRole] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("0");

  const fetchUsuarios = async () => {
    try {
      setIsLoading(true);
      const [usuariosResponse, companiesResponse] = await Promise.all([
        apiClient.get(SUPER_API.GET_USERS),
        apiClient.get(SUPER_API.GET_COMPANIES)
      ]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus, filterCompany]);

  useEffect(() => {
    if (isUserSheetOpen && editingUser && isEditing) {
      setTimeout(() => {
        if (nameRef.current) nameRef.current.value = editingUser.user_complete_name;
        if (emailRef.current) emailRef.current.value = editingUser.user_email;
        if (phoneRef.current) phoneRef.current.value = editingUser.user_phone;
        if (dniRef.current) dniRef.current.value = editingUser.user_dni;
        if (passwordRef.current) passwordRef.current.value = "";
        setSelectedRole(editingUser.user_role);
        setSelectedCompany(editingUser.company_id.toString());
      }, 0);
    } else if (isUserSheetOpen && !isEditing) {
      setTimeout(() => {
        if (nameRef.current) nameRef.current.value = "";
        if (emailRef.current) emailRef.current.value = "";
        if (phoneRef.current) phoneRef.current.value = "";
        if (dniRef.current) dniRef.current.value = "";
        if (passwordRef.current) passwordRef.current.value = "";
        setSelectedRole("");
        setSelectedCompany("0");
      }, 0);
    }
  }, [isUserSheetOpen, editingUser, isEditing]);

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((user) => {
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
  }, [usuarios, searchTerm, filterRole, filterStatus, filterCompany]);

  const { totalPages, startIndex, endIndex, currentUsuarios } = useMemo(() => {
    const total = Math.ceil(filteredUsuarios.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const current = filteredUsuarios.slice(start, end);
    return { totalPages: total, startIndex: start, endIndex: end, currentUsuarios: current };
  }, [filteredUsuarios, currentPage, itemsPerPage]);

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
    fetchUsuarios();
  };


  const handleCreateUser = () => {
    setIsEditing(false);
    setEditingUser(null);
    if (nameRef.current) nameRef.current.value = "";
    if (emailRef.current) emailRef.current.value = "";
    if (phoneRef.current) phoneRef.current.value = "";
    if (dniRef.current) dniRef.current.value = "";
    if (passwordRef.current) passwordRef.current.value = "";
    setSelectedRole("");
    setSelectedCompany("0");
    setIsUserSheetOpen(true);
  };

  const handleEditUser = (user: UserData) => {
    setIsEditing(true);
    setEditingUser(user);
    if (nameRef.current) nameRef.current.value = user.user_complete_name;
    if (emailRef.current) emailRef.current.value = user.user_email;
    if (phoneRef.current) phoneRef.current.value = user.user_phone;
    if (dniRef.current) dniRef.current.value = user.user_dni;
    if (passwordRef.current) passwordRef.current.value = "";
    setSelectedRole(user.user_role);
    setSelectedCompany(user.company_id.toString());
    setIsUserSheetOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      const formData = {
        user_complete_name: nameRef.current?.value.trim() || "",
        user_email: emailRef.current?.value.trim() || "",
        user_phone: phoneRef.current?.value.trim() || "",
        user_dni: dniRef.current?.value.trim() || "",
        user_role: selectedRole || "",
        company_id: parseInt(selectedCompany) || 0,
        user_password: passwordRef.current?.value.trim() || ""
      };

      const camposFaltantes: string[] = [];

      if (!formData.user_complete_name) {
        camposFaltantes.push("Nombre completo");
      }
      if (!formData.user_dni) {
        camposFaltantes.push("DNI");
      }
      if (!formData.user_phone) {
        camposFaltantes.push("Teléfono");
      }
      if (!formData.user_email) {
        camposFaltantes.push("Email");
      }
      if (!formData.user_role) {
        camposFaltantes.push("Rol");
      }
      if (!formData.company_id || formData.company_id === 0) {
        camposFaltantes.push("Empresa");
      }

      if (!isEditing && !formData.user_password) {
        camposFaltantes.push("Contraseña");
      }

      if (camposFaltantes.length > 0) {
        toast.error(`Por favor completa los siguientes campos: ${camposFaltantes.join(", ")}`);
        return;
      }

      if (isEditing && editingUser) {
        const url = SUPER_API.USERS_EDIT.replace('{id}', editingUser.user_id.toString());
        const editData: Record<string, unknown> = { ...formData };
        if (!editData.user_password || editData.user_password === "") {
          delete editData.user_password;
        }
        await apiClient.put(url, editData);
        toast.success("Usuario actualizado correctamente");
      } else {
        await apiClient.post(SUPER_API.USERS_CREATE, formData);
        toast.success("Usuario creado correctamente");
      }

      setIsUserSheetOpen(false);
      setEditingUser(null);
      fetchUsuarios();
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

  const handleDniChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const dni = e.target.value;
    if (!isEditing && passwordRef.current && dni.length >= 4) {
      const lastFourDigits = dni.slice(-4);
      passwordRef.current.value = `Fast${lastFourDigits}`;
    }
  }, [isEditing]);

  const handleRoleChange = useCallback((value: string) => {
    setSelectedRole(value);
  }, []);

  const handleCompanyChange = useCallback((value: string) => {
    setSelectedCompany(value);
  }, []);

  const empresasUnicas = useMemo(() => {
    return Array.from(new Set(usuarios.map(u => u.company_nombre).filter(Boolean))).sort();
  }, [usuarios]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start md:items-center justify-start  md:justify-between flex-col md:flex-row gap-2 ">
            <div>
              <CardTitle className="text-2xl">Gestión de Usuarios</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 text-balance">
                Gestiona todos los usuarios del sistema
              </p>
            </div>
            <div className="flex flex-col items-start md:items-center md:flex-row md:gap-2 gap-1">
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {filteredUsuarios.length} de {usuarios.length}
              </Badge>
              <div className="flex gap-2 items-center">
                <Button onClick={handleCreateUser}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Usuario
                </Button>
                <Button onClick={fetchUsuarios} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
                            title="Restaurar usuario"
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

      <Sheet open={isUserSheetOpen} onOpenChange={setIsUserSheetOpen} key={`${isEditing}-${editingUser?.user_id || 'new'}`}>
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
              <label className="text-sm font-medium">Nombre completo <span className="text-red-500">*</span></label>
              <Input
                key={`name-${editingUser?.user_id || 'new'}`}
                ref={nameRef}
                defaultValue={isEditing && editingUser ? editingUser.user_complete_name : ""}
                placeholder="Ingresa el nombre completo"
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
              <Input
                key={`email-${editingUser?.user_id || 'new'}`}
                ref={emailRef}
                type="email"
                defaultValue={isEditing && editingUser ? editingUser.user_email : ""}
                placeholder="usuario@empresa.com"
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Teléfono <span className="text-red-500">*</span></label>
              <Input
                key={`phone-${editingUser?.user_id || 'new'}`}
                ref={phoneRef}
                defaultValue={isEditing && editingUser ? editingUser.user_phone : ""}
                placeholder="+54 9 11 1234-5678"
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">DNI <span className="text-red-500">*</span></label>
              <Input
                key={`dni-${editingUser?.user_id || 'new'}`}
                ref={dniRef}
                defaultValue={isEditing && editingUser ? editingUser.user_dni : ""}
                onChange={handleDniChange}
                placeholder="12345678"
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Rol <span className="text-red-500">*</span></label>
              <Select value={selectedRole} onValueChange={handleRoleChange}>
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
              <label className="text-sm font-medium">Empresa <span className="text-red-500">*</span></label>
              <Select value={selectedCompany} onValueChange={handleCompanyChange}>
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
                Contraseña {isEditing ? "(opcional)" : ""}
                {!isEditing ? <span className="text-red-500">*</span> : ""}
              </label>
              <Input
                key={`password-${editingUser?.user_id || 'new'}`}
                ref={passwordRef}
                type="text"
                defaultValue=""
                placeholder={isEditing ? "Dejar vacío para mantener la contraseña actual" : "Ingresa la contraseña"}
                className="mt-1"
                required={!isEditing}
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

      <Sheet open={isPasswordSheetOpen} onOpenChange={setIsPasswordSheetOpen}>
        <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>Restaurar usuario</SheetTitle>
            <SheetDescription>
              Cambiar la contraseña para {selectedUser?.user_complete_name} y desbloquearlo automaticamente
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-0">
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