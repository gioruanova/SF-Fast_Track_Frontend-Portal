"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Phone, Mail, MessageCircle, Send, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface ContactoRapidoProps {
    variant?: "default" | "compact";
    showHeader?: boolean;
    className?: string;
    cardClassName?: string;
}

export function ContactoRapido({
    variant = "default",
    showHeader = true,
    className,
    cardClassName
}: ContactoRapidoProps) {
    const { companyConfig, user } = useAuth();
    const [copiedValue, setCopiedValue] = useState<string | null>(null);

    const handleCopy = (value: string, label: string) => {
        navigator.clipboard.writeText(value);
        setCopiedValue(value);
        toast.success(`${label} copiado al portapapeles`);
        setTimeout(() => setCopiedValue(null), 2000);
    };

    const contactMethods = [
        {
            label: "Teléfono",
            description: "Llamar directamente",
            value: companyConfig?.company?.company_phone,
            icon: Phone,
            href: companyConfig?.company?.company_phone ? `tel:${companyConfig.company.company_phone}` : null,
            gradient: "from-blue-500 to-blue-600",
            hoverGradient: "hover:from-blue-600 hover:to-blue-700"
        },
        {
            label: "WhatsApp",
            description: "Abrir chat de WhatsApp",
            value: companyConfig?.company?.company_whatsapp,
            icon: MessageCircle,
            href: companyConfig?.company?.company_whatsapp
                ? `https://wa.me/${companyConfig.company.company_whatsapp.replace(/\D/g, '')}?text=${`Buenas tardes, soy ${companyConfig?.sing_heading_profesional} ${user?.user_name} y requiero asistencia.`}`
                : null,
            gradient: "from-green-500 to-emerald-600",
            hoverGradient: "hover:from-green-600 hover:to-emerald-700"
        },
        {
            label: "Email",
            description: "Enviar correo electrónico",
            value: companyConfig?.company?.company_email,
            icon: Mail,
            
            href: companyConfig?.company?.company_email ? `mailto:${companyConfig.company.company_email}?subject=${`Asistencia ${companyConfig?.sing_heading_profesional} ${user?.user_name}`}&body=${`Buenas tardes, soy ${companyConfig?.sing_heading_profesional} ${user?.user_name} y requiero asistencia.`}` : null,
            gradient: "from-red-500 to-pink-600",
            hoverGradient: "hover:from-red-600 hover:to-pink-700"
        },

        {
            label: "Telegram",
            description: "Abrir chat de Telegram",
            value: companyConfig?.company?.company_telegram,
            icon: Send,
            href: companyConfig?.company?.company_telegram
                ? `https://t.me/${companyConfig.company.company_telegram}?text=${`Buenas tardes, soy ${companyConfig?.sing_heading_profesional} ${user?.user_name} y requiero asistencia.`}`
                : null,
            gradient: "from-sky-500 to-blue-500",
            hoverGradient: "hover:from-sky-600 hover:to-blue-600"
        }
    ];

    const availableMethods = contactMethods.filter(m => m.value);

    if (availableMethods.length === 0) {
        return null;
    }

    const titleContacto = "Contactos Rápido";

    // verssion para el dashboard main
    if (variant === "compact") {
        return (
            <Card className={cn("border-2 gap-1", cardClassName)}>
                {showHeader && (
                    <CardHeader className="pb-0">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{titleContacto}</CardTitle>

                        </div>
                    </CardHeader>
                )}
                <CardContent className={cn(className)}>
                    <div className="flex gap-2 flex-wrap">
                        {availableMethods.map((method) => {
                            const Icon = method.icon;
                            return (
                                <TooltipProvider key={method.label}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="flex-1 min-w-[120px] h-auto flex-col gap-1 py-3"
                                                asChild
                                            >
                                                <a
                                                    href={method.href || '#'}
                                                    target={method.label === "Email" ? undefined : "_blank"}
                                                    rel="noopener noreferrer"
                                                >
                                                    <Icon className="h-5 w-5" />
                                                    <span className="text-xs font-medium">{method.label}</span>
                                                </a>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{method.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // version dedicada para la pagina de contactar empresa
    return (
        <Card className={cn("border-2 gap-1", cardClassName)}>
            {showHeader && (
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <CardTitle className="text-2xl">{titleContacto}</CardTitle>
                            <span className="hidden md:block">-</span>
                            <CardDescription className="text-2xl">
                                {companyConfig?.company?.company_nombre}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            )}
            <CardContent className={cn("space-y-6", className)}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {availableMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                            <TooltipProvider key={method.label}>
                                <Card className="overflow-hidden border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                    <div className={`bg-gradient-to-br ${method.gradient} ${method.hoverGradient} p-6 transition-all duration-300`}>
                                        <div className="flex flex-col items-center gap-3 text-white">
                                            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                                                <Icon className="h-8 w-8" />
                                            </div>
                                            <div className="text-center space-y-1">
                                                <div className="font-bold text-lg">{method.label}</div>
                                                <div className="text-xs opacity-90">{method.description}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/30 space-y-3">
                                        <div className="text-sm font-medium text-center break-all px-2">
                                            {method.value}
                                        </div>
                                        <div className="flex gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => handleCopy(method.value!, method.label)}
                                                    >
                                                        {copiedValue === method.value ? (
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Copiar {method.label}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        asChild
                                                        className="flex-1"
                                                    >
                                                        <a
                                                            href={method.href || '#'}
                                                            target={method.label === "Email" ? undefined : "_blank"}
                                                            rel="noopener noreferrer"
                                                        >
                                                            <ExternalLink className="h-4 w-4 mr-0" />
                                                            Contactar
                                                        </a>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{method.description}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </Card>
                            </TooltipProvider>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
