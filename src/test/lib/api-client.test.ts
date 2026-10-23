import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  apiClient,
  isNetworkError,
  getRetainedRequests,
  clearRetainedRequests,
  REFRESH_ENDPOINT,
} from "@/lib/api-client";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

interface InterceptorHandler {
  fulfilled: (value: any) => any;
  rejected: (error: any) => any;
}

const getResponseHandler = (): InterceptorHandler =>
  (apiClient.interceptors.response as any).handlers[0];

const getRequestHandler = (): InterceptorHandler =>
  (apiClient.interceptors.request as any).handlers[0];

describe("TASK-22: apiClient - Configuración withCredentials y Manejo de Red", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearRetainedRequests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("garantiza que withCredentials está configurado en true por defecto (Principio 4)", () => {
    expect(apiClient.defaults.withCredentials).toBe(true);
  });

  it("configura la cabecera Anti-CSRF X-Requested-With", () => {
    expect(apiClient.defaults.headers["X-Requested-With"]).toBe("XMLHttpRequest");
  });

  it("detecta correctamente excepciones de red mediante isNetworkError", () => {
    const disconnectedError = new AxiosError("Disconnection", "ERR_INTERNET_DISCONNECTED");
    expect(isNetworkError(disconnectedError)).toBe(true);

    const networkError = new AxiosError("Network Error", "ERR_NETWORK");
    expect(isNetworkError(networkError)).toBe(true);

    const noResponseError = new AxiosError("Failed to fetch");
    noResponseError.request = {};
    expect(isNetworkError(noResponseError)).toBe(true);

    const http401Error = new AxiosError("Unauthorized", "401");
    http401Error.response = {
      status: 401,
      statusText: "Unauthorized",
      data: { error: "Referencia: uuid-123" },
      headers: {},
      config: {} as any,
    };
    expect(isNetworkError(http401Error)).toBe(false);
  });

  it("captura ERR_INTERNET_DISCONNECTED, emite toast y evento sin arrojar 401 (Caso Límite 11)", async () => {
    const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

    const error = new AxiosError("Internet disconnected", "ERR_INTERNET_DISCONNECTED");
    error.request = {};

    const responseHandler = getResponseHandler();

    await expect(responseHandler.rejected(error)).rejects.toMatchObject({
      code: "ERR_INTERNET_DISCONNECTED",
      isNetworkError: true,
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Error de conexión de red. Verifique su conexión e intente nuevamente.",
    );

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "network:disconnect",
      }),
    );
  });

  it("captura fallo sin código HTTP (request existe, response es undefined)", async () => {
    const error = new AxiosError("Network Error");
    error.request = { responseURL: "http://localhost:3001/api/admin/products" };

    const responseHandler = getResponseHandler();

    await expect(responseHandler.rejected(error)).rejects.toMatchObject({
      isNetworkError: true,
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Error de conexión de red. Verifique su conexión e intente nuevamente.",
    );
  });

  it("asegura que el interceptor de request inyecta withCredentials: true y X-Requested-With", async () => {
    const requestHandler = getRequestHandler();
    const headersMap = new axios.AxiosHeaders();
    const config = {
      headers: headersMap,
      withCredentials: false,
    };

    const result = await requestHandler.fulfilled(config as any);
    expect(result.withCredentials).toBe(true);
    expect(result.headers.get("X-Requested-With")).toBe("XMLHttpRequest");
  });
});

