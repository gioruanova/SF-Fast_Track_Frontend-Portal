"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import axios from "axios";
import { config } from "@/lib/config";
import { SUPER_API } from "@/lib/superApi/config";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface LogData {
  log_id: number;
  log_company_id: number;
  log_detalle: string;
  log_leido: number;
  created_at: string;
  updated_at: string;
}

export function LogsActivity() {
  const { refreshTrigger } = useDashboard();
  const [logs, setLogs] = useState<LogData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get(SUPER_API.GET_LOGS);
        const sortedLogs = response.data.sort((a: LogData, b: LogData) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setLogs(sortedLogs);
      } catch (error) {
        console.error("Error obteniendo logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  const displayedLogs = showAll ? logs : logs.slice(0, 3);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-64"></div>
        <Card className="animate-pulse">
          <CardHeader className="h-16 bg-muted/50"></CardHeader>
          <CardContent className="h-64 bg-muted/30"></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Actividad del Sistema</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Expandir
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Colapsar
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent>
        <Card className="border-muted pb-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Registros de Actividad</CardTitle>
              {logs.length > 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? `Mostrar menos` : `Mostrar todos (${logs.length})`}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayedLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay registros de actividad
                </p>
              ) : (
                displayedLogs.map((log, index) => (
                  <div
                    key={log.log_id}
                    className={`flex flex-col sm:flex-row sm:items-start gap-3 pb-3 ${
                      index !== displayedLogs.length - 1 ? 'border-b' : ''
                    }`}
                  >
                    <div className="text-sm text-muted-foreground min-w-[140px] font-medium">
                      {format(parseISO(log.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                    </div>
                    <div className="text-sm flex-1">
                      {log.log_detalle}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        </CardContent>
      )}
    </Card>
  );
}

