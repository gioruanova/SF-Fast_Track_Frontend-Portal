"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageCircleHeartIcon, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { config } from "@/lib/config";
import { CLIENT_API } from "@/lib/clientApi/config";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function FeedbackSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error("El mensaje no puede estar vacío");
      return;
    }

    try {
      setIsSending(true);
      setError(null);
      setSuccess(false);

      await apiClient.post(CLIENT_API.FEEDBACK, {
        message_content: message,
      });

      toast.success("Feedback enviado correctamente");
      setMessage("");
      setIsOpen(false);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      const errorMessage = error.response?.data?.error || "Error al enviar feedback";
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setMessage("");
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SidebarGroup>

        <SidebarMenu>
          <SidebarMenuItem>
            <SheetTrigger asChild>
              <SidebarMenuButton tooltip="Enviar Feedback" className="cursor-pointer">
                <MessageCircleHeartIcon />
                <span>Enviar Feedback</span>
              </SidebarMenuButton>
            </SheetTrigger>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>FasTrack quiere leerte...</SheetTitle>
          <SheetDescription>Tu retroalimentacion es super importante para nosotros.
            Construimos esta aplicacion a traves de tu opinión y mejoramos el sistema en base
            a tus necesidades e inquietudes.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-lg font-semibold text-green-600">
                ¡Feedback enviado!
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Gracias por tu aporte
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="feedback" className="text-sm font-medium">
                  Mensaje / Feedback a enviar
                </label>
                <textarea
                  id="feedback"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribi tu mensaje aquí..."
                  className="mt-4 w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  disabled={isSending}
                  required
                />
              </div>

              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSending || !message.trim()}
                className="w-full"
              >
                {isSending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  "Enviar Feedback"
                )}
              </Button>
            </>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
}

