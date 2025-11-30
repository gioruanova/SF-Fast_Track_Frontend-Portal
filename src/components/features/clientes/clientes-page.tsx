"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, X, ChevronLeft, ChevronRight, Mail, UserX, UserCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { ARGENTINA_PROVINCIAS } from "@/lib/constants";
import { useClientes } from "@/hooks/clientes/useClientes";
import { useClienteForm } from "@/hooks/clientes/useClienteForm";
import { ClienteRecurrente } from "@/types/clientes";
import { toast } from "sonner";

interface ClientesPageProps {
  userRole: "owner" | "operador";
}

export function ClientesPage({}: ClientesPageProps) {
  const { companyConfig } = useAuth();
  const { clientes, isLoading, createCliente, updateCliente, toggleClienteStatus } = useClientes();
  const {
    formData,
    setFormData,
    direccionFields,
    setDireccionFields,
    resetForm,
    loadClienteData,
    validateForm,
    buildCreateData,
    buildUpdateData,
  } = useClienteForm();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isClienteSheetOpen, setIsClienteSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCliente, setEditingCliente] = useState<ClienteRecurrente | null>(null);

  const handleCreateCliente = () => {
    setIsEditing(false);
    setEditingCliente(null);
    resetForm();
    setIsClienteSheetOpen(true);
  };

  const handleEditCliente = (cliente: ClienteRecurrente) => {
    setIsEditing(true);
    setEditingCliente(cliente);
    loadClienteData(cliente);
    setIsClienteSheetOpen(true);
  };

  const handleSaveCliente = async () => {
    const validationError = validateForm(isEditing);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (isEditing && editingCliente) {
      const updateData = buildUpdateData(editingCliente);
      
      if (Object.keys(updateData).length === 0) {
        toast.info("No se detectaron cambios para actualizar");
        return;
      }

      const success = await updateCliente(editingCliente.cliente_id, updateData);
      if (success) {
        setIsClienteSheetOpen(false);
        setEditingCliente(null);
        setIsEditing(false);
        resetForm();
      }
    } else {
      const createData = buildCreateData();
      const success = await createCliente(createData);
      if (success) {
        setIsClienteSheetOpen(false);
        resetForm();
      }
    }
  };

  const handleToggleClienteStatus = async (cliente: ClienteRecurrente) => {
    const isActive = cliente.cliente_active === 1;
    await toggleClienteStatus(cliente.cliente_id, isActive);
  };

  const getStatusBadge = (active: number) => {
    const isActive = active === 1;
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap uppercase ${
          isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}
      >
        {isActive ? 'Activo' : 'Inactivo'}
      </span>
    );
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente => {
      const searchLower = searchTerm.toLowerCase();
      return (
        cliente.cliente_complete_name.toLowerCase().includes(searchLower) ||
        (cliente.cliente_dni || "").toLowerCase().includes(searchLower) ||
        (cliente.cliente_phone || "").toLowerCase().includes(searchLower) ||
        (cliente.cliente_email || "").toLowerCase().includes(searchLower) ||
        (cliente.cliente_direccion || "").toLowerCase().includes(searchLower)
      );
    });
  }, [clientes, searchTerm]);

  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClientes = filteredClientes.slice(startIndex, endIndex);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-2 md:gap-0">
            <div>
              <CardTitle className="text-2xl">Gestión de {companyConfig?.plu_heading_solicitante}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 text-balance">
                Gestiona los {companyConfig?.plu_heading_solicitante} recurrentes de tu empresa
              </p>
            </div>
            <div className="flex flex-col items-start md:items-center md:flex-row md:gap-2 gap-1">
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {filteredClientes.length} de {clientes.length}
              </Badge>
              <Button onClick={handleCreateCliente}>
                <Plus className="h-4 w-4 mr-2" />
                Crear {companyConfig?.sing_heading_solicitante}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, DNI, teléfono, email o dirección..."
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
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando {companyConfig?.sing_heading_solicitante?.toLowerCase()}...</p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefono</TableHead>
                    {companyConfig?.requiere_domicilio === 1 ? <TableHead>Dirección</TableHead> : null}
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedClientes.map((cliente) => (
                    <TableRow key={cliente.cliente_id}>
                      <TableCell className="font-medium">
                        {cliente.cliente_complete_name}
                      </TableCell>

                      <TableCell>
                        <a
                          href={`mailto:${cliente.cliente_email}`}
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <Mail className="h-4 w-4" />
                          {cliente.cliente_email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <a href={`tel:${cliente.cliente_phone}`} className="text-primary hover:underline">{cliente.cliente_phone}</a>
                      </TableCell>
                      {companyConfig?.requiere_domicilio === 1 && (
                        <TableCell title={cliente.cliente_direccion}>
                          {cliente.cliente_direccion && cliente.cliente_direccion.length > 20
                            ? `${cliente.cliente_direccion.substring(0, 20)}...`
                            : cliente.cliente_direccion}
                        </TableCell>
                      )}
                      
                      <TableCell className="text-center">{getStatusBadge(cliente.cliente_active)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCliente(cliente)}
                            title={`Editar ${companyConfig?.sing_heading_solicitante?.toLowerCase()}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleClienteStatus(cliente)}
                            className={cliente.cliente_active === 1 ? "text-red-600" : "text-green-600"}
                            title={cliente.cliente_active === 1 ? `Desactivar ${companyConfig?.sing_heading_solicitante?.toLowerCase()}` : `Activar ${companyConfig?.sing_heading_solicitante?.toLowerCase()}`}
                          >
                            {cliente.cliente_active === 1 ? (
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

              <div className="flex flex-col gap-4 mt-4">
                <div className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, filteredClientes.length)} de {filteredClientes.length} {companyConfig?.plu_heading_solicitante?.toLowerCase()}
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

      <Sheet open={isClienteSheetOpen} onOpenChange={setIsClienteSheetOpen}>
        <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? `Editar ${companyConfig?.sing_heading_solicitante}` : `Agregar ${companyConfig?.sing_heading_solicitante}`}
            </SheetTitle>
            <SheetDescription>
              {isEditing ? `Modifica la información del ${companyConfig?.sing_heading_solicitante?.toLowerCase()}` : `Completa la información para crear un nuevo ${companyConfig?.sing_heading_solicitante?.toLowerCase()}`}
            </SheetDescription>
          </SheetHeader>
          <Separator />
          <div className="mt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="complete_name">Nombre Completo *</Label>
              <Input
                id="complete_name"
                value={formData.cliente_complete_name}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente_complete_name: e.target.value }))}
                placeholder={`Nombre completo del ${companyConfig?.sing_heading_solicitante?.toLowerCase()}`}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dni">DNI/CUIT<span className="text-red-500">*</span></Label>
              <Input
                id="dni"
                value={formData.cliente_dni}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente_dni: e.target.value }))}
                placeholder={`DNI del ${companyConfig?.sing_heading_solicitante?.toLowerCase()}`}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono<span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                value={formData.cliente_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente_phone: e.target.value }))}
                placeholder={`Teléfono del ${companyConfig?.sing_heading_solicitante?.toLowerCase()}`}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email<span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={formData.cliente_email}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente_email: e.target.value }))}
                placeholder={`Email del ${companyConfig?.sing_heading_solicitante?.toLowerCase()}`}
                required
              />
            </div>
            {companyConfig?.requiere_domicilio === 1 && (
              <div className="space-y-4 border-t pt-4">
                <Label className="text-base font-semibold">
                  Dirección <span className="text-red-500">*</span>
                </Label>
                
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      id="direccion"
                      value={formData.cliente_direccion || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, cliente_direccion: e.target.value }))}
                      placeholder={`Dirección del ${companyConfig?.sing_heading_solicitante?.toLowerCase()}`}
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="calle">
                          Calle <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="calle"
                          value={direccionFields.calle}
                          onChange={(e) => setDireccionFields(prev => ({ ...prev, calle: e.target.value }))}
                          placeholder="Ej: Av. Corrientes"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="numero">
                          Número <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="numero"
                          value={direccionFields.numero}
                          onChange={(e) => setDireccionFields(prev => ({ ...prev, numero: e.target.value }))}
                          placeholder="Ej: 1234"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ciudad">
                          Ciudad <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="ciudad"
                          value={direccionFields.ciudad}
                          onChange={(e) => setDireccionFields(prev => ({ ...prev, ciudad: e.target.value }))}
                          placeholder="Ej: Buenos Aires"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="codigo_postal">
                          Código Postal <span className="text-muted-foreground text-xs">(opcional)</span>
                        </Label>
                        <Input
                          id="codigo_postal"
                          value={direccionFields.codigo_postal}
                          onChange={(e) => setDireccionFields(prev => ({ ...prev, codigo_postal: e.target.value }))}
                          placeholder="Ej: C1000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="provincia">
                        Provincia <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={direccionFields.provincia || undefined}
                        onValueChange={(value) => setDireccionFields(prev => ({ ...prev, provincia: value }))}
                      >
                        <SelectTrigger id="provincia" className="cursor-pointer w-full">
                          <SelectValue placeholder="Seleccionar Provincia" />
                        </SelectTrigger>
                        <SelectContent className="cursor-pointer">
                          {ARGENTINA_PROVINCIAS.map((provincia) => (
                            <SelectItem key={provincia.value} value={provincia.label} className="cursor-pointer">
                              {provincia.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsClienteSheetOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveCliente} className="flex-1">
                {isEditing ? "Guardar Cambios" : `Crear ${companyConfig?.sing_heading_solicitante}`}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
