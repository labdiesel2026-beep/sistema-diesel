import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";
import {
  authService,
  AUTH_COOKIE_NAME,
  AUTH_TOKEN_EXPIRATION_SECONDS,
} from "../services/auth.service.js";
import { ENV } from "../config/env.js";
import type { LoginInput } from "../schemas/auth.schemas.js";

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
  req: Request<{}, {}, LoginInput>,
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
    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: AUTH_TOKEN_EXPIRATION_SECONDS * 1000, // 28800s en ms
    });

    res.status(200).json({
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
    res.cookie(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
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
