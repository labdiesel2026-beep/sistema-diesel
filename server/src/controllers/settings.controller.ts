import type { Request, Response, NextFunction } from "express";
import { settingsService } from "../services/settings.service.js";
import type { UpdateWhatsAppInput } from "../schemas/settings.schemas.js";

/**
 * Obtiene las configuraciones públicas de la tienda (WhatsApp comercial, etc.)
 * Endpoint: GET /api/settings/public
 * Acceso: Público
 */
export async function getPublicSettings(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await settingsService.getWhatsAppSetting();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * Actualiza el número de WhatsApp comercial de la tienda.
 * Endpoint: PUT/POST /api/settings/whatsapp
 * Acceso: Protegido por requireAuth y csrfProtection
 */
export async function updateWhatsApp(
  req: Request<Record<string, never>, Record<string, never>, UpdateWhatsAppInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { whatsappNumber } = req.body;
    const result = await settingsService.setWhatsAppSetting(whatsappNumber);

    res.status(200).json({
      success: true,
      whatsappNumber: result.whatsappNumber,
      whatsappDisplay: result.whatsappDisplay,
      message: "Número de WhatsApp actualizado exitosamente",
    });
  } catch (error) {
    next(error);
  }
}

