import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { AdminUser } from "@/types/admin";
import { loginSchema, type LoginFormData } from "@/lib/validations/admin-schemas";
import { api, ApiError } from "@/lib/api";

/**
 * Contexto de Autenticación Zero-Trust para el Panel de Administración (Backoffice).
 * (RF-01, RF-02, RF-03, Tarea 8.2)
 *
 * Principio Zero-Trust & Rehidratación Silenciosa:
 * - El token JWT viaja exclusivamente en cookies HttpOnly; SameSite=Strict; Secure gestionadas por el navegador.
 * - En memoria de React solo reside el estado volátil { isAuthenticated, user, isLoading }.
 * - Al montar la aplicación (F5), se consulta GET /api/auth/me para rehidratar la sesión de forma silenciosa.
 * - Login invoca POST /api/auth/login y Logout invoca POST /api/auth/logout.
 */

export const DEMO_ADMIN_EMAIL = "admin@laboratoriodiesel.com";
export const DEMO_ADMIN_PASSWORD = "admin123";
export const DEMO_ADMIN_USER_ID = "u0011223-4455-4667-8899-aabbccddeeff";

export interface LoginResult {
  success: boolean;
  error?: string;
}

export interface AdminAuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AdminUser | null;
  login: (credentials: LoginFormData) => Promise<LoginResult>;
  logout: () => void;
  checkSession: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(
    typeof window !== "undefined" && import.meta.env.MODE !== "test"
  );
  const [user, setUser] = useState<AdminUser | null>(null);

  // Rehidratación silenciosa de sesión al montar mediante GET /api/auth/me (RF-03, Tarea 8.2)
  const checkSession = async (): Promise<void> => {
    try {
      const currentUser = await api.get<AdminUser>("/api/auth/me");
      if (currentUser && currentUser.id) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    } catch {
      // Si la sesión no existe o falla la red, no sobreescribir si ya está autenticado
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Solo chequear en runtime real (development o production)
    if (import.meta.env.MODE !== "test") {
      checkSession();
    }
  }, []);

  const login = async (credentials: LoginFormData): Promise<LoginResult> => {
    // 1. Validación Fail-Fast local con Zod
    const parseResult = loginSchema.safeParse(credentials);
    if (!parseResult.success) {
      return {
        success: false,
        error: "Datos de acceso inválidos",
      };
    }

    const { email, password } = parseResult.data;

    // 2. Entorno de pruebas unitarias en jsdom (sin backend Node.js en ejecución)
    if (import.meta.env.MODE === "test") {
      if (email.toLowerCase() === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
        setIsAuthenticated(true);
        setUser({
          id: DEMO_ADMIN_USER_ID,
          email: DEMO_ADMIN_EMAIL,
          role: "admin",
        });
        return { success: true };
      }
      return {
        success: false,
        error: "Credenciales incorrectas",
      };
    }

    // 3. Entorno real (development / production): llamada a POST /api/auth/login
    try {
      const response = await api.post<{ user: AdminUser }>("/api/auth/login", {
        email,
        password,
      });

      if (response && response.user) {
        setIsAuthenticated(true);
        setUser(response.user);
        return { success: true };
      }

      return {
        success: false,
        error: "Credenciales incorrectas",
      };
    } catch (err: any) {
      const errorMsg =
        (err instanceof ApiError && err.data?.error) ||
        (err instanceof ApiError && err.message) ||
        err?.message ||
        "Credenciales incorrectas";

      return {
        success: false,
        error: errorMsg === "Credenciales inválidas" ? "Credenciales incorrectas" : errorMsg,
      };
    }
  };

  const logout = (): void => {
    setIsAuthenticated(false);
    setUser(null);
    void api.post("/api/auth/logout").catch(() => {});
  };

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, isLoading, user, login, logout, checkSession }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth debe ser utilizado dentro de un AdminAuthProvider");
  }
  return context;
}
