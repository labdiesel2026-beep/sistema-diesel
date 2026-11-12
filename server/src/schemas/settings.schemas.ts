import { z } from "zod";

/**
 * Esquema de validación para actualizar el número de WhatsApp comercial.
 * Limpia cualquier caracter no numérico y verifica longitud válida de 8 a 20 dígitos.
 */
export const updateWhatsAppSchema = z
  .object({
    whatsappNumber: z
      .string()
      .trim()
      .min(1, "El número de WhatsApp es obligatorio")
      .transform((val) => val.replace(/\D/g, ""))
      .refine((val) => val.length >= 8 && val.length <= 20, {
        message: "El número de WhatsApp debe contener entre 8 y 20 dígitos numéricos",
      }),
  })
  .strict();

export type UpdateWhatsAppInput = z.infer<typeof updateWhatsAppSchema>;

