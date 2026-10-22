/**
 * Hook para Prevención de Pérdida Accidental de Trabajo mediante evento beforeunload.
 * (Spec 010, Caso Límite 10, RNF-05, TASK-21)
 *
 * Características:
 * - Detecta si un formulario posee cambios sin guardar (isDirty) o si un modal de sesión/re-autenticación
 *   permanece abierto (isModalOpen).
 * - Suscribe preventivamente window.addEventListener('beforeunload', handleBeforeUnload).
 * - Ante intento de recarga (F5), navegación fuera del origen o cierre de pestaña, cancela el evento
 *   y establece e.returnValue = '' para detonar el diálogo de advertencia nativo del navegador.
 * - Remueve el listener de forma limpia cuando ni isDirty ni isModalOpen son verdaderos, o al desmontar.
 */

import { useEffect } from "react";

export function useUnsavedChangesWarning(
  isDirty: boolean,
  isModalOpen: boolean = false,
) {
  useEffect(() => {
    // Si no hay cambios sucios ni modal de sesión abierto, no suscribir el listener
    if (!isDirty && !isModalOpen) {
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Disparar confirmación estándar del navegador (Caso Límite 10)
      e.preventDefault();
      // Compatibilidad transversal con navegadores modernos (Chromium / Firefox / Safari)
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, isModalOpen]);
}

export default useUnsavedChangesWarning;
