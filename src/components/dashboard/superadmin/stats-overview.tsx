"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell, Label } from "recharts";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSuperadminStats } from "@/hooks/superadmin/useSuperadminStats";

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

export function StatsOverview() {
  const { users, companies, especialidades, clientes, isLoading } = useSuperadminStats();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeCompanies = companies.filter(c => c.company_estado === 1).length;
  const inactiveCompanies = companies.filter(c => c.company_estado === 0).length;
  const totalCompanies = companies.length;

  const nonSuperAdminUsers = users.filter(u => u.user_role !== "superadmin");

  const ownerUsers = nonSuperAdminUsers.filter(u => u.user_role === "owner").length;
  const operadorUsers = nonSuperAdminUsers.filter(u => u.user_role === "operador").length;
  const profesionalUsers = nonSuperAdminUsers.filter(u => u.user_role === "profesional").length;

  const activeClientes = clientes.filter(c => c.cliente_active === 1).length;
  const inactiveClientes = clientes.filter(c => c.cliente_active === 0).length;
  const totalClientes = clientes.length;

  const companyStatusData = [
    { name: "Activas", value: activeCompanies, fill: "#10b981" },
    { name: "Inactivas", value: inactiveCompanies, fill: "#ef4444" },
  ];

  const rolesData = [
    { name: "Owners", value: ownerUsers, fill: "#8b5cf6" },
    { name: "Operadores", value: operadorUsers, fill: "#3b82f6" },
    { name: "Profesionales", value: profesionalUsers, fill: "#f59e0b" },
  ];

  const clientesData = [
    { name: "Activos", value: activeClientes, fill: "#10b981" },
    { name: "Inactivos", value: inactiveClientes, fill: "#ef4444" },
  ];

  const especialidadesGrouped = especialidades.reduce((acc, esp) => {
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

  const especialidadesData = especialidadesGrouped;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-64"></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
                <ChevronDown className="h-4 w-4 mr-0" />
                Expandir
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4 mr-0" />
                Colapsar
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Estado de Empresas</CardTitle>
                <CardDescription>Activas vs Inactivas</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-4">
                <ChartContainer
                  config={{
                    activas: { label: "Activas", color: "#10b981" },
                    inactivas: { label: "Inactivas", color: "#ef4444" },
                  }}
                  className="aspect-square w-full max-w-[250px]"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={companyStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {companyStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                  {totalCompanies}
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
              <CardHeader className="pb-2">
                <CardTitle>Usuarios por Rol</CardTitle>
                <CardDescription>Distribución de roles</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-4">
                <ChartContainer
                  config={{
                    owners: { label: "Owners", color: "#8b5cf6" },
                    operadores: { label: "Operadores", color: "#3b82f6" },
                    profesionales: { label: "Profesionales", color: "#f59e0b" },
                  }}
                  className="aspect-square w-full max-w-[250px]"
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
              <CardHeader className="pb-2">
                <CardTitle>Clientes Activos</CardTitle>
                <CardDescription>Activos vs Inactivos</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-4">
                <ChartContainer
                  config={{
                    activos: { label: "Activos", color: "#10b981" },
                    inactivos: { label: "Inactivos", color: "#ef4444" },
                  }}
                  className="aspect-square w-full max-w-[250px]"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={clientesData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {clientesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                  {totalClientes}
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
              <CardHeader className="pb-2">
                <CardTitle>Especialidades</CardTitle>
                <CardDescription>Por nombre</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-4">
                <ChartContainer
                  config={especialidadesGrouped.reduce((acc, esp) => {
                    acc[esp.name.toLowerCase()] = {
                      label: esp.name,
                      color: esp.fill,
                    };
                    return acc;
                  }, {} as ChartConfig)}
                  className="aspect-square w-full max-w-[250px]"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={especialidadesData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {especialidadesData.map((entry, index) => (
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
