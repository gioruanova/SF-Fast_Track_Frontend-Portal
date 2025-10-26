"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const ShowQRForMobile = () => {
    const [isDesktop, setIsDesktop] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        setIsDesktop(!isMobile);
    }, [isMobile]);

    if (!isDesktop) {
        return null;
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="icon"
                    className="fixed bottom-4 right-4 z-50  border-2 shadow-lg"
                    aria-label="Mostrar código QR para móvil"
                    title="Accede desde tu móvil"
                >
                    <Smartphone className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Acceso desde móvil</DialogTitle>
                    <DialogDescription>
                        Escanea este código para acceder a través de tu móvil
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center p-4">
                    <Image
                        src="/assets/QR-PORTAL.png"
                        alt="QR Code para acceso móvil"
                        width={300}
                        height={300}
                        className="w-full max-w-[300px] h-auto object-contain rounded-lg"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};