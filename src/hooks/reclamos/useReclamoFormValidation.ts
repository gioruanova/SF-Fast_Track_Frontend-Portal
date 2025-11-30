import { useMemo } from "react";
import { useCreateReclamo } from "./useCreateReclamo";

interface UseReclamoFormValidationReturn {
  hasClientesActivos: boolean;
  hasEspecialidadesActivas: boolean;
  hasAsignacionesParaEspecialidad: boolean;
  isFormDisabled: boolean;
}

export function useReclamoFormValidation(): UseReclamoFormValidationReturn {
  const {
    clientesOptions,
    loadingClientes,
    especialidadesOptions,
    loadingEspecialidades,
    profesionalesDisponibles,
    formData,
  } = useCreateReclamo(true);

  const hasClientesActivos = useMemo(
    () => clientesOptions.length > 0 && !loadingClientes,
    [clientesOptions.length, loadingClientes]
  );

  const hasEspecialidadesActivas = useMemo(
    () => especialidadesOptions.length > 0 && !loadingEspecialidades,
    [especialidadesOptions.length, loadingEspecialidades]
  );

  const hasAsignacionesParaEspecialidad = useMemo(() => {
    if (!formData.especialidad_id) {
      return true;
    }
    return profesionalesDisponibles.length > 0;
  }, [formData.especialidad_id, profesionalesDisponibles.length]);

  const isFormDisabled = useMemo(
    () =>
      !hasClientesActivos ||
      !hasEspecialidadesActivas ||
      !hasAsignacionesParaEspecialidad,
    [hasClientesActivos, hasEspecialidadesActivas, hasAsignacionesParaEspecialidad]
  );

  return {
    hasClientesActivos,
    hasEspecialidadesActivas,
    hasAsignacionesParaEspecialidad,
    isFormDisabled,
  };
}

