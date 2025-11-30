"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { API_ROUTES } from "@/lib/api_routes";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/hooks/users/useUsers";
import { useUserFilters } from "@/hooks/users/useUserFilters";
import { useUserPagination } from "@/hooks/users/useUserPagination";
import { UserTable } from "./shared/UserTable";
import { UserFilters } from "./shared/UserFilters";
import { UserPagination } from "./shared/UserPagination";
import { UserForm } from "./shared/UserForm";
import { UserPasswordSheet } from "./shared/UserPasswordSheet";
import { User, UserStatus } from "@/types/users";
import { validateUserForm } from "@/lib/utils/userValidation";

interface CompanyData {
  company_id: number;
  company_nombre: string;
}

export function SuperadminUsuariosPage() {
  const { user: currentUser } = useAuth();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isUserSheetOpen, setIsUserSheetOpen] = useState(false);
  const [isPasswordSheetOpen, setIsPasswordSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { users, isLoading, fetchUsers, toggleUserStatus, changePassword, createUser, updateUser } = useUsers({
    excludeCurrentUser: true,
    currentUserId: currentUser?.user_id,
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await apiClient.get(API_ROUTES.GET_COMPANIES);
        setCompanies(response.data);
      } catch (error) {
        console.error("Error al cargar empresas:", error);
      }
    };
    fetchCompanies();
  }, []);

  const usersWithCompanyNames = users.map((user) => {
    if (user.user_role === "superadmin") {
      return { ...user, company_nombre: "N/A" };
    }
    const company = companies.find((c) => c.company_id === user.company_id);
    return {
      ...user,
      company_nombre: company?.company_nombre || "Empresa no encontrada",
    };
  });

  const { filteredUsers } = useUserFilters({
    users: usersWithCompanyNames,
    searchTerm,
    filterRole,
    filterStatus,
    filterCompany,
  });

  const { totalPages, startIndex, endIndex, paginatedUsers } = useUserPagination({
    users: filteredUsers,
    currentPage,
    itemsPerPage,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus, filterCompany]);

  const uniqueCompanies = Array.from(
    new Set(usersWithCompanyNames.map((u) => u.company_nombre).filter(Boolean))
  ).sort();

  const handleCreateUser = () => {
    setIsEditing(false);
    setEditingUser(null);
    setIsUserSheetOpen(true);
  };

  const handleEditUser = (user: User) => {
    setIsEditing(true);
    setEditingUser(user);
    setIsUserSheetOpen(true);
  };

  const handleSaveUser = async (formData: {
    user_complete_name: string;
    user_dni: string;
    user_phone: string;
    user_email: string;
    user_role: string;
    user_password?: string;
    company_id?: number | null;
  }) => {
    const isSuperAdmin = formData.user_role === "superadmin";
    const validation = validateUserForm(formData, isEditing, !isSuperAdmin);

    if (!validation.isValid) {
      if (validation.missingFields.length > 0) {
        toast.error(`Por favor completa los siguientes campos: ${validation.missingFields.join(", ")}`);
      }
      if (validation.errors.length > 0) {
        validation.errors.forEach((error) => toast.error(error));
      }
      return;
    }

    if (isEditing && editingUser) {
      await updateUser(editingUser.user_id, formData);
    } else {
      await createUser(formData);
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: number) => {
    await toggleUserStatus(userId, currentStatus as UserStatus);
  };

  const handleRestore = (user: User) => {
    setSelectedUser(user);
    setIsPasswordSheetOpen(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!selectedUser) return;
    await changePassword(selectedUser.user_id, password);
    await fetchUsers();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start md:items-center justify-start md:justify-between flex-col md:flex-row gap-2">
            <div>
              <CardTitle className="text-2xl">Gestión de Usuarios</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 text-balance">
                Gestiona todos los usuarios del sistema
              </p>
            </div>
            <div className="flex flex-col items-start md:items-center md:flex-row md:gap-2 gap-1">
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {filteredUsers.length} de {users.length}
              </Badge>
              <div className="flex gap-2 items-center">
                <Button onClick={handleCreateUser}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Usuario
                </Button>
                <Button onClick={fetchUsers} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UserFilters
            searchTerm={searchTerm}
            filterRole={filterRole}
            filterStatus={filterStatus}
            filterCompany={filterCompany}
            uniqueCompanies={uniqueCompanies}
            companies={companies}
            onSearchChange={setSearchTerm}
            onRoleChange={setFilterRole}
            onStatusChange={setFilterStatus}
            onCompanyChange={setFilterCompany}
            allowedRoles={["superadmin", "owner", "operador", "profesional"]}
            showCompanyFilter={true}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm || filterRole !== "all" || filterStatus !== "all" || filterCompany !== "all"
                ? "No se encontraron usuarios que coincidan con los filtros"
                : "No hay usuarios"}
            </div>
          ) : (
            <>
              <UserTable
                users={paginatedUsers}
                onEdit={handleEditUser}
                onToggleStatus={handleToggleStatus}
                onRestore={handleRestore}
                showCompany={true}
                currentUserRole={currentUser?.user_role}
                allowedActions={{ edit: true, toggleStatus: true, restore: true }}
              />
              <UserPagination
                currentPage={currentPage}
                totalPages={totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={filteredUsers.length}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <UserForm
        open={isUserSheetOpen}
        onOpenChange={setIsUserSheetOpen}
        editingUser={editingUser}
        isEditing={isEditing}
        companies={companies}
        currentUserRole={currentUser?.user_role}
        onSubmit={handleSaveUser}
      />

      <UserPasswordSheet
        open={isPasswordSheetOpen}
        onOpenChange={setIsPasswordSheetOpen}
        user={selectedUser}
        onConfirm={handlePasswordConfirm}
      />
    </>
  );
}
