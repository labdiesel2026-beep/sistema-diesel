import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { AppError } from "../middleware/error.middleware.js";

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: string;
}

export const AUTH_COOKIE_NAME = "session";
export const AUTH_TOKEN_EXPIRATION_SECONDS = 8 * 60 * 60; // 8 horas = 28800s

/**
 * Servicio Criptográfico de Autenticación (Argon2id + JWT).
 * (RF-01, 4.1, D-08)
 */
export class AuthService {
  /**
   * Hashea una contraseña en texto plano utilizando Argon2id.
   * Configuración recomendada OWASP: 64 MB RAM, 3 iteraciones, 1 hilo paralelo.
   */
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1,
    });
  }

  /**
   * Verifica una contraseña en texto plano contra su hash almacenado.
   */
  async verifyPassword(hash: string, plainText: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plainText);
    } catch {
      return false;
    }
  }

  /**
   * Genera un token JWT firmado criptográficamente con validez de 8 horas.
   */
  generateToken(payload: AuthTokenPayload): string {
    return jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      },
      ENV.JWT_SECRET,
      {
        expiresIn: AUTH_TOKEN_EXPIRATION_SECONDS,
        algorithm: "HS256",
      }
    );
  }

  /**
   * Verifica la firma y expiración del token JWT.
   * Si el token es apócrifo o expiró, arroja AppError.unauthorized.
   */
  verifyToken(token: string): AuthTokenPayload {
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET, {
        algorithms: ["HS256"],
      }) as jwt.JwtPayload;

      if (!decoded || typeof decoded !== "object" || !decoded.id || !decoded.email || !decoded.role) {
        throw new Error("Payload incompleto");
      }

      return {
        id: decoded.id as string,
        email: decoded.email as string,
        role: decoded.role as string,
      };
    } catch {
      throw AppError.unauthorized("Sesión no válida o expirada");
    }
  }
}

export const authService = new AuthService();
export default authService;
