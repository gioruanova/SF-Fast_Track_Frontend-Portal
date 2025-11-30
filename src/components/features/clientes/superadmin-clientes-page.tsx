"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Users, UserCheck, UserX, TrendingUp, TrendingDown } from "lucide-react";
import { useSuperadminClientes } from "@/hooks/clientes/useSuperadminClientes";

export function SuperadminClientesPage() {
  const {  empresasStats, isLoading, stats } = useSuperadminClientes();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando clientes recurrentes...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-2xl">Clientes por empresa</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClientes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {stats.clientesActivos}
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
                {stats.clientesInactivos}
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
                {stats.totalEmpresas}
              </div>
            </CardContent>
          </Card>
        </div>

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

        {empresasStats.length === 0 && !isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Building className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay clientes recurrentes</h3>
              <p className="text-muted-foreground text-center">
                No se encontraron clientes recurrentes para mostrar estadísticas por empresa.
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
