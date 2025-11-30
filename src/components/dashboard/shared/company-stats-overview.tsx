"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell, Label } from "recharts";
import { ChevronDown, ChevronUp, BriefcaseBusiness, SquareCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useReclamos } from "@/hooks/reclamos/useReclamos";
import { useUsers } from "@/hooks/users/useUsers";
import { useClientes } from "@/hooks/clientes/useClientes";
import { useEspecialidades } from "@/hooks/especialidades/useEspecialidades";
import { USER_STATUS } from "@/types/users";

const CHART_COLORS = [
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export function CompanyStatsOverview() {
  const { companyConfig } = useAuth();
  const { reclamos: reclamosData } = useReclamos();
  const { users: allUsers, isLoading: isLoadingUsers } = useUsers();
  const { especialidades, isLoading: isLoadingEspecialidades } = useEspecialidades();
  const { clientes, isLoading: isLoadingClientes } = useClientes();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isLoading = isLoadingUsers || isLoadingEspecialidades || isLoadingClientes;

  const users = useMemo(() => {
    return allUsers.map(u => ({
      user_id: u.user_id,
      user_role: u.user_role,
      user_status: u.user_status
    }));
  }, [allUsers]);

  const activeUsers = useMemo(() => 
    users.filter(u => u.user_status === USER_STATUS.ACTIVO).length
  , [users]);

  const inactiveUsers = useMemo(() => 
    users.filter(u => u.user_status === USER_STATUS.BLOQUEADO).length
  , [users]);

  const totalUsers = users.length;

  const ownerUsers = useMemo(() => 
    users.filter(u => u.user_role === "owner").length
  , [users]);

  const operadorUsers = useMemo(() => 
    users.filter(u => u.user_role === "operador").length
  , [users]);

  const profesionalUsers = useMemo(() => 
    users.filter(u => u.user_role === "profesional").length
  , [users]);

  const statusData = useMemo(() => [
    { name: "Activos", value: activeUsers, fill: "#10b981" },
    { name: "Inactivos", value: inactiveUsers, fill: "#ef4444" },
  ], [activeUsers, inactiveUsers]);

  const rolesData = useMemo(() => [
    { name: `${companyConfig?.plu_heading_owner}`, value: ownerUsers, fill: "#8b5cf6" },
    { name: `${companyConfig?.plu_heading_operador}`, value: operadorUsers, fill: "#3b82f6" },
    { name: `${companyConfig?.plu_heading_profesional}`, value: profesionalUsers, fill: "#f59e0b" },
  ], [companyConfig?.plu_heading_owner, companyConfig?.plu_heading_operador, companyConfig?.plu_heading_profesional, ownerUsers, operadorUsers, profesionalUsers]);

  const especialidadesGrouped = useMemo(() => {
    return especialidades.reduce((acc, esp) => {
      const existing = acc.find(item => item.name === esp.nombre_especialidad);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({
          name: esp.nombre_especialidad,
          value: 1,
          fill: CHART_COLORS[acc.length % CHART_COLORS.length],
        });
      }
      return acc;
    }, [] as Array<{ name: string; value: number; fill: string }>);
  }, [especialidades]);

  const especialidadesChartConfig = useMemo(() => {
    return especialidadesGrouped.reduce((acc, esp) => {
      acc[esp.name.toLowerCase()] = {
        label: esp.name,
        color: esp.fill,
      };
      return acc;
    }, {} as ChartConfig);
  }, [especialidadesGrouped]);

  const totalClientes = clientes.length;
  const totalReclamos = reclamosData.length;
  const reclamosEnActividad = useMemo(() => 
    reclamosData.filter(r => r.reclamo_estado !== "CERRADO" && r.reclamo_estado !== "CANCELADO").length
  , [reclamosData]);
  const reclamosFinalizados = useMemo(() => 
    reclamosData.filter(r => r.reclamo_estado === "CERRADO" || r.reclamo_estado === "CANCELADO").length
  , [reclamosData]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-64"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-muted/50"></CardHeader>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-muted/50"></CardHeader>
              <CardContent className="h-48 bg-muted/30"></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Estadísticas Generales</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Expandir
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Colapsar
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="md:flex gap-1 flex-row md:flex-col justify-between md:justify-start">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 md:pb-2 md:items-start w-[100%] md:w-auto">
                <CardTitle className="text-sm font-medium">{companyConfig?.plu_heading_operador} totales</CardTitle>
                <BriefcaseBusiness className="h-4 w-4 text-muted-foreground md:flex hidden" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClientes}</div>
              </CardContent>
            </Card>

            <Card className="md:flex gap-1 flex-row md:flex-col justify-between md:justify-start">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 md:pb-2  md:items-start w-[100%] md:w-auto">
                <CardTitle className="text-sm font-medium">Total {companyConfig?.plu_heading_reclamos}</CardTitle>
                <SquareCheck className="h-4 w-4 text-muted-foreground md:flex hidden" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalReclamos}</div>
              </CardContent>
            </Card>

            <Card className="md:flex gap-1 flex-row md:flex-col justify-between md:justify-start">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 md:pb-2  md:items-start w-[100%] md:w-auto">
                <CardTitle className="text-sm font-medium">{companyConfig?.plu_heading_reclamos} en curso</CardTitle>
                <SquareCheck className="h-4 w-4 text-muted-foreground md:flex hidden" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{reclamosEnActividad}</div>
              </CardContent>
            </Card>

            <Card className="md:flex gap-1 flex-row md:flex-col justify-between md:justify-start">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 md:pb-2  md:items-start w-[100%] md:w-auto">
                <CardTitle className="text-sm font-medium">Historial de {companyConfig?.plu_heading_reclamos}</CardTitle>
                <SquareCheck className="h-4 w-4 text-muted-foreground md:flex hidden" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{reclamosFinalizados}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Usuarios</CardTitle>
                <CardDescription>Activos vs Inactivos</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-0">
                <ChartContainer
                  config={{
                    activos: { label: "Activos", color: "#10b981" },
                    inactivos: { label: "Inactivos", color: "#ef4444" },
                  }}
                  className="mx-auto aspect-square h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                  {totalUsers}
                                </tspan>
                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                                  Total
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuarios por Rol</CardTitle>
                <CardDescription>Distribución de roles</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-0">
                <ChartContainer
                  config={{
                    owners: { label: "Owners", color: "#8b5cf6" },
                    operadores: { label: "Operadores", color: "#3b82f6" },
                    profesionales: { label: "Profesionales", color: "#f59e0b" },
                  }}
                  className="mx-auto aspect-square h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={rolesData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {rolesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                  {ownerUsers + operadorUsers + profesionalUsers}
                                </tspan>
                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                                  Usuarios
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{companyConfig?.plu_heading_especialidad}</CardTitle>
                <CardDescription>Por nombre</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-0">
                <ChartContainer
                  config={especialidadesChartConfig}
                  className="mx-auto aspect-square h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={especialidadesGrouped}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {especialidadesGrouped.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                  {especialidades.length}
                                </tspan>
                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                                  Total
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

