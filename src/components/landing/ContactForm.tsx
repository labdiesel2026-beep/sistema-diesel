import { useState } from "react";
import { MessageCircle, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/config/site-config";
import { buildWhatsAppUrl, formatContactMessage } from "@/lib/whatsapp-utils";
import { validateContactForm } from "./contact-validation";
import { INITIAL_CONTACT_FORM_DATA, type ContactFormData, type ContactFormErrors } from "./types";

interface ContactFormProps {
  className?: string;
}

export function ContactForm({ className = "" }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_CONTACT_FORM_DATA);
  const [errors, setErrors] = useState<ContactFormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error del campo al escribir
    if (errors[name as keyof ContactFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = validateContactForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Componer el mensaje de WhatsApp estructurado con los datos limpios
    const formattedMessage = formatContactMessage(validation.cleanedValues);
    const whatsappUrl = buildWhatsAppUrl(SITE_CONFIG.phone, formattedMessage);

    // Abrir WhatsApp en nueva pestaña/app
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    // Limpieza inmediata del formulario on-click / on-submit sin esperar confirmación
    setFormData(INITIAL_CONTACT_FORM_DATA);
    setErrors({});
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`space-y-5 rounded-2xl border border-slate-200/80 bg-card p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8 ${className}`}
    >
      {/* Campo: Nombre */}
      <div>
        <label
          htmlFor="nombre"
          className="block text-sm font-semibold text-slate-900 dark:text-slate-100"
        >
          Nombre completo <span className="text-red-500">*</span>
        </label>
        <div className="mt-1.5">
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej. Juan Pérez"
            className={`w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
              errors.nombre
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-input focus:border-blue-500 focus:ring-blue-500/20"
            }`}
          />
        </div>
        {errors.nombre && (
          <p
            role="alert"
            className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
          >
            <AlertCircle className="size-3.5 shrink-0" />
            {errors.nombre}
          </p>
        )}
      </div>

      {/* Campo: Teléfono o Email */}
      <div>
        <label
          htmlFor="contacto-input"
          className="block text-sm font-semibold text-slate-900 dark:text-slate-100"
        >
          Teléfono o Correo electrónico <span className="text-red-500">*</span>
        </label>
        <div className="mt-1.5">
          <input
            id="contacto-input"
            name="contacto"
            type="text"
            value={formData.contacto}
            onChange={handleChange}
            placeholder="Ej. 11 1234-5678 o correo@ejemplo.com"
            className={`w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
              errors.contacto
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-input focus:border-blue-500 focus:ring-blue-500/20"
            }`}
          />
        </div>
        {errors.contacto && (
          <p
            role="alert"
            className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
          >
            <AlertCircle className="size-3.5 shrink-0" />
            {errors.contacto}
          </p>
        )}
      </div>

      {/* Campo: Mensaje */}
      <div>
        <label
          htmlFor="mensaje"
          className="block text-sm font-semibold text-slate-900 dark:text-slate-100"
        >
          Detalle de la consulta <span className="text-red-500">*</span>
        </label>
        <div className="mt-1.5">
          <textarea
            id="mensaje"
            name="mensaje"
            rows={4}
            value={formData.mensaje}
            onChange={handleChange}
            placeholder="Indique modelo de inyector, vehículo o síntoma que presenta el motor..."
            className={`w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
              errors.mensaje
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-input focus:border-blue-500 focus:ring-blue-500/20"
            }`}
          />
        </div>
        {errors.mensaje && (
          <p
            role="alert"
            className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
          >
            <AlertCircle className="size-3.5 shrink-0" />
            {errors.mensaje}
          </p>
        )}
      </div>

      {/* Botón de envío hacia WhatsApp */}
      <Button
        type="submit"
        variant="whatsapp"
        size="lg"
        className="h-12 w-full justify-center px-6 text-sm font-bold shadow-md"
      >
        <MessageCircle className="mr-2 size-5" />
        Enviar consulta a WhatsApp
      </Button>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Al hacer clic, se abrirá WhatsApp con el mensaje listo para enviar.
      </p>
    </form>
  );
}
