import { SuperadminUserData, SuperadminCompanyData, SuperadminReclamoData, CompanyStats } from "@/types/superadmin";
import { Especialidad } from "@/types/especialidades";
import { ClienteRecurrente } from "@/types/clientes";
import { USER_STATUS } from "@/types/users";

export function processCompanyStats(
  companies: SuperadminCompanyData[],
  users: SuperadminUserData[],
  especialidades: Especialidad[],
  reclamos: SuperadminReclamoData[],
  clientes: ClienteRecurrente[]
): CompanyStats[] {
  const companyNameToIdMap = new Map<string, number>();
  companies.forEach((company) => {
    companyNameToIdMap.set(company.company_nombre, company.company_id);
  });

  const statsMap = new Map<number, Omit<CompanyStats, "company_id" | "company_nombre">>();

  companies.forEach((company) => {
    statsMap.set(company.company_id, {
      operadores_activos: 0,
      profesionales_activos: 0,
      clientes_activos: 0,
      especialidades: 0,
      reclamos_abiertos: 0,
      reclamos_cerrados: 0,
    });
  });

  users.forEach((user) => {
    if (user.company_id && user.user_status === USER_STATUS.ACTIVO && user.user_role !== "superadmin") {
      const stats = statsMap.get(user.company_id);
      if (stats) {
        if (user.user_role === "operador") {
          stats.operadores_activos++;
        } else if (user.user_role === "profesional") {
          stats.profesionales_activos++;
        }
      }
    }
  });

  clientes.forEach((cliente) => {
    if (cliente.company_id && cliente.cliente_active === 1) {
      const stats = statsMap.get(cliente.company_id);
      if (stats) {
        stats.clientes_activos++;
      }
    }
  });

  especialidades.forEach((esp) => {
    const stats = statsMap.get(esp.company_id);
    if (stats) {
      stats.especialidades++;
    }
  });

  reclamos.forEach((reclamo) => {
    const companyId = companyNameToIdMap.get(reclamo.company_name);
    if (companyId) {
      const stats = statsMap.get(companyId);
      if (stats) {
        if (reclamo.reclamo_estado === "CERRADO" || reclamo.reclamo_estado === "CANCELADO") {
          stats.reclamos_cerrados++;
        } else {
          stats.reclamos_abiertos++;
        }
      }
    }
  });

  return companies.map((company) => {
    const stats = statsMap.get(company.company_id)!;
    return {
      company_id: company.company_id,
      company_nombre: company.company_nombre,
      ...stats,
    };
  });
}

