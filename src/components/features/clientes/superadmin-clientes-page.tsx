"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Building, Users, UserCheck, UserX, TrendingUp, TrendingDown } from "lucide-react"
import axios from "axios"
import { config } from "@/lib/config"
import { SUPER_API } from "@/lib/superApi/config"


interface ClienteRecurrente {
  cliente_id: number
  cliente_complete_name: string
  cliente_dni: string
  cliente_phone: string
  cliente_email: string
  cliente_direccion: string
  cliente_lat?: number
  cliente_lng?: number
  cliente_active: boolean
  company_name?: string
  company_id?: number
  total_reclamos?: number
  ultimo_reclamo?: string
}

interface EmpresaStats {
  company_id: number
  company_name: string
  total_clientes: number
  clientes_activos: number
  clientes_inactivos: number
  porcentaje_activos: number
  total_reclamos: number
}

export function SuperadminClientesPage() {
  const [clientes, setClientes] = useState<ClienteRecurrente[]>([])
  const [empresasStats, setEmpresasStats] = useState<EmpresaStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // configurar cliente api
  const apiClient = axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // cargar clientes recurrentes
  const loadClientes = async () => {
    try {
      setIsLoading(true)

      // cargar clientes y empresas en paralelo
      const [clientesResponse, empresasResponse] = await Promise.all([
        apiClient.get(SUPER_API.GET_CLIENTES),
        apiClient.get(SUPER_API.GET_COMPANIES)
      ])

      const clientesData = clientesResponse.data || []
      const empresasData = empresasResponse.data || []


      setClientes(clientesData)

      // crear mapa de empresas por id
      const empresasMap = new Map<number, string>()
      empresasData.forEach((empresa: { company_id: number; company_nombre: string }) => {
        empresasMap.set(empresa.company_id, empresa.company_nombre)
      })

      // agrupar clientes por empresa usando company_id
      const empresaMap = new Map<number, ClienteRecurrente[]>()

      clientesData.forEach((cliente: ClienteRecurrente) => {


        // solo incluir clientes que tengan company_id
        if (cliente.company_id) {
          if (!empresaMap.has(cliente.company_id)) {
            empresaMap.set(cliente.company_id, [])
          }
          empresaMap.get(cliente.company_id)!.push(cliente)
        }
      })

      // calcular estadisticas por empresa
      const statsArray: EmpresaStats[] = Array.from(empresaMap.entries()).map(([companyId, clientesEmpresa]) => {
        const activos = clientesEmpresa.filter(c => c.cliente_active).length
        const inactivos = clientesEmpresa.filter(c => !c.cliente_active).length
        const totalReclamos = clientesEmpresa.reduce((sum, c) => sum + (c.total_reclamos || 0), 0)

        return {
          company_id: companyId,
          company_name: empresasMap.get(companyId) || `Empresa ${companyId}`,
          total_clientes: clientesEmpresa.length,
          clientes_activos: activos,
          clientes_inactivos: inactivos,
          porcentaje_activos: clientesEmpresa.length > 0 ? Math.round((activos / clientesEmpresa.length) * 100) : 0,
          total_reclamos: totalReclamos
        }
      })

      // ordenar por numero de clientes (descendente)
      statsArray.sort((a, b) => b.total_clientes - a.total_clientes)

      setEmpresasStats(statsArray)
    } catch (error: unknown) {
      console.error("Error al cargar clientes:", error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown } }
        console.error("Error details:", axiosError.response?.data)
      }
      toast.error("Error al cargar los clientes recurrentes")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadClientes()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando clientes recurrentes...</p>
        </div>
      </div>
    )
  }

  return (
    <Card>
      {/* Estadísticas generales */}
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-2xl">Clientes por empresa</CardTitle>

        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {clientes.filter(c => c.cliente_active).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">
                {clientes.filter(c => !c.cliente_active).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {empresasStats.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards por empresa */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empresasStats.map((empresa) => (
            <Card key={empresa.company_id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold truncate">
                    {empresa.company_name}
                  </CardTitle>
                  <Building className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Estadísticas principales */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {empresa.clientes_activos}
                    </div>
                    <div className="text-xs text-muted-foreground">Activos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-muted-foreground">
                      {empresa.clientes_inactivos}
                    </div>
                    <div className="text-xs text-muted-foreground">Inactivos</div>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Proporción activos</span>
                    <span className="font-medium">{empresa.porcentaje_activos}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${empresa.porcentaje_activos}%` }}
                    ></div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total clientes:</span>
                    <span className="font-medium">{empresa.total_clientes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total reclamos:</span>
                    <span className="font-medium">{empresa.total_reclamos}</span>
                  </div>
                </div>

                {/* Badge de estado */}
                <div className="flex justify-center">
                  {empresa.porcentaje_activos >= 80 ? (
                    <Badge variant="default" className="bg-green-500">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Excelente
                    </Badge>
                  ) : empresa.porcentaje_activos >= 60 ? (
                    <Badge variant="default" className="bg-blue-500">
                      Bueno
                    </Badge>
                  ) : empresa.porcentaje_activos >= 40 ? (
                    <Badge variant="default" className="bg-yellow-500">
                      Regular
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-red-500">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Bajo
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensaje si no hay datos */}
        {empresasStats.length === 0 && !isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Building className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay clientes recurrentes</h3>
              <p className="text-muted-foreground text-center">
                No se encontraron clientes recurrentes para mostrar estadísticas por empresa.
              </p>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Total de clientes cargados: {clientes.length}</p>
                <p>Empresas encontradas: {empresasStats.length}</p>
                <p>Clientes con company_id: {clientes.filter(c => c.company_id).length}</p>
                <p>Clientes sin company_id: {clientes.filter(c => !c.company_id).length}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
