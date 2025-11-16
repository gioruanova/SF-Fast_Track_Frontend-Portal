"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Search, Plus, Edit, X, ChevronLeft, ChevronRight, Mail, UserX, UserCheck } from "lucide-react"
import axios from "axios"
import { config } from "@/lib/config"
import { CLIENT_API } from "@/lib/clientApi/config"
import { useAuth } from "@/context/AuthContext"

interface Cliente {
  cliente_id: number
  cliente_complete_name: string
  cliente_dni: string
  cliente_phone: string
  cliente_email: string
  cliente_direccion: string
  cliente_lat?: number
  cliente_lng?: number
  cliente_active: boolean

}

interface ClientesPageProps {
  userRole: "owner" | "operador"
}

export function ClientesPage({}: ClientesPageProps) {
  const { companyConfig } = useAuth()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const apiClient = axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const [isClienteSheetOpen, setIsClienteSheetOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)

  const [clienteFormData, setClienteFormData] = useState({
    cliente_complete_name: "",
    cliente_dni: "",
    cliente_phone: "",
    cliente_email: "",
    cliente_direccion: ""
  })


  const fetchClientes = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get(CLIENT_API.GET_CLIENTES)
      setClientes(response.data || [])
    } catch (error) {
      console.error("Error al cargar clientes:", error)
      toast.error("Error al cargar clientes")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateCliente = () => {
    setIsEditing(false)
    setEditingCliente(null)
    setClienteFormData({
      cliente_complete_name: "",
      cliente_dni: "",
      cliente_phone: "",
      cliente_email: "",
      cliente_direccion: ""
    })
    setIsClienteSheetOpen(true)
  }

  const handleEditCliente = (cliente: Cliente) => {
    setIsEditing(true)
    setEditingCliente(cliente)
    setClienteFormData({
      cliente_complete_name: cliente.cliente_complete_name,
      cliente_dni: cliente.cliente_dni,
      cliente_phone: cliente.cliente_phone,
      cliente_email: cliente.cliente_email,
      cliente_direccion: cliente.cliente_direccion
    })
    setIsClienteSheetOpen(true)
  }

  const handleSaveCliente = async () => {
    if (!clienteFormData.cliente_complete_name ||
      !clienteFormData.cliente_dni ||
      !clienteFormData.cliente_phone ||
      !clienteFormData.cliente_email) {
      toast.error("Los campos nombre, DNI, teléfono y email son obligatorios")
      return
    }

    if (companyConfig?.requiere_domicilio) {
      if (!clienteFormData.cliente_direccion.trim()) {
        toast.error("La dirección es obligatoria")
        return
      }
    }

    try {
      if (isEditing && editingCliente) {
        const updateData: Partial<typeof clienteFormData> = {}

        if (clienteFormData.cliente_complete_name !== editingCliente.cliente_complete_name) {
          updateData.cliente_complete_name = clienteFormData.cliente_complete_name
        }
        if (clienteFormData.cliente_dni !== editingCliente.cliente_dni) {
          updateData.cliente_dni = clienteFormData.cliente_dni
        }
        if (clienteFormData.cliente_phone !== editingCliente.cliente_phone) {
          updateData.cliente_phone = clienteFormData.cliente_phone
        }
        if (clienteFormData.cliente_email !== editingCliente.cliente_email) {
          updateData.cliente_email = clienteFormData.cliente_email
        }
        if (clienteFormData.cliente_direccion !== editingCliente.cliente_direccion) {
          updateData.cliente_direccion = clienteFormData.cliente_direccion
        }

        if (Object.keys(updateData).length > 0) {
          await apiClient.put(CLIENT_API.UPDATE_CLIENTE.replace('{cliente_id}', editingCliente.cliente_id.toString()), updateData)
          toast.success(`${companyConfig?.sing_heading_solicitante} actualizado correctamente`)
        } else {
          toast.info("No se detectaron cambios para actualizar")
        }
      } else {
        await apiClient.post(CLIENT_API.CREATE_CLIENTE, clienteFormData)
        toast.success(`${companyConfig?.sing_heading_solicitante} creado correctamente`)
      }

      setIsClienteSheetOpen(false)
      setEditingCliente(null)
      setIsEditing(false)
      fetchClientes()
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { error?: string }; status?: number }; message?: string })?.response?.data?.error ||
        (error as { message?: string })?.message ||
        `Error al guardar el ${companyConfig?.sing_heading_solicitante?.toLowerCase()}`
      toast.error(errorMessage)
    }
  }

  const handleToggleClienteStatus = async (cliente: Cliente) => {
    try {
      if (cliente.cliente_active) {
        await apiClient.put(CLIENT_API.DESACTIVAR_CLIENTE.replace('{cliente_id}', cliente.cliente_id.toString()))
        toast.success(`${companyConfig?.sing_heading_solicitante} desactivado correctamente`)
      } else {
        await apiClient.put(CLIENT_API.ACTIVAR_CLIENTE.replace('{cliente_id}', cliente.cliente_id.toString()))
        toast.success(`${companyConfig?.sing_heading_solicitante} activado correctamente`)
      }

      fetchClientes()
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { error?: string }; status?: number }; message?: string })?.response?.data?.error ||
        (error as { message?: string })?.message ||
        `Error al cambiar el estado del ${companyConfig?.sing_heading_solicitante?.toLowerCase()}`
      toast.error(errorMessage)
    }
  }

  const getStatusBadge = (active: boolean) => {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap uppercase ${active
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
      >
        {active ? 'Activo' : 'Inactivo'}
      </span>
    )
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = cliente.cliente_complete_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cliente_dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cliente_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cliente_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cliente_direccion.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedClientes = filteredClientes.slice(startIndex, endIndex)

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
                      {companyConfig?.requiere_domicilio === 1 ? (
                        <TableCell title={cliente.cliente_direccion}>
                          {cliente.cliente_direccion.length > 20
                            ? `${cliente.cliente_direccion.substring(0, 20)}...`
                            : cliente.cliente_direccion}
                        </TableCell>
                      ):(
                        null
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
                            className={cliente.cliente_active ? "text-red-600" : "text-green-600"}
                            title={cliente.cliente_active ? `Desactivar ${companyConfig?.sing_heading_solicitante?.toLowerCase()}` : `Activar ${companyConfig?.sing_heading_solicitante?.toLowerCase()}`}
                          >
                            {cliente.cliente_active ? (
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
                value={clienteFormData.cliente_complete_name}
                onChange={(e) => setClienteFormData(prev => ({ ...prev, cliente_complete_name: e.target.value }))}
                placeholder={`Nombre completo del ${companyConfig?.sing_heading_solicitante?.toLowerCase()}`}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dni">DNI/CUIT<span className="text-red-500">*</span></Label>
              <Input
                id="dni"
                value={clienteFormData.cliente_dni}
                onChange={(e) => setClienteFormData(prev => ({ ...prev, cliente_dni: e.target.value }))}
                placeholder={`DNI del ${companyConfig?.sing_heading_solicitante?.toLowerCase()}`}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono<span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                value={clienteFormData.cliente_phone}
                onChange={(e) => setClienteFormData(prev => ({ ...prev, cliente_phone: e.target.value }))}
                placeholder={`Teléfono del ${companyConfig?.sing_heading_solicitante?.toLowerCase()}`}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email<span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={clienteFormData.cliente_email}
                onChange={(e) => setClienteFormData(prev => ({ ...prev, cliente_email: e.target.value }))}
                placeholder={`Email del ${companyConfig?.sing_heading_solicitante?.toLowerCase()}`}
                required
              />
            </div>
            {
              companyConfig?.requiere_domicilio === 1 ? (
                <div className="space-y-2">
                  <Label htmlFor="direccion">
                    Dirección {companyConfig?.requiere_domicilio ? <span className="text-red-500">*</span> : <span className="text-muted-foreground">(opcional)</span>}
                  </Label>
                  <Input
                    id="direccion"
                    value={clienteFormData.cliente_direccion}
                    onChange={(e) => setClienteFormData(prev => ({ ...prev, cliente_direccion: e.target.value }))}
                    placeholder={
                      companyConfig?.requiere_domicilio
                        ? `Dirección del ${companyConfig?.sing_heading_solicitante?.toLowerCase()}`
                        : `Dirección del ${companyConfig?.sing_heading_solicitante?.toLowerCase()} (opcional)`
                    }
                    required={!!companyConfig?.requiere_domicilio}
                  />
                </div>
              ) : (
                null
              )
            }
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
  )
}
