/**
 * Utilidades puras para sanitización de teléfonos y construcción de URLs
 * de la API de WhatsApp (wa.me) conforme al estándar RFC 3986.
 * (RF-04, RF-06, RF-07, CL-04, CL-07)
 */

/**
 * Normaliza un número telefónico eliminando cualquier carácter que no sea numérico
 * (espacios, guiones, paréntesis, signo +, etc.).
 *
 * @param rawPhone Cadena con el número telefónico original
 * @returns Número telefónico limpio únicamente con dígitos
 * @throws Error si el número resultante contiene menos de 8 dígitos
 */
export function sanitizePhoneNumber(rawPhone: string): string {
  if (!rawPhone || typeof rawPhone !== "string") {
    throw new Error("El número de teléfono debe ser una cadena no vacía.");
  }

  const sanitized = rawPhone.replace(/\D/g, "");

  if (sanitized.length < 8) {
    throw new Error(
      `El número de teléfono configurado para WhatsApp es inválido (mínimo 8 dígitos): "${rawPhone}"`,
    );
  }

  return sanitized;
}

/**
 * Construye una URL canónica universal para WhatsApp Web y app móvil (https://wa.me/<NUMERO>?text=<MENSAJE>).
 * Aplica codificación URI segura (RFC 3986) preservando emojis, saltos de línea y caracteres especiales.
 *
 * @param phone Número telefónico (puede venir formateado o crudo)
 * @param message Mensaje en texto plano
 * @returns URL canónica https://wa.me/...
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const sanitizedPhone = sanitizePhoneNumber(phone);
  const trimmedMessage = (message ?? "").trim();

  if (!trimmedMessage) {
    return `https://wa.me/${sanitizedPhone}`;
  }

  const encodedMessage = encodeURIComponent(trimmedMessage);
  return `https://wa.me/${sanitizedPhone}?text=${encodedMessage}`;
}

/**
 * Da formato al mensaje pre-estructurado del formulario de contacto (RF-06).
 */
export function formatContactMessage(data: {
  nombre: string;
  contacto: string;
  mensaje: string;
}): string {
  const cleanNombre = (data.nombre ?? "").trim();
  const cleanContacto = (data.contacto ?? "").trim();
  const cleanMensaje = (data.mensaje ?? "").trim();

  return `Hola, me contacto desde la web de Laboratorio Diésel.\nNombre: ${cleanNombre}\nContacto: ${cleanContacto}\nConsulta: ${cleanMensaje}`;
}
