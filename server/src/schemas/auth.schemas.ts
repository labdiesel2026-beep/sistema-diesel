import { z } from "zod";

/**
 * Esquema de validación para inicio de sesión de administradores.
 * (RF-01, 4.2)
 *
 * Aplica .strict() para anular propiedades imprevistas.
 */
export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "El correo electrónico es obligatorio")
      .email("Formato de correo electrónico inválido"),
    password: z.string().min(1, "La contraseña es obligatoria"),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;
