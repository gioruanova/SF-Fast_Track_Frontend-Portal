"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Phone, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface ContactoRapidoClienteProps {
    className?: string;
    cardClassName?: string;
    cliente_phone?: string;
    cliente_email?: string;
    reclamo_nro?: string;
    reclamo_detalle?: string;
}

export function ContactoClienteRapido({ className, cardClassName, cliente_phone, cliente_email, reclamo_nro, reclamo_detalle }: ContactoRapidoClienteProps) {
    const { companyConfig, user } = useAuth();

    const contactMethods = [
        {
            label: "Teléfono",
            description: "Llamar directamente",
            value: cliente_phone,
            icon: Phone,
            href: cliente_phone ? `tel:${cliente_phone}` : null,
            gradient: "from-blue-500 to-blue-600",
            hoverGradient: "hover:from-blue-600 hover:to-blue-700"
        },
        {
            label: "Email",
            description: "Enviar correo electrónico",
            value: cliente_email,
            icon: Mail,

            href: cliente_email
                ? `mailto:${cliente_email}?subject=${encodeURIComponent(
                    `Contacto en relación a su solicitud ${reclamo_nro}`
                )}&body=${encodeURIComponent(
                    `Espero se encuentre bien.\n\nMi nombre es ${user?.user_name} y me comunico por parte de la empresa ${companyConfig?.company?.company_nombre} en relación a su ${companyConfig?.sing_heading_reclamos} sobre '${reclamo_detalle}'.\n\n`
                )}`
                : null,



            gradient: "from-red-500 to-pink-600",
            hoverGradient: "hover:from-red-600 hover:to-pink-700"
        },


    ];

    const availableMethods = contactMethods.filter(m => m.value);

    if (availableMethods.length === 0) {
        return null;
    }


    return (
        <Card className={cn("border-2 gap-1", cardClassName)}>
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
