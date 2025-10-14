"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Check, X, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDashboard } from "@/context/DashboardContext";
import { toast } from "sonner";
import axios from "axios";
import { config } from "@/lib/config";
import { CLIENT_API } from "@/lib/clientApi/config";
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

export function OwnerLogsActivity() {
  const { refreshTrigger } = useDashboard();
  const [logs, setLogs] = useState<LogData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchLogs = async () => {
    try {
      const response = await apiClient.get(CLIENT_API.GET_LOGS);
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

  useEffect(() => {
    fetchLogs();
  }, [refreshTrigger]);

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.put(CLIENT_API.LOGS_READ);
      await fetchLogs();
      toast.success("Logs marcados como leídos");
    } catch (error) {
      console.error("Error marcando logs como leídos:", error);
      
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        
        if (status === 500) {
          toast.error("Error interno del servidor. Intenta nuevamente más tarde.");
        } else {
          toast.error("Error al marcar logs como leídos.");
        }
      } else {
        toast.error("Error de conexión. Verifica tu conexión a internet.");
      }
    }
  };

  const handleMarkAllAsUnread = async () => {
    try {
      await apiClient.put(CLIENT_API.LOGS_NOT_READ);
      await fetchLogs();
      toast.success("Logs marcados como no leídos");
    } catch (error) {
      console.error("Error marcando logs como no leídos:", error);
      
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        
        if (status === 500) {
          toast.error("Error interno del servidor. Intenta nuevamente más tarde.");
        } else {
          toast.error("Error al marcar logs como no leídos.");
        }
      } else {
        toast.error("Error de conexión. Verifica tu conexión a internet.");
      }
    }
  };

  const handleDeleteAll = async () => {
    try {
      await apiClient.delete(CLIENT_API.LOG_DELETE);
      await fetchLogs();
      toast.success("Todos los logs han sido eliminados");
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error eliminando logs:", error);
      
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        
        if (status === 500) {
          toast.error("Error interno del servidor. Intenta nuevamente más tarde.");
        } else {
          toast.error("Error al eliminar los logs.");
        }
      } else {
        toast.error("Error de conexión. Verifica tu conexión a internet.");
      }
    }
  };

  const displayedLogs = showAll ? logs : logs.slice(0, 3);
  const hasUnreadLogs = logs.some(log => log.log_leido === 0);
  const hasReadLogs = logs.some(log => log.log_leido === 1);

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
        <div className="flex items-center justify-between ">
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
        <CardContent className="space-y-4">
        <Card className="border-muted pb-0">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle>Registros de Actividad</CardTitle>
              <div className="flex flex-wrap gap-2">
                {logs.length > 0 && hasUnreadLogs && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Marcar todo como leído
                  </Button>
                )}
                {logs.length > 0 && hasReadLogs && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsUnread}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Marcar todo como no leído
                  </Button>
                )}
                {logs.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Borrar todos
                  </Button>
                )}
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
                     } ${log.log_leido === 0 ? 'bg-muted/30 -mx-4 px-4 py-3 rounded-lg pb-0' : ''}`}
                   >
                    <div className="text-sm text-muted-foreground min-w-[140px] font-medium">
                      {format(parseISO(log.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                    </div>
                    <div className="text-sm flex-1 flex items-start gap-2">
                      {log.log_leido === 0 && (
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      )}
                      <span className={log.log_leido === 0 ? 'font-medium' : ''}>
                        {log.log_detalle}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
           </CardContent>
         </Card>
        </CardContent>
       )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán permanentemente todos los registros de actividad.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
     </Card>
   );
 }

