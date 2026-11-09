/**
 * Cliente HTTP Centralizado basado en Axios (TASK-22 / TASK-23)
 *
 * Configuración de Seguridad Zero-Trust y Manejo Resiliente de Red:
 * - Base URL dinámica desde `import.meta.env.VITE_API_URL` (por defecto: http://localhost:3001)
 * - Transmisión obligatoria global de cookies HttpOnly (`withCredentials: true`) — Principio 4
 * - Cabecera estricta Anti-CSRF (`X-Requested-With: XMLHttpRequest`)
 * - Captura en interceptor de excepciones de red local (`ERR_INTERNET_DISCONNECTED`, `ERR_NETWORK`,
 *   fallos de DNS o desconexión física sin código HTTP de respuesta — Caso Límite 11).
 * - Ciclo de Intercepción y Refresh Silencioso JWT (Caso Límite 8, TASK-23):
 *   1. Captura HTTP 401 en peticiones protegidas y encola peticiones concurrentes.
 *   2. Invoca POST /api/auth/refresh con withCredentials: true.
 *   3. Si responde 200 OK, reintenta transparentemente la petición original y la cola.
 *   4. Si responde 500, no revoca la sesión y notifica error temporal de comunicación.
 *   5. Si responde 401/403 (sesión expirada definitivamente), retiene la petición fallida
 *      (incluyendo FormData y binarios File) y emite el evento global SHOW_REAUTH_MODAL.
 */

import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

const rawBaseUrl = (
  (import.meta.env?.["VITE_API_URL"] as string | undefined) || "http://localhost:3001"
)
  .trim()
  .replace(/\/+$/, "");

export const API_ORIGIN: string = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl.slice(0, -4)
  : rawBaseUrl;

export const BASE_URL: string = API_ORIGIN;
export const REFRESH_ENDPOINT: string = `${API_ORIGIN}/api/auth/refresh`;

export interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export interface RetainedRequest {
  url?: string | undefined;
  method?: string | undefined;
  data?: unknown;
  headers?: unknown;
  config: InternalAxiosRequestConfig;
}

interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  config: InternalAxiosRequestConfig;
}

// Variables de estado del ciclo de refresh silencioso
let isRefreshing = false;
let failedQueue: QueueItem[] = [];
let retainedRequests: RetainedRequest[] = [];

/**
 * Obtiene copia de las solicitudes retenidas en memoria
 */
export function getRetainedRequests(): RetainedRequest[] {
  return [...retainedRequests];
}

/**
 * Limpia la lista de solicitudes retenidas
 */
export function clearRetainedRequests(): void {
  retainedRequests = [];
}

/**
 * Registra una solicitud fallida en la lista de retención preservando FormData y File
 */
export function retainRequest(config: InternalAxiosRequestConfig): void {
  const alreadyExists = retainedRequests.some((r) => r.config === config);
  if (!alreadyExists) {
    retainedRequests.push({
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
      config,
    });
  }
}

/**
 * Re-ejecuta todas las solicitudes retenidas tras login exitoso en el modal
 */
export async function retryRetainedRequests(): Promise<unknown[]> {
  const requests = [...retainedRequests];
  clearRetainedRequests();
  const results: unknown[] = [];
  for (const req of requests) {
    const retryConfig: CustomRequestConfig = {
      ...req.config,
      _retry: false,
    };
    results.push(await apiClient.request(retryConfig));
  }
  return results;
}

/**
 * Procesa la cola de peticiones en espera tras completar o fallar el refresh
 */
const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(apiClient.request(prom.config));
    }
  });
  failedQueue = [];
};

/**
 * Instancia canónica de Axios con credenciales forzadas y Anti-CSRF
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

/**
 * Verifica si un error corresponde a una falla de red local o desconexión física (Caso Límite 11)
 */
