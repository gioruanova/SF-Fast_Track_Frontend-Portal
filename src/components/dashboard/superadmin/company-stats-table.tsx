"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSuperadminStats } from "@/hooks/superadmin/useSuperadminStats";

export function CompanyStatsTable() {
  const { companyStats, isLoading } = useSuperadminStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="h-16 bg-muted/50 animate-pulse"></CardHeader>
        <CardContent className="h-64 bg-muted/30 animate-pulse"></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Estadísticas por Empresa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Empresa</TableHead>
                <TableHead className="w-[150px] text-center">Operadores Activos</TableHead>
                <TableHead className="w-[150px] text-center">Profesionales Activos</TableHead>
                <TableHead className="w-[150px] text-center">Clientes Activos</TableHead>
                <TableHead className="w-[150px] text-center">Especialidades</TableHead>
                <TableHead className="w-[150px] text-center">Reclamos Abiertos</TableHead>
                <TableHead className="w-[150px] text-center">Reclamos Cerrados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron empresas
                  </TableCell>
                </TableRow>
              ) : (
                companyStats.map((stat) => (
                  <TableRow key={stat.company_id}>
                    <TableCell className="font-medium">
                      {stat.company_nombre}
                    </TableCell>
                    <TableCell className="text-center">
                      {stat.operadores_activos}
                    </TableCell>
                    <TableCell className="text-center">
                      {stat.profesionales_activos}
                    </TableCell>
                    <TableCell className="text-center">
                      {stat.clientes_activos}
                    </TableCell>
                    <TableCell className="text-center">
                      {stat.especialidades}
                    </TableCell>
                    <TableCell className="text-center">
                      {stat.reclamos_abiertos}
                    </TableCell>
                    <TableCell className="text-center">
                      {stat.reclamos_cerrados}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

