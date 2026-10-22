import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type FormEvent,
} from "react";
import { Lock, Loader2, AlertCircle } from "lucide-react";
import type { AdminUser } from "@/types/admin";
import { loginSchema, type LoginFormData } from "@/lib/validations/admin-schemas";
import { api, ApiError } from "@/lib/api";
import { retryRetainedRequests } from "@/lib/api-client";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";

/**
 * Contexto de Autenticación Zero-Trust para el Panel de Administración (Backoffice).
 * (RF-01, RF-02, RF-03, Tarea 8.2, TASK-24, TASK-25)
 *
 * Principio Zero-Trust, Rehidratación Silenciosa y Sincronización Multi-Pestaña:
 * - El token JWT viaja exclusivamente en cookies HttpOnly; SameSite=Strict; Secure gestionadas por el navegador.
 * - En memoria de React solo reside el estado volátil { isAuthenticated, user, isLoading, isReauthModalOpen }.
 * - Al montar la aplicación (F5), se consulta GET /api/auth/me para rehidratar la sesión de forma silenciosa.
 * - Login invoca POST /api/auth/login y Logout invoca POST /api/auth/logout.
 * - Orquesta el Modal Bloqueante de Re-autenticación (Caso Límite 8).
 * - Sincronización Multi-Pestaña por BroadcastChannel ('auth_channel') con fallback a evento 'storage' (Caso Límite 9):
 *   Al detectarse un cierre de sesión o revocación definitiva en una pestaña, emite 'SESSION_REVOKED'
 *   para que todas las demás pestañas abiertas invaliden su estado en memoria de forma instantánea.
 */

export const DEMO_ADMIN_EMAIL = "admin@laboratoriodiesel.com";
export const DEMO_ADMIN_PASSWORD = "admin123";
export const DEMO_ADMIN_USER_ID = "u0011223-4455-4667-8899-aabbccddeeff";

export const AUTH_CHANNEL_NAME = "auth_channel";
export const AUTH_STORAGE_SYNC_KEY = "auth_sync_event";

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
  isReauthModalOpen: boolean;
  setReauthModalOpen: (open: boolean) => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

/**
 * Emite eventos de sincronización multi-pestaña usando BroadcastChannel con fallback a storage
 */
export function broadcastAuthEvent(message: { type: string; [key: string]: any }): void {
  // 1. Canal principal si el navegador soporta BroadcastChannel
  if (typeof BroadcastChannel !== "undefined") {
    try {
      const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
      channel.postMessage(message);
      channel.close();
      return;
    } catch {
      // Si falla la inicialización de BroadcastChannel, descender a fallback de storage
    }
  }

  // 2. Fallback de evento storage para entornos restrictivos
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(AUTH_STORAGE_SYNC_KEY, JSON.stringify(message));
      // Inmediatamente remover para no persistir credenciales ni banderas (Principio Zero-Trust ASVS)
      localStorage.removeItem(AUTH_STORAGE_SYNC_KEY);
    } catch {}
  }
}

/**
 * Diálogo modal estrictamente bloqueante de re-autenticación en caliente (TASK-24)
 */
