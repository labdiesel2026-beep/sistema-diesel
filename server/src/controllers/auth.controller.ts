import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";
import {
  authService,
  AUTH_COOKIE_NAME,
  AUTH_TOKEN_EXPIRATION_SECONDS,
} from "../services/auth.service.js";
import { ENV } from "../config/env.js";
import type { LoginInput, ChangePasswordInput } from "../schemas/auth.schemas.js";

/**
 * Controlador de Inicio de Sesión de Administradores.
 * (RF-01, 4.1)
 *
 * Endpoint: POST /api/auth/login
 * - Valida credenciales contra la base de datos (PostgreSQL vía Prisma y Argon2id).
 * - Si las credenciales fallan, responde 401 Unauthorized con mensaje genérico ("Credenciales inválidas").
 * - Si las credenciales son válidas, emite cookie HttpOnly con JWT firmado (8h)
 *   y retorna el usuario { id, email, role }.
 */
export async function login(
  req: Request<Record<string, never>, Record<string, never>, LoginInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = req.body;

    // Buscar administrador por correo electrónico
    const user = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    // Verificar hash con Argon2id
    const isValid = await authService.verifyPassword(user.passwordHash, password);
    if (!isValid) {
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    // Generar token JWT con payload mínimo
    const token = authService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Configurar cookie de sesión con directivas de máxima seguridad (RF-01, 4.1)
    const sameSitePolicy = ENV.COOKIE_SAME_SITE;
    const isSecure = ENV.NODE_ENV === "production" || sameSitePolicy === "none";

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSitePolicy,
      path: "/",
      maxAge: AUTH_TOKEN_EXPIRATION_SECONDS * 1000, // 28800s en ms
    });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Destruye la sesión de usuario purgando la cookie HttpOnly.
 * (RF-02)
 *
 * Endpoint: POST /api/auth/logout
 */
export async function logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sameSitePolicy = ENV.COOKIE_SAME_SITE;
    const isSecure = ENV.NODE_ENV === "production" || sameSitePolicy === "none";

    res.cookie(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSitePolicy,
      path: "/",
      maxAge: 0,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}

/**
 * Renovación silenciosa de sesión (JWT Refresh).
 * (RF-01, TASK-23)
 *
 * Endpoint: POST /api/auth/refresh
 * - Verifica token existente desde cookie HttpOnly o cabecera Authorization: Bearer.
 * - Si es válido y el usuario existe en BD, emite nuevo token y renueva la cookie.
 * - Si expiró o es inválido, responde 401 Unauthorized.
 */
export async function refresh(req: Request, res: Response, _next: NextFunction): Promise<void> {
  try {
    let token = req.cookies?.[AUTH_COOKIE_NAME];
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.slice(7).trim();
    }

    if (!token) {
      res.status(401).json({ error: "Sesión no válida o expirada" });
      return;
    }

    const payload = authService.verifyToken(token);

    const user = await prisma.adminUser.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      res.status(401).json({ error: "Usuario no encontrado o dado de baja" });
      return;
    }

    const newToken = authService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const sameSitePolicy = ENV.COOKIE_SAME_SITE;
    const isSecure = ENV.NODE_ENV === "production" || sameSitePolicy === "none";

    res.cookie(AUTH_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSitePolicy,
      path: "/",
      maxAge: AUTH_TOKEN_EXPIRATION_SECONDS * 1000,
    });

    res.status(200).json({
      token: newToken,
      user,
    });
  } catch {
    res.status(401).json({ error: "Sesión no válida o expirada" });
  }
}

/**
 * Rehidratación de sesión silenciosa (Perfil del administrador autenticado).
 * (RF-03)
 *
 * Endpoint: GET /api/auth/me
 * Protegido por requireAuth. Recupera la entidad desde PostgreSQL mediante req.user.id.
 */
export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Sesión no válida o expirada" });
      return;
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: "Usuario no encontrado o dado de baja" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

/**
 * Actualiza la contraseña del administrador autenticado.
 * (RF-01, ASVS V5)
 *
 * Endpoint: PUT/POST /api/auth/change-password
 * - Protegido por requireAuth y csrfProtection.
 * - Verifica contraseña actual mediante Argon2id.
 * - Hashea y actualiza la nueva contraseña si es válida.
 */
export async function changePassword(
  req: Request<Record<string, never>, Record<string, never>, ChangePasswordInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Sesión no válida o expirada" });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    const user = await prisma.adminUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(401).json({ error: "Usuario no encontrado o dado de baja" });
      return;
    }

    const isValid = await authService.verifyPassword(user.passwordHash, currentPassword);
    if (!isValid) {
      res.status(400).json({ error: "La contraseña actual es incorrecta" });
      return;
    }

    const newPasswordHash = await authService.hashPassword(newPassword);

    await prisma.adminUser.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    res.status(200).json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    next(error);
  }
}
