"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useAuth } from "@/context/AuthContext";
import { isCompanyUser } from "@/types/auth";

export default function OperadorTutorialesPage() {
  const { companyConfig, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (companyConfig?.company?.company_estado === 0) {
      router.push("/dashboard/operador");
    }
  }, [companyConfig, router]);


  if (!user || !isCompanyUser(user) || user.user_role !== "operador") {
    return null;
  }

  if (companyConfig?.company?.company_estado === 0) {
    return null;
  }

  return (
    <>
      <DashboardHeader 
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/operador" },
          { label: "Tutoriales" }
        ]} 
        userRole={user.user_role}
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Tutoriales</h2>
          <p className="text-muted-foreground">Aca va a una seccion de tutoriales sobre el uso del portal (algunos componentes van a ser compartidos entre los roles, y otros dedicados por perfil) - tengo que evaluar la logica y componentizacion todavia</p>
        </div>
      </div>
    </>
  );
}

