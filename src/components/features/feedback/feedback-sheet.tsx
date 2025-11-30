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
import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/api_routes";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface FeedbackSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FeedbackSheet({ open: controlledOpen, onOpenChange: controlledOnOpenChange }: FeedbackSheetProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const isControlled = controlledOpen !== undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error("El mensaje no puede estar vacío");
      return;
    }

    try {
      setIsSending(true);
      setSuccess(false);

      await apiClient.post(API_ROUTES.FEEDBACK_CREATE, {
        message_content: message.trim(),
      });

      toast.success("Feedback enviado correctamente");
      setMessage("");
      setSuccess(true);
      
      setTimeout(() => {
        if (isControlled && controlledOnOpenChange) {
          controlledOnOpenChange(false);
        } else {
          setInternalOpen(false);
        }
        setSuccess(false);
      }, 2000);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      const errorMessage = error.response?.data?.error || "Error al enviar feedback";
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (isControlled && controlledOnOpenChange) {
      controlledOnOpenChange(open);
    } else {
      setInternalOpen(open);
    }
    if (!open) {
      setMessage("");
      setSuccess(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      {!isControlled && (
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
      )}

      <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto md:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>FasTrack quiere conocer tu opinión...</SheetTitle>
          <SheetDescription>
            Tu retroalimentación es de suma importancia para nosotros.
            Construimos esta aplicación a través de tu opinión y mejoramos el sistema según tus necesidades e inquietudes.
          </SheetDescription>
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
                  placeholder="Escribe tu mensaje aquí..."
                  className="mt-4 w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  disabled={isSending}
                  required
                />
              </div>

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
