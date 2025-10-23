"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RefreshCw, ChevronLeft, ChevronRight, Eye, EyeOff, Trash2, ExternalLink } from "lucide-react";
import { CLIENT_API } from "@/lib/clientApi/config";
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

interface User {
  user_id: number;
  user_complete_name: string;
  user_email: string;
}

interface PlatformMessage {
  id: number;
  platform_message_id: number;
  user_id: number;
  is_read: number;
  created_at: string;
  updated_at: string;
  platformMessage: {
    platform_message_id: number;
    message_sender: string;
    platform_message_title: string;
    platform_message_content: string;
    company_id: number | null;
    user_id: number | null;
    apto_empresa: number;
    created_at: string;
    updated_at: string;
  };
}

type MessageType = 'company' | 'user';

export function CompanyPlatformMessagesManagement() {
  // Estados para mensajes de plataforma
  const [messageType, setMessageType] = useState<MessageType>('company');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [platformMessageTitle, setPlatformMessageTitle] = useState("");
  const [platformMessageContent, setPlatformMessageContent] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Estados para listado de mensajes
  const [messages, setMessages] = useState<PlatformMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Funciones para mensajes de plataforma
  const fetchUsers = async () => {
    try {
      const response = await apiClient.get(CLIENT_API.GET_USERS);
      // Filtrar el usuario actual de la lista
      const filteredUsers = response.data.filter((user: User) => user.user_id !== currentUserId);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar los usuarios');
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await apiClient.get('/publicApi/profile');
      setCurrentUserId(response.data.user_id);
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const handleMessageTypeChange = (type: MessageType) => {
    setMessageType(type);
    setSelectedUser(null);

    if (type === 'user') {
      fetchUsers();
    }
  };

  const sendPlatformMessage = async () => {
    if (!platformMessageTitle.trim() || !platformMessageContent.trim()) {
      toast.error('El título y contenido del mensaje son requeridos');
      return;
    }

    if (messageType === 'user' && !selectedUser) {
      toast.error('Debes seleccionar un usuario');
      return;
    }

    try {
      setIsSendingMessage(true);

      let endpoint = '';
      if (messageType === 'company') {
        endpoint = CLIENT_API.CREATE_MENSAJE_PLATFORM_FOR_COMPANY;
      } else if (messageType === 'user') {
        endpoint = CLIENT_API.CREATE_MENSAJE_PLATFORM_FOR_USER.replace('{user_id}', selectedUser!.toString());
      }

      await apiClient.post(endpoint, {
        platform_message_title: platformMessageTitle.trim(),
        platform_message_content: platformMessageContent.trim()
      });

      // Reset form
      setPlatformMessageTitle("");
      setPlatformMessageContent("");
      setSelectedUser(null);
      setMessageType('company');

      // Recargar mensajes
      await fetchMessages();
      toast.success('Mensaje enviado correctamente');
    } catch (error) {
      console.error('Error sending platform message:', error);
      toast.error('Error al enviar el mensaje');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Funciones para listado de mensajes
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(CLIENT_API.GET_MESSAGES_PLATFORM);
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
        CLIENT_API.MARK_AS_READ_MESSAGE_PLATFORM.replace('{specific_message_id}', messageId.toString())
      );

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, is_read: 1 } : msg
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
        CLIENT_API.MARK_AS_UNREAD_MESSAGE_PLATFORM.replace('{specific_message_id}', messageId.toString())
      );

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, is_read: 0 } : msg
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
        CLIENT_API.DELETE_MESSAGE_PLATFORM.replace('{platform_message_id}', messageId.toString())
      );

      setMessages(prev => prev.filter(msg => msg.id !== messageId));

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

  useEffect(() => {
    getCurrentUser();
    fetchMessages();
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

  const unreadCount = messages.filter(msg => msg.is_read === 0).length;

  return (
    <div className="space-y-6">
      {/* Listado de mensajes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Mensajes</CardTitle>
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
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Cargando mensajes...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay mensajes de plataforma</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Mensaje</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMessages.map((message) => (
                    <TableRow key={message.id} className={`px-2 py-1 ${message.is_read === 0 ? 'bg-primary/10' : 'bg-transparent'}`}>
                      <TableCell>{formatDate(message.created_at)}</TableCell>
                      <TableCell className="font-medium">{(message.platformMessage.platform_message_title).slice(0, 20)}</TableCell>
                      <TableCell>
                        <Badge variant={message.is_read === 1 ? "default" : "secondary"}>
                          {message.is_read === 1 ? "Leído" : "No leído"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {message.platformMessage.platform_message_content ?
                          (message.platformMessage.platform_message_content.length > 30 ?
                            message.platformMessage.platform_message_content.substring(0, 30) + '...' :
                            message.platformMessage.platform_message_content
                          ) : 'Sin contenido'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{message.platformMessage.platform_message_title}</DialogTitle>
                                <DialogDescription>
                                  Mensaje enviado el {formatDate(message.created_at)}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Contenido del mensaje:</h4>
                                  <div className="bg-muted p-4 rounded-lg">
                                    <p className="whitespace-pre-wrap">{message.platformMessage.platform_message_content}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Estado:</span>
                                  <Badge variant={message.is_read === 1 ? "default" : "secondary"}>
                                    {message.is_read === 1 ? "Leído" : "No leído"}
                                  </Badge>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => { }}>
                                  Cerrar
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          {message.is_read === 1 ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsUnread(message.id)}
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsRead(message.id)}
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
                                  onClick={() => deleteMessage(message.id)}
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
                Mostrando {startIndex + 1}-{Math.min(endIndex, messages.length)} de {messages.length} mensajes de plataforma
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

      {/* Formulario para enviar mensajes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Enviar Mensaje</CardTitle>

        </CardHeader>
        <CardContent>
          <div className="space-y-6 w-full">
            {/* Selector de tipo de mensaje */}
            <div className="space-y-2 w-full">
              <Label htmlFor="messageType">Tipo de mensaje</Label>
              <Select value={messageType} onValueChange={handleMessageTypeChange}>
                <SelectTrigger className="cursor-pointer w-full">
                  <SelectValue placeholder="Selecciona el tipo de mensaje" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company" className="cursor-pointer">Todos los usuarios de la empresa</SelectItem>
                  <SelectItem value="user" className="cursor-pointer">Usuario específico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dropdown para usuarios */}
            {messageType === 'user' && (
              <div className="space-y-2 w-full">
                <Label htmlFor="user">Usuario</Label>
                <Select value={selectedUser?.toString() || ""} onValueChange={(value) => setSelectedUser(parseInt(value))}>
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue placeholder="Selecciona un usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id.toString()} className="cursor-pointer">
                        {user.user_complete_name} ({user.user_email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Formulario de mensaje */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="messageTitle">Título del mensaje</Label>
                <Input
                  id="messageTitle"
                  value={platformMessageTitle}
                  onChange={(e) => setPlatformMessageTitle(e.target.value)}
                  placeholder="Ej: Novedades desde la empresa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="messageContent">Contenido del mensaje</Label>
                <Textarea
                  id="messageContent"
                  value={platformMessageContent}
                  onChange={(e) => setPlatformMessageContent(e.target.value)}
                  placeholder="Escribe aquí el contenido del mensaje..."
                  rows={4}
                />
              </div>

              <Button
                onClick={sendPlatformMessage}
                disabled={isSendingMessage}
                className="w-full"
              >
                {isSendingMessage ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Mensaje'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
