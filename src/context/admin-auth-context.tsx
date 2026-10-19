import { createContext, useContext, useState, type ReactNode } from "react";
import type { AdminUser } from "@/types/admin";
import { loginSchema, type LoginFormData } from "@/lib/validations/admin-schemas";

/**
 * Contexto de Autenticación Zero-Trust para el Panel de Administración (Backoffice).
 * (RF-01, RF-02, RNF-P4-01, D-01, constitution.md §4, AGENTS.MD §1, §2)
 *
 * Principio Zero-Trust:
 * - El estado de sesión y token simulado residen EXCLUSIVAMENTE en memoria volátil de React.
 * - Prohibición absoluta de interactuar con localStorage o sessionStorage.
 * - Al refrescar la página (F5) o cerrar la pestaña, la sesión se destruye por diseño.
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
  user: AdminUser | null;
  login: (credentials: LoginFormData) => Promise<LoginResult>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  const login = async (credentials: LoginFormData): Promise<LoginResult> => {
    // 1. Validación Fail-Fast de los datos de entrada
    const parseResult = loginSchema.safeParse(credentials);
    if (!parseResult.success) {
      return {
        success: false,
        error: "Datos de acceso inválidos",
      };
    }

    const { email, password } = parseResult.data;

    // 2. Verificación de credenciales fijas demo (Mock de autenticación)
    if (email.toLowerCase() === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setUser({
        id: DEMO_ADMIN_USER_ID,
        email: DEMO_ADMIN_EMAIL,
        role: "admin",
      });
      return { success: true };
    }

    // 3. Error opaco (no revela si falló email o password, constitution.md §6)
    return {
      success: false,
      error: "Credenciales incorrectas",
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
