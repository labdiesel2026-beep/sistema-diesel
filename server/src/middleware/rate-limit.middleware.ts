import rateLimit from "express-rate-limit";

/**
 * Limitador estricto para endpoints de autenticación (/api/auth/*).
 * (RF-01, 4.4, D-11)
 *
 * Máximo 5 intentos por ventana de 15 minutos por dirección IP.
 * Bloquea intentos de fuerza bruta respondiendo HTTP 429 Too Many Requests.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  handler: (_req, res) => {
    res.status(429).json({
      error: "Demasiados intentos de autenticación. Intente nuevamente en 15 minutos.",
    });
  },
});

export const UPLOAD_RATE_LIMIT_MAX = 60;

/**
 * Limitador dedicado para la tubería de carga de imágenes (/api/uploads/*).
 * (RF-04, 4.4, D-11, Fase 14 RF-01)
 *
 * Máximo 60 cargas por ventana de 15 minutos por dirección IP.
 * Permite carga administrativa fluida de inventario mitigando ataques de saturación o Pixel Flood.
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: UPLOAD_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  handler: (_req, res) => {
    res.status(429).json({
      error: "Límite de subida de imágenes excedido. Intente nuevamente en 15 minutos.",
    });
  },
});

export default {
  authRateLimiter,
  uploadRateLimiter,
};
