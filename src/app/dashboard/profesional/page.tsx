"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShapeLeft, ShapeRight } from "@/components/ui/shape";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfesionalDashboardPage() {
  const { logout, isLoading } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const canRenderContent = !isLoading;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-2 md:pt-3 h-[100vh] items-center justify-center">
      <ShapeLeft />
      <ShapeRight />
      <div className="flex items-center justify-center">
        {canRenderContent ? (
          <Card className="w-full max-w-[400px]">
            <CardContent className="flex flex-col items-center justify-center gap-4 pt-6">
              <div className="text-center space-y-2">
                <h1 className="text-white text-2xl font-bold">Proximamente una seccion dedicada exclusivamente para vos</h1>
                <p className="text-white text-sm">Te recomendamos descargar la app en tu dispositivo para que puedas ver tus tareas asignadas.</p>
              </div>

              <div className="text-white flex flex-col items-center justify-center gap-4 w-full">
                <p className="text-center">
                  Ingresa en este {" "}
                  <Link href="https://drive.google.com/drive/folders/1U6qSSSZhiyiNJRt5JrurekYMlQWkUX1C?usp=sharing" className="text-primary underline font-bold">
                    link
                  </Link>{" "}
                  para descargar la aplicacion.
                </p>

                <div className="flex flex-col items-center gap-2 w-full">
                  <p className="text-center">O escanea el código QR y comenzá a operar. (Simulación Store)</p>
                  <Image
                    src="/assets/qr-code.png"
                    alt="Código QR para descargar la aplicación"
                    width={300}
                    height={300}
                    className="mx-auto mt-5 border-2 border-white rounded-md"
                  />
                </div>

                <Button
                  variant="default"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full"
                >
                  {isLoggingOut ? "Cerrando sesión..." : "Salir"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-[400px]">
            <CardContent className="flex flex-col items-center justify-center gap-4 pt-6">
              <div className="space-y-4 w-full">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

