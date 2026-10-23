import * as React from "react";
import { jsx } from "react/jsx-runtime";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
//#region src/lib/utils.ts
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region src/components/ui/button.tsx
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			industrial: "bg-industrial text-white hover:bg-industrial-hover active:scale-[0.98] rounded-xl font-semibold shadow-xs transition-all",
			whatsapp: "bg-whatsapp text-whatsapp-foreground ring-1 ring-emerald-400/20 shadow-sm hover:brightness-105 active:scale-[0.98] rounded-xl transition-all duration-200",
			technical: "border border-border/80 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl",
			default: "bg-industrial text-white shadow-xs hover:bg-industrial-hover active:scale-[0.98] transition-all",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			ghost: "border border-border/60 dark:border-white/10 bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-white/5 dark:hover:border-white/25 dark:hover:text-foreground transition-all duration-300 ease-out",
			link: "text-industrial underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ jsx(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
//#endregion
//#region src/lib/api.ts
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
var ApiError = class extends Error {
	status;
	data;
	constructor(message, status, data) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.data = data;
	}
};
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
	"VITE_API_URL": "http://77.113.218.167/api",
	"VITE_CONTACT_WHATSAPP": "5492657659108"
}["VITE_API_URL"] || "http://localhost:3001").replace(/\/+$/, "");
async function request(endpoint, options = {}) {
	const { params, body, isFormData, headers: customHeaders, ...customOptions } = options;
	let url;
	if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) url = endpoint;
	else url = `${BASE_URL.endsWith("/api") ? BASE_URL.slice(0, -4) : BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
	if (params) {
		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) if (value !== void 0 && value !== null) searchParams.append(key, String(value));
		const queryString = searchParams.toString();
		if (queryString) url += (url.includes("?") ? "&" : "?") + queryString;
	}
	const headers = new Headers(customHeaders);
	const method = (customOptions.method || "GET").toUpperCase();
	headers.set("X-Requested-With", "XMLHttpRequest");
	if (!isFormData && body && !(body instanceof FormData)) headers.set("Content-Type", "application/json");
	let formattedBody = null;
	if (isFormData || body instanceof FormData) formattedBody = body;
	else if (body !== void 0) formattedBody = JSON.stringify(body);
	const fetchInit = {
		...customOptions,
		method,
		headers,
		credentials: customOptions.credentials || "include"
	};
	if (formattedBody !== null) fetchInit.body = formattedBody;
	const response = await fetch(url, fetchInit);
	const contentType = response.headers.get("content-type");
	let responseData = null;
	if (contentType && contentType.includes("application/json")) try {
		responseData = await response.json();
	} catch {
		responseData = null;
	}
	else try {
		responseData = await response.text();
	} catch {
		responseData = null;
	}
	if (!response.ok) throw new ApiError(responseData && typeof responseData === "object" && (responseData.error || responseData.message) || `Error HTTP ${response.status}: ${response.statusText}`, response.status, responseData);
	return responseData;
}
var api = {
	get(endpoint, options) {
		return request(endpoint, {
			...options,
			method: "GET"
		});
	},
	post(endpoint, body, options) {
		return request(endpoint, {
			...options,
			method: "POST",
			body
		});
	},
	put(endpoint, body, options) {
		return request(endpoint, {
			...options,
			method: "PUT",
			body
		});
	},
	patch(endpoint, body, options) {
		return request(endpoint, {
			...options,
			method: "PATCH",
			body
		});
	},
	delete(endpoint, options) {
		return request(endpoint, {
			...options,
			method: "DELETE"
		});
	},
	upload(endpoint, formData, options) {
		return request(endpoint, {
			...options,
			method: "POST",
			body: formData,
			isFormData: true
		});
	}
};
function resolveImageUrl(imagePath) {
	if (!imagePath) return "";
	if (imagePath.startsWith("data:") || imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
	return `${BASE_URL}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
}
//#endregion
export { cn as a, Button as i, api as n, resolveImageUrl as r, ApiError as t };
