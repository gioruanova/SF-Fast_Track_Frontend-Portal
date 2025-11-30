"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSuperadminStats } from "@/hooks/superadmin/useSuperadminStats";
import { format, subDays, subMonths, isAfter, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type FilterType = "7d" | "30d" | "3m" | "1y";

const chartConfig = {
  activos: {
    label: "Activos",
    color: "#6366f1",
  },
  finalizados: {
    label: "Finalizados",
    color: "#818cf8",
  },
} satisfies ChartConfig;

export function ReclamosChart() {
  const { reclamos, isLoading } = useSuperadminStats();
  const [filter, setFilter] = useState<FilterType>("1y");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const chartData = useMemo(() => {
    if (!reclamos.length) return [];

    const now = new Date();
    let startDate: Date;

    switch (filter) {
      case "7d":
        startDate = subDays(now, 7);
        break;
      case "30d":
        startDate = subDays(now, 30);
        break;
      case "3m":
        startDate = subMonths(now, 3);
        break;
      case "1y":
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subMonths(now, 1);
    }

    const filteredReclamos = reclamos.filter(r => {
      const reclamoDate = parseISO(r.created_at);
      return isAfter(reclamoDate, startDate);
    });

    const groupedByMonth = filteredReclamos.reduce((acc, reclamo) => {
      const date = parseISO(reclamo.created_at);
      const monthKey = format(date, "yyyy-MM");
      const monthLabel = format(date, "MMM yyyy", { locale: es });

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthLabel,
          monthKey,
          activos: 0,
          finalizados: 0,
        };
      }

      if (reclamo.reclamo_estado === "CERRADO" || reclamo.reclamo_estado === "CANCELADO") {
        acc[monthKey].finalizados += 1;
      } else {
        acc[monthKey].activos += 1;
      }

      return acc;
    }, {} as Record<string, { month: string; monthKey: string; activos: number; finalizados: number }>);

    return Object.values(groupedByMonth).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [reclamos, filter]);

  const totalReclamos = reclamos.length;
  const totalActivos = reclamos.filter(r => r.reclamo_estado !== "CERRADO" && r.reclamo_estado !== "CANCELADO").length;
  const totalFinalizados = reclamos.filter(r => r.reclamo_estado === "CERRADO" || r.reclamo_estado === "CANCELADO").length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-64"></div>
        <Card className="animate-pulse">
          <CardHeader className="h-24 bg-muted/50"></CardHeader>
          <CardContent className="h-80 bg-muted/30"></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Tendencia Incidencias</CardTitle>
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
        <Card className="border-muted">
          <CardHeader>
            <div className="flex items-center justify-between md:flex-row flex-col text-center md:text-left">
              <div>
                <CardTitle>Reclamos por Mes</CardTitle>
                <CardDescription>
                  Total: {totalReclamos} | Activos: {totalActivos} | Finalizados: {totalFinalizados}
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap md:flex-no-wrap justify-center md:justify-start mt-4 md:mt-0">
                <Button
                  variant={filter === "7d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("7d")}
                >
                  7 días
                </Button>
                <Button
                  variant={filter === "30d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("30d")}
                >
                  30 días
                </Button>
                <Button
                  variant={filter === "3m" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("3m")}
                >
                  3 meses
                </Button>
                <Button
                  variant={filter === "1y" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("1y")}
                >
                  Ultimo año
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-0 md:px-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillActivos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillFinalizados" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="finalizados"
              type="monotone"
              fill="url(#fillFinalizados)"
              stroke="#818cf8"
              strokeWidth={2}
              stackId="1"
            />
            <Area
              dataKey="activos"
              type="monotone"
              fill="url(#fillActivos)"
              stroke="#6366f1"
              strokeWidth={2}
              stackId="1"
            />
          </AreaChart>
        </ChartContainer>
          </CardContent>
        </Card>
        </CardContent>
      )}
    </Card>
  );
}

