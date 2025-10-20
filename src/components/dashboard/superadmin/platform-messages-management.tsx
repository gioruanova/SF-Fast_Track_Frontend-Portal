"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw } from "lucide-react";
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

interface Company {
  company_id: number;
  company_nombre: string;
}

interface User {
  user_id: number;
  user_complete_name: string;
  user_email: string;
  company_id: number;
  company_name: string;
}

type MessageType = 'all' | 'company' | 'user';

export function PlatformMessagesManagement() {
  // Estados para mensajes de plataforma
  const [messageType, setMessageType] = useState<MessageType>('all');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [platformMessageTitle, setPlatformMessageTitle] = useState("");
  const [platformMessageContent, setPlatformMessageContent] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Funciones para mensajes de plataforma
  const fetchCompanies = async () => {
    try {
      const response = await apiClient.get(SUPER_API.GET_COMPANIES);
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Error al cargar las empresas');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get(SUPER_API.GET_USERS);
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
    setSelectedCompany(null);
    setSelectedUser(null);
    
    if (type === 'company') {
      fetchCompanies();
    } else if (type === 'user') {
      fetchUsers();
    }
  };

  const sendPlatformMessage = async () => {
    if (!platformMessageTitle.trim() || !platformMessageContent.trim()) {
      toast.error('El título y contenido del mensaje son requeridos');
      return;
    }

    if (messageType === 'company' && !selectedCompany) {
      toast.error('Debes seleccionar una empresa');
      return;
    }

    if (messageType === 'user' && !selectedUser) {
      toast.error('Debes seleccionar un usuario');
      return;
    }

    try {
      setIsSendingMessage(true);
      
      let endpoint = '';
      if (messageType === 'all') {
        endpoint = SUPER_API.PLAT_MESSAGE_ALL;
      } else if (messageType === 'company') {
        endpoint = SUPER_API.PLAT_MESSAGE_COMPANY.replace('{company_id}', selectedCompany!.toString());
      } else if (messageType === 'user') {
        endpoint = SUPER_API.PLAT_MESSAGE_USER.replace('{user_id}', selectedUser!.toString());
      }

      await apiClient.post(endpoint, {
        platform_message_title: platformMessageTitle.trim(),
        platform_message_content: platformMessageContent.trim()
      });

      // Reset form
      setPlatformMessageTitle("");
      setPlatformMessageContent("");
      setSelectedCompany(null);
      setSelectedUser(null);
      setMessageType('all');

      toast.success('Mensaje enviado correctamente');
    } catch (error) {
      console.error('Error sending platform message:', error);
      toast.error('Error al enviar el mensaje');
    } finally {
      setIsSendingMessage(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Mensajes de Plataforma</CardTitle>
        <CardDescription>
          Envía mensajes a usuarios de la plataforma según el tipo seleccionado
        </CardDescription>
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
                 <SelectItem value="all" className="cursor-pointer">Todos los usuarios</SelectItem>
                 <SelectItem value="company" className="cursor-pointer">Administradores de la empresa</SelectItem>
                 <SelectItem value="user" className="cursor-pointer">Usuario específico</SelectItem>
               </SelectContent>
             </Select>
          </div>

          {/* Dropdown para empresas */}
          {messageType === 'company' && (
            <div className="space-y-2 w-full">
              <Label htmlFor="company">Empresa</Label>
               <Select value={selectedCompany?.toString() || ""} onValueChange={(value) => setSelectedCompany(parseInt(value))}>
                 <SelectTrigger className="cursor-pointer w-full">
                   <SelectValue placeholder="Selecciona una empresa" />
                 </SelectTrigger>
                 <SelectContent>
                   {companies.map((company) => (
                     <SelectItem key={company.company_id} value={company.company_id.toString()} className="cursor-pointer">
                       {company.company_id} - {company.company_nombre}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>
          )}

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
                       {companies.find(company => company.company_id === user.company_id)?.company_nombre} - (ID: {user.company_id}) - {user.user_complete_name}
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
                placeholder="Ej: Novedades desde Fast Track"
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
  );
}
