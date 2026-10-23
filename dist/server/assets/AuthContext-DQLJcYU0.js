import { n as api, t as ApiError } from "./api-DBBCsKQc.js";
import { a as loginSchema } from "./admin-schemas-ItK5u1ge.js";
import { t as useUnsavedChangesWarning } from "./useUnsavedChangesWarning-0e1WhFuU.js";
import { createContext, useContext, useEffect, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
//#region src/lib/api-client.ts
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
var BASE_URL = ({
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/",
	"VITE_API_URL": "http://18.226.138.129/api",
	"VITE_CONTACT_WHATSAPP": "5492657659108"
}["VITE_API_URL"] || "http://localhost:3001").replace(/\/+$/, "");
var REFRESH_ENDPOINT = `${BASE_URL.endsWith("/api") ? BASE_URL.slice(0, -4) : BASE_URL}/api/auth/refresh`;
var isRefreshing = false;
var failedQueue = [];
var retainedRequests = [];
/**
* Obtiene copia de las solicitudes retenidas en memoria
*/
function getRetainedRequests() {
	return [...retainedRequests];
}
/**
* Limpia la lista de solicitudes retenidas
*/
function clearRetainedRequests() {
	retainedRequests = [];
}
/**
* Registra una solicitud fallida en la lista de retención preservando FormData y File
*/
function retainRequest(config) {
	if (!retainedRequests.some((r) => r.config === config)) retainedRequests.push({
		url: config.url,
		method: config.method,
		data: config.data,
		headers: config.headers,
		config
	});
}
/**
* Re-ejecuta todas las solicitudes retenidas tras login exitoso en el modal
*/
async function retryRetainedRequests() {
	const requests = [...retainedRequests];
	clearRetainedRequests();
	const results = [];
	for (const req of requests) {
		const retryConfig = {
			...req.config,
			_retry: false
		};
		results.push(await apiClient.request(retryConfig));
	}
	return results;
}
/**
* Procesa la cola de peticiones en espera tras completar o fallar el refresh
*/
var processQueue = (error = null) => {
	failedQueue.forEach((prom) => {
		if (error) prom.reject(error);
		else prom.resolve(apiClient.request(prom.config));
	});
	failedQueue = [];
};
/**
* Instancia canónica de Axios con credenciales forzadas y Anti-CSRF
*/
var apiClient = axios.create({
	baseURL: BASE_URL,
	withCredentials: true,
	headers: { "X-Requested-With": "XMLHttpRequest" }
});
/**
* Verifica si un error corresponde a una falla de red local o desconexión física (Caso Límite 11)
*/
function isNetworkError(error) {
	if (!error || typeof error !== "object") return false;
	const err = error;
	if (err.isNetworkError) return true;
	if (typeof navigator !== "undefined" && !navigator.onLine) return true;
	if (err.code === "ERR_INTERNET_DISCONNECTED" || err.code === "ERR_NETWORK") return true;
	if (typeof err.message === "string" && err.message.toLowerCase().includes("network error")) return true;
	if (!err.response && Boolean(err.request || err.code)) return true;
	return false;
}
apiClient.interceptors.request.use((config) => {
	config.withCredentials = true;
	if (config.headers) config.headers.set("X-Requested-With", "XMLHttpRequest");
	return config;
}, (error) => Promise.reject(error));
apiClient.interceptors.response.use((response) => response, async (error) => {
	const originalRequest = error.config;
	if (isNetworkError(error)) {
		error.isNetworkError = true;
		try {
			toast.error("Error de conexión de red. Verifique su conexión e intente nuevamente.");
		} catch {}
		if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("network:disconnect", { detail: {
			code: error.code || "ERR_NETWORK",
			message: error.message || "Error de conexión de red"
		} }));
		return Promise.reject(error);
	}
	if (error.response?.status === 401 && originalRequest) {
		if (originalRequest.url?.includes("/api/auth/login") || originalRequest.url?.includes("/api/auth/refresh")) return Promise.reject(error);
		if (originalRequest._retry) {
			retainRequest(originalRequest);
			if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("SHOW_REAUTH_MODAL", { detail: {
				failedRequest: originalRequest,
				data: originalRequest.data,
				retainedRequests: getRetainedRequests()
			} }));
			return Promise.reject(error);
		}
		if (isRefreshing) return new Promise((resolve, reject) => {
			failedQueue.push({
				resolve,
				reject,
				config: originalRequest
			});
		});
		originalRequest._retry = true;
		isRefreshing = true;
		try {
			await axios.post(REFRESH_ENDPOINT, {}, {
				withCredentials: true,
				headers: { "X-Requested-With": "XMLHttpRequest" }
			});
			isRefreshing = false;
			processQueue(null);
			return apiClient.request(originalRequest);
		} catch (refreshError) {
			isRefreshing = false;
			const refreshStatus = refreshError.response?.status;
			if (isNetworkError(refreshError)) {
				try {
					toast.error("Error de conexión de red. Verifique su conexión e intente nuevamente.");
				} catch {}
				processQueue(refreshError);
				return Promise.reject(refreshError);
			}
			if (refreshStatus === 500) {
				try {
					toast.error("Error de comunicación temporal. Reintente.");
				} catch {}
				processQueue(refreshError);
				return Promise.reject(refreshError);
			}
			if (refreshStatus === 401 || refreshStatus === 403) {
				retainRequest(originalRequest);
				for (const item of failedQueue) retainRequest(item.config);
				if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("SHOW_REAUTH_MODAL", { detail: {
					failedRequest: originalRequest,
					data: originalRequest.data,
					retainedRequests: getRetainedRequests()
				} }));
				processQueue(refreshError);
				return Promise.reject(refreshError);
			}
			processQueue(refreshError);
			return Promise.reject(refreshError);
		}
	}
	return Promise.reject(error);
});
var AUTH_CHANNEL_NAME = "auth_channel";
var AUTH_STORAGE_SYNC_KEY = "auth_sync_event";
var AdminAuthContext = createContext(null);
/**
* Emite eventos de sincronización multi-pestaña usando BroadcastChannel con fallback a storage
*/
function broadcastAuthEvent(message) {
	if (typeof BroadcastChannel !== "undefined") try {
		const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
		channel.postMessage(message);
		channel.close();
		return;
	} catch {}
	if (typeof window !== "undefined" && typeof localStorage !== "undefined") try {
		localStorage.setItem(AUTH_STORAGE_SYNC_KEY, JSON.stringify(message));
		localStorage.removeItem(AUTH_STORAGE_SYNC_KEY);
	} catch {}
}
/**
* Diálogo modal estrictamente bloqueante de re-autenticación en caliente (TASK-24)
*/
function ReauthModal({ isOpen, onSuccess, currentUserEmail }) {
	const { login } = useAdminAuth();
	const [email, setEmail] = useState(currentUserEmail || "admin@laboratoriodiesel.com");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);
	useEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e) => {
			if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
			}
		};
		window.addEventListener("keydown", handleKeyDown, true);
		return () => window.removeEventListener("keydown", handleKeyDown, true);
	}, [isOpen]);
	if (!isOpen) return null;
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (isSubmitting) return;
		setIsSubmitting(true);
		setErrorMessage(null);
		try {
			const result = await login({
				email,
				password
			});
			if (result.success) {
				onSuccess();
				broadcastAuthEvent({
					type: "SESSION_RESTORED",
					timestamp: Date.now()
				});
				try {
					await retryRetainedRequests();
				} catch {}
			} else setErrorMessage(result.error || "Credenciales incorrectas. Verifique e intente nuevamente.");
		} catch (err) {
			setErrorMessage(err?.message || "Credenciales incorrectas");
		} finally {
			setIsSubmitting(false);
		}
	};
	return /* @__PURE__ */ jsx("div", {
		"data-testid": "reauth-modal",
		className: "fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none",
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "reauth-modal-title",
		onClick: (e) => e.stopPropagation(),
		children: /* @__PURE__ */ jsxs("div", {
			className: "w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-gray-200 text-gray-900 animate-in fade-in zoom-in-95 duration-200",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3 border-b border-gray-100 pb-4 mb-4",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex size-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 shrink-0",
						children: /* @__PURE__ */ jsx(Lock, { className: "size-5" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
						id: "reauth-modal-title",
						className: "text-lg font-bold text-gray-900",
						children: "Sesión Expirada"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-gray-500",
						children: "Re-autentíquese para reanudar el trabajo y guardar sus cambios"
					})] })]
				}),
				errorMessage && /* @__PURE__ */ jsxs("div", {
					role: "alert",
					"data-testid": "reauth-error-message",
					className: "mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200",
					children: [/* @__PURE__ */ jsx(AlertCircle, { className: "size-4 shrink-0" }), /* @__PURE__ */ jsx("span", { children: errorMessage })]
				}),
				/* @__PURE__ */ jsxs("form", {
					onSubmit: handleSubmit,
					className: "space-y-4",
					autoComplete: "off",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							htmlFor: "reauth-email",
							className: "block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1",
							children: "Correo Electrónico"
						}), /* @__PURE__ */ jsx("input", {
							id: "reauth-email",
							type: "email",
							required: true,
							autoComplete: "off",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500",
							placeholder: "admin@laboratoriodiesel.com"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							htmlFor: "reauth-password",
							className: "block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1",
							children: "Contraseña"
						}), /* @__PURE__ */ jsx("input", {
							id: "reauth-password",
							type: "password",
							required: true,
							autoComplete: "current-password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500",
							placeholder: "••••••••"
						})] }),
						/* @__PURE__ */ jsx("div", {
							className: "pt-2",
							children: /* @__PURE__ */ jsx("button", {
								type: "submit",
								"data-testid": "reauth-submit-btn",
								disabled: isSubmitting,
								className: "w-full flex items-center justify-center gap-2 rounded-md bg-[#ea580c] py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-[#c2410c] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm",
								children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }), /* @__PURE__ */ jsx("span", { children: "Verificando y re-transmitiendo..." })] }) : /* @__PURE__ */ jsx("span", { children: "Reanudar Sesión y Guardar" })
							})
						})
					]
				})
			]
		})
	});
}
function AdminAuthProvider({ children }) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(typeof window !== "undefined" && true);
	const [user, setUser] = useState(null);
	const [isReauthModalOpen, setReauthModalOpen] = useState(false);
	useUnsavedChangesWarning(false, isReauthModalOpen);
	useEffect(() => {
		let channel = null;
		const handleAuthMessage = (data) => {
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
		if (typeof BroadcastChannel !== "undefined") try {
			channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
			channel.onmessage = (event) => {
				handleAuthMessage(event.data);
			};
		} catch {}
		const handleStorage = (event) => {
			if (event.key === "auth_sync_event" && event.newValue) try {
				const parsed = JSON.parse(event.newValue);
				handleAuthMessage(parsed);
			} catch {}
		};
		if (typeof window !== "undefined") window.addEventListener("storage", handleStorage);
		return () => {
			if (channel) try {
				channel.close();
			} catch {}
			if (typeof window !== "undefined") window.removeEventListener("storage", handleStorage);
		};
	}, []);
	useEffect(() => {
		const handleShowReauthModal = () => {
			setReauthModalOpen(true);
		};
		if (typeof window !== "undefined") window.addEventListener("SHOW_REAUTH_MODAL", handleShowReauthModal);
		return () => {
			if (typeof window !== "undefined") window.removeEventListener("SHOW_REAUTH_MODAL", handleShowReauthModal);
		};
	}, []);
	const checkSession = async () => {
		try {
			const currentUser = await api.get("http://localhost:3001/api/auth/me", { credentials: "include" });
			if (currentUser && currentUser.id) {
				setUser(currentUser);
				setIsAuthenticated(true);
			}
		} catch {} finally {
			setIsLoading(false);
		}
	};
	useEffect(() => {
		checkSession();
	}, []);
	const login = async (credentials) => {
		const parseResult = loginSchema.safeParse(credentials);
		if (!parseResult.success) return {
			success: false,
			error: "Datos de acceso inválidos"
		};
		const { email, password } = parseResult.data;
		try {
			const response = await api.post("http://localhost:3001/api/auth/login", {
				email,
				password
			}, { credentials: "include" });
			if (response && response.user) {
				setIsAuthenticated(true);
				setUser(response.user);
				return { success: true };
			}
			return {
				success: false,
				error: "Credenciales incorrectas"
			};
		} catch (err) {
			const errorMsg = err instanceof ApiError && err.data?.error || err instanceof ApiError && err.message || err?.message || "Credenciales incorrectas";
			return {
				success: false,
				error: errorMsg === "Credenciales inválidas" ? "Credenciales incorrectas" : errorMsg
			};
		}
	};
	const logout = () => {
		setIsAuthenticated(false);
		setUser(null);
		setReauthModalOpen(false);
		broadcastAuthEvent({
			type: "SESSION_REVOKED",
			timestamp: Date.now()
		});
		api.post("http://localhost:3001/api/auth/logout", void 0, { credentials: "include" }).catch(() => {});
	};
	return /* @__PURE__ */ jsxs(AdminAuthContext.Provider, {
		value: {
			isAuthenticated,
			isLoading,
			user,
			login,
			logout,
			checkSession,
			isReauthModalOpen,
			setReauthModalOpen
		},
		children: [children, isReauthModalOpen && /* @__PURE__ */ jsx(ReauthModal, {
			isOpen: isReauthModalOpen,
			onSuccess: () => setReauthModalOpen(false),
			currentUserEmail: user?.email
		})]
	});
}
function useAdminAuth() {
	const context = useContext(AdminAuthContext);
	if (!context) throw new Error("useAdminAuth debe ser utilizado dentro de un AdminAuthProvider");
	return context;
}
//#endregion
export { useAdminAuth as n, AdminAuthProvider as t };