export function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as AxiosError & { isNetworkError?: boolean };
  if (err.isNetworkError) return true;
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  if (err.code === "ERR_INTERNET_DISCONNECTED" || err.code === "ERR_NETWORK") return true;
  if (typeof err.message === "string" && err.message.toLowerCase().includes("network error")) {
    return true;
  }
  if (!err.response && Boolean(err.request || err.code)) return true;
  return false;
}

// Interceptor de Peticiones: Garantizar flags de seguridad en cada despacho
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.withCredentials = true;
    if (config.headers) {
      config.headers.set("X-Requested-With", "XMLHttpRequest");
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de Respuestas: Manejo de Red (Caso Límite 11) y Refresh Silencioso (Caso Límite 8, TASK-23)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { isNetworkError?: boolean }) => {
    const originalRequest = error.config as CustomRequestConfig | undefined;

    // 1. Detección de fallos de red local sin código de respuesta HTTP (Caso Límite 11)
    if (isNetworkError(error)) {
      error.isNetworkError = true;

      try {
        toast.error("Error de conexión de red. Verifique su conexión e intente nuevamente.");
      } catch {
        // Entornos sin soporte de Sonner
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("network:disconnect", {
            detail: {
              code: error.code || "ERR_NETWORK",
              message: error.message || "Error de conexión de red",
            },
          }),
        );
      }

      return Promise.reject(error);
    }

    // 2. Manejo de Expiración de Sesión HTTP 401 (Caso Límite 8, TASK-23)
    const status = error.response?.status;
    if (status === 401 && originalRequest) {
      const isAuthEndpoint =
        originalRequest.url?.includes("/api/auth/login") ||
        originalRequest.url?.includes("/api/auth/refresh");

      // Si la petición era hacia auth login o refresh, no reintentar refresh
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      // Si ya fue reintentada y vuelve a fallar con 401: sesión expirada definitivamente
      if (originalRequest._retry) {
        retainRequest(originalRequest);
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("SHOW_REAUTH_MODAL", {
              detail: {
                failedRequest: originalRequest,
                data: originalRequest.data,
                retainedRequests: getRetainedRequests(),
              },
            }),
          );
        }
        return Promise.reject(error);
      }

      // Si ya hay un refresh en curso, encolar petición pendiente
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Ejecutar refresh silencioso contra /api/auth/refresh con withCredentials: true
        await axios.post(
          REFRESH_ENDPOINT,
          {},
          {
            withCredentials: true,
            headers: {
              "X-Requested-With": "XMLHttpRequest",
            },
          },
        );

        // Refresh 200 OK: Reintentar transparentemente la original y liberar la cola
        isRefreshing = false;
        processQueue(null);
        return apiClient.request(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        const refreshStatus = axios.isAxiosError(refreshError)
          ? refreshError.response?.status
          : undefined;

        // Falla de red durante refresh: mantener sesión y notificar
        if (isNetworkError(refreshError)) {
          try {
            toast.error("Error de conexión de red. Verifique su conexión e intente nuevamente.");
          } catch {
            // Silenciar error si toast no está disponible
          }
          processQueue(refreshError);
          return Promise.reject(refreshError);
        }

        // Falla de Servidor HTTP 500 en Refresh: no revocar sesión y notificar error temporal
        if (refreshStatus === 500) {
          try {
            toast.error("Error de comunicación temporal. Reintente.");
          } catch {
            // Silenciar error si toast no está disponible
          }
          processQueue(refreshError);
          return Promise.reject(refreshError);
        }

        // Falla HTTP 401/403 en Refresh: Sesión expirada definitivamente
        if (refreshStatus === 401 || refreshStatus === 403) {
          retainRequest(originalRequest);
          for (const item of failedQueue) {
            retainRequest(item.config);
          }

          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("SHOW_REAUTH_MODAL", {
                detail: {
                  failedRequest: originalRequest,
                  data: originalRequest.data,
                  retainedRequests: getRetainedRequests(),
                },
              }),
            );
          }

          processQueue(refreshError);
          return Promise.reject(refreshError);
        }

        processQueue(refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
