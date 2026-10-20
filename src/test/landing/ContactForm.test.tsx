import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContactForm } from "@/components/landing/ContactForm";
import { SITE_CONFIG } from "@/config/site-config";
import { FORM_VALIDATION_RULES } from "@/components/landing/types";

describe("Formulario de Contacto (ContactForm.tsx)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("1. Envío con campos vacíos o con solo espacios previene la apertura de ventana y muestra mensajes de error con role='alert' (RF-06, CL-03)", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<ContactForm />);

    const submitButton = screen.getByRole("button", {
      name: /Enviar consulta a WhatsApp/i,
    });

    // Intento 1: Campos totalmente vacíos
    fireEvent.click(submitButton);

    // No debe llamarse a window.open
    expect(openSpy).not.toHaveBeenCalled();

    // Debe mostrar los 3 mensajes de error obligatorios con role="alert"
    const alertsEmpty = screen.getAllByRole("alert");
    expect(alertsEmpty.length).toBe(3);
    expect(screen.getByText(FORM_VALIDATION_RULES.nombre.requiredMessage)).toBeInTheDocument();
    expect(screen.getByText(FORM_VALIDATION_RULES.contacto.requiredMessage)).toBeInTheDocument();
    expect(screen.getByText(FORM_VALIDATION_RULES.mensaje.requiredMessage)).toBeInTheDocument();

    // Intento 2: Campos con solo espacios en blanco (Caso Límite CL-03)
    const nombreInput = screen.getByLabelText(/Nombre completo/i);
    const contactoInput = screen.getByLabelText(/Teléfono o Correo electrónico/i);
    const mensajeInput = screen.getByLabelText(/Detalle de la consulta/i);

    fireEvent.change(nombreInput, { target: { value: "    " } });
    fireEvent.change(contactoInput, { target: { value: "       " } });
    fireEvent.change(mensajeInput, { target: { value: "          " } });

    fireEvent.click(submitButton);

    expect(openSpy).not.toHaveBeenCalled();
    const alertsWhitespace = screen.getAllByRole("alert");
    expect(alertsWhitespace.length).toBe(3);
  });

  it("2. Envío con datos válidos llama a window.open con los parámetros codificados y limpia inmediatamente los valores de los 3 inputs (RF-06)", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<ContactForm />);

    const nombreInput = screen.getByLabelText(/Nombre completo/i) as HTMLInputElement;
    const contactoInput = screen.getByLabelText(
      /Teléfono o Correo electrónico/i,
    ) as HTMLInputElement;
    const mensajeInput = screen.getByLabelText(/Detalle de la consulta/i) as HTMLTextAreaElement;
    const submitButton = screen.getByRole("button", {
      name: /Enviar consulta a WhatsApp/i,
    });

    // Ingresar datos válidos con espacios periféricos
    fireEvent.change(nombreInput, { target: { value: "  Martín Fierro  " } });
    fireEvent.change(contactoInput, { target: { value: "  11 9876-5432  " } });
    fireEvent.change(mensajeInput, {
      target: {
        value: "  Consulta por reparación de inyectores piezoeléctricos Bosch.  ",
      },
    });

    // Enviar formulario
    fireEvent.click(submitButton);

    // Debe haberse invocado window.open exactamente 1 vez
    expect(openSpy).toHaveBeenCalledTimes(1);

    // Verificar URL generada
    const callArgs = openSpy.mock.calls[0]!;
    const generatedUrl = callArgs[0] as string;
    const target = callArgs[1];
    const windowFeatures = callArgs[2];

    expect(generatedUrl).toContain(`https://wa.me/${SITE_CONFIG.phone}`);
    expect(generatedUrl).toContain("?text=");
    expect(target).toBe("_blank");
    expect(windowFeatures).toBe("noopener,noreferrer");

    // Verificar contenido decodificado del mensaje
    const encodedText = generatedUrl.split("?text=")[1] || "";
    const decodedMessage = decodeURIComponent(encodedText);
    expect(decodedMessage).toContain("Nombre: Martín Fierro");
    expect(decodedMessage).toContain("Contacto: 11 9876-5432");
    expect(decodedMessage).toContain(
      "Consulta: Consulta por reparación de inyectores piezoeléctricos Bosch.",
    );

    // Limpieza INMEDIATA y síncrona de los inputs del formulario
    expect(nombreInput.value).toBe("");
    expect(contactoInput.value).toBe("");
    expect(mensajeInput.value).toBe("");

    // Sin alertas de error activas
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