describe("TASK-23: Interceptor Axios para Refresh Silencioso JWT (Caso Límite 8)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearRetainedRequests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("1. Si la petición fallida devuelve 401, invoca POST /api/auth/refresh con withCredentials: true y reintenta la original tras 200 OK", async () => {
    // Mock de axios.post para simular refresh exitoso
    const axiosPostSpy = vi.spyOn(axios, "post").mockResolvedValueOnce({
      status: 200,
      data: { success: true },
    });

    // Mock de apiClient para el reintento de la petición original
    const apiClientSpy = vi.spyOn(apiClient, "request").mockResolvedValueOnce({
      status: 200,
      data: { id: "p123", name: "Inyector Bosch 0445" },
    });

    // Petición original fallida con 401
    const originalConfig = {
      url: "/api/admin/products",
      method: "POST",
      data: { name: "Inyector Bosch" },
      headers: new axios.AxiosHeaders(),
    };

    const error401 = new AxiosError("Unauthorized", "401");
    error401.config = originalConfig as any;
    error401.response = {
      status: 401,
      statusText: "Unauthorized",
      data: { error: "Referencia: uuid-401" },
      headers: {},
      config: originalConfig as any,
    };

    const responseHandler = getResponseHandler();

    const result = await responseHandler.rejected(error401);

    // Verifica que se invocó POST a REFRESH_ENDPOINT con withCredentials: true
    expect(axiosPostSpy).toHaveBeenCalledWith(
      REFRESH_ENDPOINT,
      {},
      expect.objectContaining({
        withCredentials: true,
        headers: expect.objectContaining({
          "X-Requested-With": "XMLHttpRequest",
        }),
      }),
    );

    // Verifica que se reintentó la petición original
    expect(result).toBeDefined();
  });

  it("2. Si el refresh responde 500, no revoca la sesión y notifica error temporal de comunicación", async () => {
    const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

    // Mock de axios.post devolviendo 500 en refresh
    const error500 = new AxiosError("Internal Server Error", "500");
    error500.response = {
      status: 500,
      statusText: "Internal Server Error",
      data: { error: "Referencia: uuid-500" },
      headers: {},
      config: {} as any,
    };
    vi.spyOn(axios, "post").mockRejectedValueOnce(error500);

    const originalConfig = {
      url: "/api/admin/products",
      method: "GET",
      headers: new axios.AxiosHeaders(),
    };

    const error401 = new AxiosError("Unauthorized", "401");
    error401.config = originalConfig as any;
    error401.response = {
      status: 401,
      statusText: "Unauthorized",
      data: { error: "Referencia: uuid-401" },
      headers: {},
      config: originalConfig as any,
    };

    const responseHandler = getResponseHandler();

    await expect(responseHandler.rejected(error401)).rejects.toMatchObject({
      response: { status: 500 },
    });

    // Se notifica formalmente el error temporal de comunicación
    expect(toast.error).toHaveBeenCalledWith("Error de comunicación temporal. Reintente.");

    // NO debe emitirse SHOW_REAUTH_MODAL ante 500 temporal
    expect(dispatchEventSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: "SHOW_REAUTH_MODAL",
      }),
    );
  });

  it("3. Si el refresh responde 401/403 (sesión expirada definitivamente), retiene la petición fallida con FormData/File y emite SHOW_REAUTH_MODAL", async () => {
    const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

    // Mock de axios.post devolviendo 401 en refresh (refresh token inválido o expirado)
    const refreshExpiredError = new AxiosError("Unauthorized", "401");
    refreshExpiredError.response = {
      status: 401,
      statusText: "Unauthorized",
      data: { error: "Referencia: uuid-refresh-expired" },
      headers: {},
      config: {} as any,
    };
    vi.spyOn(axios, "post").mockRejectedValueOnce(refreshExpiredError);

    // Petición con FormData y archivo binario simulado
    const formData = new FormData();
    formData.append("codigo_oem", "0445110001");
    const mockFile = new File(["dummy content"], "inyector.jpg", { type: "image/jpeg" });
    formData.append("file", mockFile);

    const originalConfig = {
      url: "/api/admin/products",
      method: "POST",
      data: formData,
      headers: new axios.AxiosHeaders(),
    };

    const error401 = new AxiosError("Unauthorized", "401");
    error401.config = originalConfig as any;
    error401.response = {
      status: 401,
      statusText: "Unauthorized",
      data: { error: "Referencia: uuid-401" },
      headers: {},
      config: originalConfig as any,
    };

    const responseHandler = getResponseHandler();

    await expect(responseHandler.rejected(error401)).rejects.toMatchObject({
      response: { status: 401 },
    });

    // Verifica que se emitió el evento SHOW_REAUTH_MODAL
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "SHOW_REAUTH_MODAL",
      }),
    );

    // Verifica que la petición fallida fue retenida en memoria con su FormData intacto
    const retained = getRetainedRequests();
    expect(retained.length).toBeGreaterThan(0);
    const firstRetained = retained[0]!;
    expect(firstRetained.url).toBe("/api/admin/products");
    expect(firstRetained.data).toBe(formData);
    expect(firstRetained.data.get("codigo_oem")).toBe("0445110001");
    expect(firstRetained.data.get("file")).toBe(mockFile);
  });

  it("4. No dispara refresh recursivo si la petición que falló con 401 era /api/auth/login", async () => {
    const axiosPostSpy = vi.spyOn(axios, "post");

    const loginConfig = {
      url: "/api/auth/login",
      method: "POST",
      data: { email: "wrong@email.com", password: "bad" },
      headers: new axios.AxiosHeaders(),
    };

    const loginError = new AxiosError("Unauthorized", "401");
    loginError.config = loginConfig as any;
    loginError.response = {
      status: 401,
      statusText: "Unauthorized",
      data: { error: "Credenciales inválidas" },
      headers: {},
      config: loginConfig as any,
    };

    const responseHandler = getResponseHandler();

    await expect(responseHandler.rejected(loginError)).rejects.toMatchObject({
      response: { status: 401 },
    });

    // No debe haber intentado invocar el refresh
    expect(axiosPostSpy).not.toHaveBeenCalled();
  });

  it("5. Encola peticiones concurrentes mientras el refresh está en progreso y las reintenta tras 200 OK", async () => {
    let resolveRefreshPromise: (value: any) => void;
    const refreshPromise = new Promise((resolve) => {
      resolveRefreshPromise = resolve;
    });

    vi.spyOn(axios, "post").mockReturnValueOnce(refreshPromise as any);
    const apiClientSpy = vi.spyOn(apiClient, "request").mockResolvedValue({
      status: 200,
      data: { success: true },
    } as any);

    const responseHandler = getResponseHandler();

    const error1 = new AxiosError("Unauthorized", "401");
    error1.config = { url: "/api/admin/products", headers: new axios.AxiosHeaders() } as any;
    error1.response = { status: 401, headers: {}, data: {} } as any;

    const error2 = new AxiosError("Unauthorized", "401");
    error2.config = { url: "/api/admin/metrics", headers: new axios.AxiosHeaders() } as any;
    error2.response = { status: 401, headers: {}, data: {} } as any;

    // Disparar error1 (inicia refresh)
    const p1 = responseHandler.rejected(error1);

    // Disparar error2 mientras refresh sigue en vuelo (se encola en failedQueue)
    const p2 = responseHandler.rejected(error2);

    // Resolver refresh con 200 OK
    resolveRefreshPromise!({ status: 200, data: { ok: true } });

    await Promise.all([p1, p2]);

    // Ambas peticiones deben haber sido reintentadas
    expect(apiClientSpy).toHaveBeenCalledTimes(2);
  });
});

