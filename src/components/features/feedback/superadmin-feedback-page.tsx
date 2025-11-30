"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Trash2 } from "lucide-react";
import { FeedbackDetailSheet } from "@/components/features/feedback/feedback-detail-sheet";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/api_routes";
import { getFeedbackDeleteEndpoint } from "@/lib/apiHelpers";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { UserPagination } from "@/components/features/usuarios/shared/UserPagination";
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

interface FeedbackData {
  feedback_id: number;
  user_id: number;
  user_name: string;
  company_id: number;
  company_name: string;
  user_role: string;
  user_email: string;
  feedback_message: string;
  created_at: string;
  updated_at: string;
}

export function SuperadminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<FeedbackData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(API_ROUTES.GET_FEEDBACKS);

      const sortedFeedbacks = response.data.sort((a: FeedbackData, b: FeedbackData) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setFeedbacks(sortedFeedbacks);
    } catch (error) {
      console.error("Error obteniendo datos:", error);
      toast.error("Error al cargar los feedbacks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalPages = Math.ceil(feedbacks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFeedbacks = feedbacks.slice(startIndex, endIndex);

  const handleViewDetails = (feedback: FeedbackData) => {
    setSelectedFeedback(feedback);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedFeedback(null);
  };

  const handleDeleteClick = (feedback: FeedbackData) => {
    setFeedbackToDelete(feedback);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!feedbackToDelete) return;

    try {
      setIsDeleting(true);
      const endpoint = getFeedbackDeleteEndpoint(feedbackToDelete.feedback_id);
      
      await apiClient.delete(endpoint);
      
      toast.success("Feedback eliminado correctamente");
      await fetchData();
      setIsDeleteDialogOpen(false);
      setFeedbackToDelete(null);
    } catch (error) {
      console.error("Error eliminando feedback:", error);
      toast.error("Error al eliminar el feedback");
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return "default";
      case "operador":
        return "secondary";
      case "profesional":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start md:items-center justify-start md:justify-between flex-col md:flex-row gap-2">
            <div>
              <CardTitle className="text-2xl">Gestión de Feedback</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 text-balance">
                Visualiza y gestiona todos los feedbacks del sistema
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-1">
              {feedbacks.length} {feedbacks.length === 1 ? "feedback" : "feedbacks"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay feedbacks registrados
            </div>
          ) : (
            <>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedFeedbacks.map((feedback) => (
                      <TableRow key={feedback.feedback_id}>
                        <TableCell>
                          <div className="text-sm">
                            {format(parseISO(feedback.created_at), "dd/MM/yyyy", { locale: es })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(parseISO(feedback.created_at), "HH:mm", { locale: es })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{feedback.user_name}</div>
                          <div className="text-xs text-muted-foreground">{feedback.user_email}</div>
                        </TableCell>
                        <TableCell>{feedback.company_name}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(feedback.user_role)}>
                            {feedback.user_role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleViewDetails(feedback)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(feedback)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <UserPagination
                currentPage={currentPage}
                totalPages={totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={feedbacks.length}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <FeedbackDetailSheet
        feedback={selectedFeedback}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este feedback del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