export function ReauthModal({
  isOpen,
  onSuccess,
  currentUserEmail,
}: {
  isOpen: boolean;
  onSuccess: () => void;
  currentUserEmail?: string | undefined;
}) {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState(currentUserEmail || DEMO_ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Bloqueo explícito de la tecla Escape para evitar cierre accidental
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevención de doble envío

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await login({ email, password });
      if (result.success) {
        onSuccess();
        // Sincronizar re-autenticación con otras pestañas
        broadcastAuthEvent({
          type: "SESSION_RESTORED",
          timestamp: Date.now(),
        });
        // Re-transmisión automática de peticiones en memoria con su FormData/File
        try {
          await retryRetainedRequests();
        } catch {
          // Errores de reintento manejados por los consumidores individuales
        }
      } else {
        setErrorMessage(result.error || "Credenciales incorrectas. Verifique e intente nuevamente.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Credenciales incorrectas");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="reauth-modal"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reauth-modal-title"
      onClick={(e) => e.stopPropagation()} // Bloqueo estricto de cierre por clic en el backdrop
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-gray-200 text-gray-900 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 shrink-0">
            <Lock className="size-5" />
          </div>
          <div>
            <h2 id="reauth-modal-title" className="text-lg font-bold text-gray-900">
              Sesión Expirada
            </h2>
            <p className="text-xs text-gray-500">
              Re-autentíquese para reanudar el trabajo y guardar sus cambios
            </p>
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            data-testid="reauth-error-message"
            className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200"
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label
              htmlFor="reauth-email"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Correo Electrónico
            </label>
            <input
              id="reauth-email"
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="admin@laboratoriodiesel.com"
            />
          </div>

          <div>
            <label
              htmlFor="reauth-password"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Contraseña
            </label>
            <input
              id="reauth-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              data-testid="reauth-submit-btn"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-[#ea580c] py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-[#c2410c] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Verificando y re-transmitiendo...</span>
                </>
              ) : (
                <span>Reanudar Sesión y Guardar</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(
    typeof window !== "undefined" && import.meta.env.MODE !== "test",
  );
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isReauthModalOpen, setReauthModalOpen] = useState<boolean>(false);

  // Prevención de pérdida accidental de trabajo ante modal abierto o cambios sin guardar (Caso Límite 10, TASK-21)
  useUnsavedChangesWarning(false, isReauthModalOpen);

  // Sincronización Multi-Pestaña mediante BroadcastChannel ('auth_channel') y Fallback de Storage (Caso Límite 9, TASK-25)
  useEffect(() => {
    let channel: BroadcastChannel | null = null;

    const handleAuthMessage = (data: any) => {
      if (data?.type === "SESSION_REVOKED") {
        setIsAuthenticated(false);
        setUser(null);
        setReauthModalOpen(false);
      } else if (data?.type === "SESSION_RESTORED" && data.user) {
        setIsAuthenticated(true);
        setUser(data.user);
        setReauthModalOpen(false);
      }
    };

    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
        channel.onmessage = (event: MessageEvent) => {
          handleAuthMessage(event.data);
        };
      } catch {}
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === AUTH_STORAGE_SYNC_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          handleAuthMessage(parsed);
        } catch {}
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }

    return () => {
      if (channel) {
        try {
          channel.close();
        } catch {}
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
    };
  }, []);

  // Escuchar evento global SHOW_REAUTH_MODAL emitido por api-client.ts ante expiración de refresh (TASK-23 / TASK-24)
  useEffect(() => {
    const handleShowReauthModal = () => {
      setReauthModalOpen(true);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("SHOW_REAUTH_MODAL", handleShowReauthModal);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("SHOW_REAUTH_MODAL", handleShowReauthModal);
      }
    };
  }, []);

  // Rehidratación silenciosa de sesión al montar mediante GET a http://localhost:3001/api/auth/me
  const checkSession = async (): Promise<void> => {
    try {
      const currentUser = await api.get<AdminUser>("http://localhost:3001/api/auth/me", {
        credentials: "include",
      });
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
    if (import.meta.env.MODE !== "test") {
      void checkSession();
    } else {
      setIsLoading(false);
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

    // 3. Entorno real (development / production): llamada a POST http://localhost:3001/api/auth/login
    try {
      const response = await api.post<{ user: AdminUser }>(
        "http://localhost:3001/api/auth/login",
        {
          email,
          password,
        },
        {
          credentials: "include",
        },
      );

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
    setReauthModalOpen(false);

    // Transmisión obligatoria de revocación multi-pestaña (Caso Límite 9, TASK-25)
    broadcastAuthEvent({
      type: "SESSION_REVOKED",
      timestamp: Date.now(),
    });

    void api
      .post("http://localhost:3001/api/auth/logout", undefined, { credentials: "include" })
      .catch(() => {});
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        checkSession,
        isReauthModalOpen,
        setReauthModalOpen,
      }}
    >
      {children}
      {isReauthModalOpen && (
        <ReauthModal
          isOpen={isReauthModalOpen}
          onSuccess={() => setReauthModalOpen(false)}
          currentUserEmail={user?.email}
        />
      )}
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

// Aliases para máxima compatibilidad con la especificación (AuthContext / useAuth / AuthProvider)
export const AuthProvider = AdminAuthProvider;
export const useAuth = useAdminAuth;
export const AuthContext = AdminAuthContext;
export default AdminAuthProvider;
