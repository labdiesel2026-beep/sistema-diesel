/**
 * Cliente HTTP Centralizado para consumo de API REST en Node.js (Fase 5 - Tarea 8.1)
 *
 * Configuración de Seguridad Zero-Trust:
 * - Base URL dinámica desde `import.meta.env.VITE_API_URL` (por defecto: http://localhost:3001)
 * - Transmisión obligatoria de cookies de sesión HttpOnly (`credentials: 'include'`)
 * - Cabecera estricta anti-CSRF (`X-Requested-With: XMLHttpRequest`)
 * - Tratamiento diferenciado de Content-Type (JSON vs FormData multipart)
 * - Clase de error tipada ApiError con preservación de status HTTP y payload del backend.
 */

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const rawBaseUrl = (
  (import.meta.env?.["VITE_API_URL"] as string | undefined) || "http://localhost:3001"
)
  .trim()
  .replace(/\/+$/, "");

// Base del servidor sin /api final para endpoints generales y subidas
export const API_ORIGIN: string = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl.slice(0, -4)
  : rawBaseUrl;

export const BASE_URL: string = API_ORIGIN;

/**
 * Emite evento global de desautorización para abrir el modal de re-autenticación
 */
export function dispatchUnauthorized(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("SHOW_REAUTH_MODAL"));
  }
}

// Token JWT en memoria volátil (Zero-Trust ASVS / OWASP: prohibido almacenar en localStorage/sessionStorage)
let inMemoryToken: string | null = null;

export function setAuthToken(token: string | null): void {
  inMemoryToken = token;
}

export function getAuthToken(): string | null {
  return inMemoryToken;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions & { body?: any; isFormData?: boolean } = {},
): Promise<T> {
  const { params, body, isFormData, headers: customHeaders, ...customOptions } = options;

  // 1. Construir URL y Query Params
  let url: string;
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    url = endpoint;
  } else {
    let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    // Si la ruta no inicia con /api ni con rutas raíz de servidor (/uploads, /health), prefijar /api
    if (
      !cleanEndpoint.startsWith("/api") &&
      !cleanEndpoint.startsWith("/uploads") &&
      !cleanEndpoint.startsWith("/health")
    ) {
      cleanEndpoint = `/api${cleanEndpoint}`;
    }
    url = `${API_ORIGIN}${cleanEndpoint}`;
  }

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  // 2. Cabeceras por defecto y Anti-CSRF
  const headers = new Headers(customHeaders);
  const method = (customOptions.method || "GET").toUpperCase();

  // Inyección obligatoria de cabecera Anti-CSRF para peticiones mutables y peticiones seguras
  headers.set("X-Requested-With", "XMLHttpRequest");

  // Inyección de token de autorización Bearer si existe en memoria y no fue provisto manualmente
  const token = inMemoryToken;
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!isFormData && body && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // 3. Preparar cuerpo de la petición
  let formattedBody: BodyInit | null = null;
  if (isFormData || body instanceof FormData) {
    formattedBody = body;
  } else if (body !== undefined) {
    formattedBody = JSON.stringify(body);
  }

  // 4. Ejecutar fetch con inclusión obligatoria de credenciales/cookies
  const fetchInit: RequestInit = {
    ...customOptions,
    method,
    headers,
    credentials: customOptions.credentials || "include", // Mandatorio para cookies HttpOnly (RF-01, RF-03)
  };

  if (formattedBody !== null) {
    fetchInit.body = formattedBody;
  }

  const response = await fetch(url, fetchInit);

  // 5. Procesar respuesta
  const contentType = response.headers.get("content-type");
  let responseData: any = null;

  if (contentType && contentType.includes("application/json")) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    try {
      responseData = await response.text();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    // Manejo de expiración de sesión (401) con silent refresh
    if (response.status === 401) {
      const isAuthEndpoint =
        url.includes("/api/auth/login") ||
        url.includes("/api/auth/refresh");

      if (!isAuthEndpoint && !(customOptions as any)?._retry) {
        try {
          const refreshHeaders = new Headers();
          refreshHeaders.set("X-Requested-With", "XMLHttpRequest");
          if (inMemoryToken) {
            refreshHeaders.set("Authorization", `Bearer ${inMemoryToken}`);
          }

          const refreshRes = await fetch(`${API_ORIGIN}/api/auth/refresh`, {
            method: "POST",
            headers: refreshHeaders,
            credentials: "include",
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData?.token) {
              setAuthToken(refreshData.token);
            }
            return request<T>(endpoint, {
              ...options,
              headers: customHeaders,
              ...customOptions,
              _retry: true,
            } as any);
          }
        } catch {
          // Fallo de silent refresh
        }

        dispatchUnauthorized();
      } else {
        dispatchUnauthorized();
      }
    }

    const errorMessage =
      (responseData &&
        typeof responseData === "object" &&
        (responseData.error || responseData.message)) ||
      `Error HTTP ${response.status}: ${response.statusText}`;

    throw new ApiError(errorMessage, response.status, responseData);
  }

  return responseData as T;
}

export const api = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "GET" });
  },

  post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "POST", body });
  },

  put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "PUT", body });
  },

  patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "PATCH", body });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },

  upload<T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
      isFormData: true,
    });
  },
};

export { resolveImageUrl, formatARS, type ImageOptimizationOptions } from "./formatters";

export default api;
