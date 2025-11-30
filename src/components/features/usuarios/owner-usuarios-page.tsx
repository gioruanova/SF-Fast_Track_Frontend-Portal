"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/hooks/users/useUsers";
import { useUserFilters } from "@/hooks/users/useUserFilters";
import { useUserPagination } from "@/hooks/users/useUserPagination";
import { UserTable } from "./shared/UserTable";
import { UserFilters } from "./shared/UserFilters";
import { UserPagination } from "./shared/UserPagination";
import { UserForm } from "./shared/UserForm";
import { UserPasswordSheet } from "./shared/UserPasswordSheet";
import { User, UserStatus, USER_ROLES } from "@/types/users";

export function OwnerUsuariosPage() {
  const { companyConfig, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isUserSheetOpen, setIsUserSheetOpen] = useState(false);
  const [isPasswordSheetOpen, setIsPasswordSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { users, isLoading, fetchUsers, toggleUserStatus, changePassword, createUser, updateUser } = useUsers({
    excludeCurrentUser: true,
    currentUserId: user?.user_id,
  });

  const { filteredUsers } = useUserFilters({
    users,
    searchTerm,
    filterRole,
    filterStatus,
    excludeUserId: user?.user_id,
  });

  const { totalPages, startIndex, endIndex, paginatedUsers } = useUserPagination({
    users: filteredUsers,
    currentPage,
    itemsPerPage,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus]);

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
    if (isEditing && editingUser) {
      const updateData = { ...formData };
      delete updateData.company_id;
      await updateUser(editingUser.user_id, updateData);
    } else {
      const userCompanyId = user && 'company_id' in user ? user.company_id : null;
      const createData = { ...formData, company_id: userCompanyId || null };
      await createUser(createData);
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
          <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-2 md:gap-0">
            <div>
              <CardTitle className="text-2xl">Gestión de Usuarios</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 text-balance">
                Gestiona los usuarios de tu empresa ({companyConfig?.plu_heading_operador} y {companyConfig?.plu_heading_profesional})
              </p>
            </div>
            <div className="flex flex-col items-start md:items-center md:flex-row md:gap-2 gap-1">
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {filteredUsers.length} de {users.length}
              </Badge>
              <Button onClick={handleCreateUser}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Usuario
              </Button>
              <Button onClick={fetchUsers} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UserFilters
            searchTerm={searchTerm}
            filterRole={filterRole}
            filterStatus={filterStatus}
            onSearchChange={setSearchTerm}
            onRoleChange={setFilterRole}
            onStatusChange={setFilterStatus}
            allowedRoles={[USER_ROLES.OPERADOR, USER_ROLES.PROFESIONAL]}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando usuarios...</p>
              </div>
            </div>
          ) : (
            <>
              <UserTable
                users={paginatedUsers}
                onEdit={handleEditUser}
                onToggleStatus={handleToggleStatus}
                onRestore={handleRestore}
                showAptoRecibir={true}
                currentUserRole={user?.user_role}
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
        currentUserRole={user?.user_role}
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
