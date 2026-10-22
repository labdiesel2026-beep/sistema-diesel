import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";

describe("useUnsavedChangesWarning — Prevención de Pérdida Accidental de Trabajo (TASK-21, Caso Límite 10, RNF-05)", () => {
  let addEventListenerSpy: any;
  let removeEventListenerSpy: any;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, "addEventListener");
    removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("no suscribe listener si no hay cambios sin guardar ni modal abierto", () => {
    renderHook(() => useUnsavedChangesWarning(false, false));

    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );
  });

  it("suscribe beforeunload cuando el formulario está sucio (isDirty = true)", () => {
    const { unmount } = renderHook(() => useUnsavedChangesWarning(true, false));

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );

    // Simular evento beforeunload
    const event = new Event("beforeunload", { cancelable: true }) as BeforeUnloadEvent;
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);

    // Al desmontar debe remover el listener limpiamente
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );
  });

  it("suscribe beforeunload cuando el modal de sesión/re-autenticación está abierto (isModalOpen = true)", () => {
    const { rerender, unmount } = renderHook(
      ({ isDirty, isModalOpen }) => useUnsavedChangesWarning(isDirty, isModalOpen),
      { initialProps: { isDirty: false, isModalOpen: true } },
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );

    const event = new Event("beforeunload", { cancelable: true }) as BeforeUnloadEvent;
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    window.dispatchEvent(event);
    expect(preventDefaultSpy).toHaveBeenCalled();

    // Cuando el modal se cierra y el form no está sucio, se remueve el listener
    rerender({ isDirty: false, isModalOpen: false });
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );

    unmount();
  });
});
