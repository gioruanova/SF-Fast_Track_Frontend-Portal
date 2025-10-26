"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Trash2, RefreshCw, ExternalLink, ChevronLeft, ChevronRight, Plus, Edit, Power, PowerOff } from "lucide-react";
import { SUPER_API } from "@/lib/superApi/config";
import { toast } from "sonner";
import axios from "axios";
import { config } from "@/lib/config";

const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface PublicMessage {
  message_id: number;
  message_email: string;
  message_phone: string;
  message_source: string;
  message_content: string;
  category_id: number;
  category_original: string;
  message_read: number;
  created_at: string;
  updated_at: string;
  category: {
    category_id: number;
    category_name: string;
    category_status: number;
    created_at: string;
    updated_at: string;
  };
}

interface MessageCategory {
  category_id: number;
  category_name: string;
  category_status: number;
  created_at: string;
  updated_at: string;
}


export function PublicMessagesManagement() {
  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Estados para categorías
  const [categories, setCategories] = useState<MessageCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MessageCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");


  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(SUPER_API.GET_PUBLIC_MESSAGES);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Error al cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: number) => {
    try {
      await apiClient.put(
        SUPER_API.READ_PUBLIC_MESSAGES.replace('{message_id}', messageId.toString())
      );

      setMessages(prev => 
        prev.map(msg => 
          msg.message_id === messageId ? { ...msg, message_read: 1 } : msg
        )
      );
      
      // Refrescar el contador del sidebar
      if (typeof window !== 'undefined' && window.refreshUnreadCount) {
        window.refreshUnreadCount();
      }
      
      toast.success('Mensaje marcado como leído');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Error al marcar como leído');
    }
  };

  const markAsUnread = async (messageId: number) => {
    try {
      await apiClient.put(
        SUPER_API.UNREAD_PUBLIC_MESSAGES.replace('{message_id}', messageId.toString())
      );

      setMessages(prev => 
        prev.map(msg => 
          msg.message_id === messageId ? { ...msg, message_read: 0 } : msg
        )
      );
      
      // Refrescar el contador del sidebar
      if (typeof window !== 'undefined' && window.refreshUnreadCount) {
        window.refreshUnreadCount();
      }
      
      toast.success('Mensaje marcado como no leído');
    } catch (error) {
      console.error('Error marking as unread:', error);
      toast.error('Error al marcar como no leído');
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      await apiClient.delete(
        SUPER_API.DELETE_PUBLIC_MESSAGES.replace('{message_id}', messageId.toString())
      );

      setMessages(prev => prev.filter(msg => msg.message_id !== messageId));
      
      // Refrescar el contador del sidebar
      if (typeof window !== 'undefined' && window.refreshUnreadCount) {
        window.refreshUnreadCount();
      }
      
      toast.success('Mensaje eliminado correctamente');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Error al eliminar el mensaje');
    }
  };

  // Funciones para categorías
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await apiClient.get(SUPER_API.GET_PUBLIC_MESSAGES_CATEGORIES);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error al cargar las categorías');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const createCategory = async () => {
    if (!categoryName.trim()) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }

    try {
      await apiClient.post(SUPER_API.CREATE_PUBLIC_MESSAGES_CATEGORIES, {
        category_name: categoryName.trim()
      });

      setCategoryName("");
      setIsCreateCategoryOpen(false);
      await fetchCategories();
      toast.success('Categoría creada correctamente');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Error al crear la categoría');
    }
  };

  const editCategory = async () => {
    if (!categoryName.trim() || !editingCategory) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }

    try {
      await apiClient.put(
        SUPER_API.EDIT_PUBLIC_MESSAGES_CATEGORIES.replace('{category_id}', editingCategory.category_id.toString()),
        {
          category_name: categoryName.trim()
        }
      );

      setCategoryName("");
      setEditingCategory(null);
      setIsEditCategoryOpen(false);
      await fetchCategories();
      toast.success('Categoría actualizada correctamente');
    } catch (error) {
      console.error('Error editing category:', error);
      toast.error('Error al actualizar la categoría');
    }
  };

  const toggleCategoryStatus = async (categoryId: number, currentStatus: number) => {
    try {
      const endpoint = currentStatus === 1
        ? SUPER_API.DISABLE_PUBLIC_MESSAGES_CATEGORIES.replace('{category_id}', categoryId.toString())
        : SUPER_API.ENABLE_PUBLIC_MESSAGES_CATEGORIES.replace('{category_id}', categoryId.toString());

      await apiClient.put(endpoint);

      setCategories(prev =>
        prev.map(cat =>
          cat.category_id === categoryId
            ? { ...cat, category_status: currentStatus === 1 ? 0 : 1 }
            : cat
        )
      );

      toast.success(`Categoría ${currentStatus === 1 ? 'desactivada' : 'activada'} correctamente`);
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast.error('Error al cambiar el estado de la categoría');
    }
  };

  const deleteCategory = async (categoryId: number) => {
    try {
      await apiClient.delete(
        SUPER_API.DELETE_PUBLIC_MESSAGES_CATEGORIES.replace('{category_id}', categoryId.toString())
      );

      setCategories(prev => prev.filter(cat => cat.category_id !== categoryId));
      toast.success('Categoría eliminada correctamente');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error al eliminar la categoría');
    }
  };

  const openEditCategory = (category: MessageCategory) => {
    setEditingCategory(category);
    setCategoryName(category.category_name);
    setIsEditCategoryOpen(true);
  };


  useEffect(() => {
    fetchMessages();
    fetchCategories();
  }, []);

  // Resetear página cuando cambien los mensajes
  useEffect(() => {
    setCurrentPage(1);
  }, [messages.length]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // calcular paginado
  const totalPages = Math.ceil(messages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMessages = messages.slice(startIndex, endIndex);

  const unreadCount = messages.filter(msg => msg.message_read === 0).length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Cargando mensajes...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Mensajes Públicos</CardTitle>
              <CardDescription>
                Gestiona los mensajes recibidos desde la página institucional
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>
                {unreadCount} no leídos
              </Badge>
              <Button onClick={fetchMessages} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay mensajes públicos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Email/Mensaje</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMessages.map((message) => (
                    <TableRow key={message.message_id} className={`px-2 py-1 ${message.message_read === 0 ? 'bg-primary/10' : 'bg-transparent'}`}>
                      <TableCell>{formatDate(message.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{message.message_source}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{message.category_original}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col  gap-2">
                          <a className="text-primary hover:text-blue-700" href={`mailto:${message.message_email}`}>{message.message_email}</a>
                          {message.message_content.substring(0, 30)}...
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-center gap-2">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-[400px] sm:w-[540px]">
                              <SheetHeader>
                                <SheetTitle>Mensaje Completo</SheetTitle>
                                <SheetDescription>
                                  De: {message.category_original} - {message.message_source} | {message.message_email}
                                </SheetDescription>
                              </SheetHeader>
                              <div className="mt-4 space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Información del contacto:</h4>
                                  <p className="text-sm text-muted-foreground">
                                    <span>Email: </span> <a className="text-primary hover:text-blue-700" href={`mailto:${message.message_email}`}>{message.message_email}</a>
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    <span>Telefono: </span>
                                    {message.message_phone !== "N/A" ? <a className="text-primary hover:text-blue-700" href={`tel:${message.message_phone}`}>{message.message_phone}</a> : <span className="text-muted-foreground">N/A</span>}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Fuente: {message.message_source}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Categoría: {message.category_original}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Fecha: {formatDate(message.created_at)}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Mensaje:</h4>
                                  <p className="whitespace-pre-wrap max-h-[300px] overflow-y-auto">{message.message_content}</p>
                                </div>
                              </div>
                            </SheetContent>
                          </Sheet>
                          {message.message_read === 1 ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsUnread(message.message_id)}
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsRead(message.message_id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar mensaje?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el mensaje.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMessage(message.message_id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Información de paginación y controles */}
          {messages.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1}-{Math.min(endIndex, messages.length)} de {messages.length} mensajes públicos
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
          )}
        </CardContent>
      </Card>

      {/* Sección de Categorías */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Categorías de Mensajes Públicos</CardTitle>
              <CardDescription>
                Gestiona las categorías disponibles para los mensajes públicos
              </CardDescription>
            </div>
            <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Categoría
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Categoría</DialogTitle>
                  <DialogDescription>
                    Ingresa el nombre de la nueva categoría de mensajes.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="categoryName">Nombre de la categoría</Label>
                    <Input
                      id="categoryName"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="Ej: Consultas, Contratación, Demo..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateCategoryOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createCategory}>
                    Crear Categoría
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Cargando categorías...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay categorías disponibles</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.category_id}>
                      <TableCell className="font-medium">{category.category_name}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap uppercase ${category.category_status === 1
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                        >
                          {category.category_status === 1 ? 'Activa' : 'Inactiva'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleCategoryStatus(category.category_id, category.category_status)}
                          >
                            {category.category_status === 1 ? (
                              <PowerOff className="h-4 w-4 text-red-500" />
                            ) : (
                              <Power className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente la categoría &quot;{category.category_name}&quot;.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteCategory(category.category_id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Dialog para editar categoría */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
            <DialogDescription>
              Modifica el nombre de la categoría seleccionada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editCategoryName">Nombre de la categoría</Label>
              <Input
                id="editCategoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ej: Consultas, Contratación, Demo..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCategoryOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={editCategory}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
