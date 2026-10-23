import { a as cn, i as Button, r as resolveImageUrl } from "./api-Db5K75is.js";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-BJoneSxt.js";
import * as React from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { z } from "zod";
import { ArrowLeft, ArrowRight, ArrowUp, Check, CheckCircle2, FileText, MapPin, Menu, ShieldCheck, Truck, X } from "lucide-react";
//#region src/lib/cart-storage.ts
/**
* Módulo de Almacenamiento Efímero en localStorage para el Carrito de Consultas.
* (Spec 003, RF-08, RNF-05, RNF-07, docs/constitution.md §5, Tarea T-06)
*
* Principio 5: localStorage es exclusivamente caché no autoritativa de intención de compra.
* Fail-Fast Zod: Todo dato leído de localStorage se valida estrictamente. Si está corrupto
* o la versión no es reconocida, se purga de inmediato y se retorna un carrito vacío.
*/
var CART_STORAGE_KEY = "laboratorio_diesel_cart_cache_v1";
/**
* Esquema Zod estricto para un ítem almacenado en la caché del carrito.
*/
var cartItemCacheSchema = z.object({
	productId: z.string().uuid("Identificador UUID de producto inválido"),
	quantity: z.number().int("La cantidad debe ser un número entero").positive("La cantidad debe ser mayor a 0"),
	lastKnown: z.object({
		name: z.string().trim().min(1, "El nombre del producto no puede estar vacío"),
		oem: z.string().trim().nullable()
	}).strict()
}).strict();
/**
* Esquema Zod estricto para el contenedor versionado de la caché del carrito.
*/
var cartCacheSchema = z.object({
	version: z.literal(1),
	items: z.array(cartItemCacheSchema)
}).strict();
function getStorage(customStorage) {
	if (customStorage) return customStorage;
	if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
	return null;
}
/**
* Lee e hidrata el estado del carrito desde localStorage.
* Si el contenido no existe, está corrupto o no cumple el esquema estricto,
* purga la clave y devuelve un estado vacío válido con versión 1.
*/
function loadCartFromStorage(customStorage) {
	const emptyState = {
		version: 1,
		items: []
	};
	const storage = getStorage(customStorage);
	if (!storage) return emptyState;
	try {
		const rawData = storage.getItem(CART_STORAGE_KEY);
		if (!rawData) return emptyState;
		const parsedJson = JSON.parse(rawData);
		const validationResult = cartCacheSchema.safeParse(parsedJson);
		if (!validationResult.success) {
			storage.removeItem(CART_STORAGE_KEY);
			return emptyState;
		}
		return validationResult.data;
	} catch {
		try {
			storage.removeItem(CART_STORAGE_KEY);
		} catch {}
		return emptyState;
	}
}
/**
* Valida y persiste la caché del carrito en localStorage.
* Acepta tanto el contenedor { version: 1, items: [...] } como un array plano de ítems.
*/
function saveCartToStorage(payload, customStorage) {
	const storage = getStorage(customStorage);
	if (!storage) return false;
	const container = Array.isArray(payload) ? {
		version: 1,
		items: payload
	} : payload;
	const validationResult = cartCacheSchema.safeParse(container);
	if (!validationResult.success) return false;
	try {
		storage.setItem(CART_STORAGE_KEY, JSON.stringify(validationResult.data));
		return true;
	} catch {
		return false;
	}
}
/**
* Elimina la clave del carrito de localStorage.
*/
function clearCartFromStorage(customStorage) {
	const storage = getStorage(customStorage);
	if (storage) try {
		storage.removeItem(CART_STORAGE_KEY);
	} catch {}
}
//#endregion
//#region src/context/catalog-cart-context.tsx
/**
* Contexto y Máquina de Estado del Carrito de Consultas (React 19).
* (Spec 003, RF-08, RF-12, Bloque 3 - Tarea T-07)
*
* Características:
* - Operaciones atómicas: add, updateQuantity, changeQuantity, remove, clear.
* - Consolida productos duplicados en una sola fila incrementando la cantidad.
* - Asegura cantidad entera mayor o igual a 1 (no permite ceros ni negativos).
* - Ausencia total de restricciones o simulaciones de inventario/stock (RF-12).
* - Sincronización automática y reactiva con la caché efímera de localStorage.
*/
var CatalogCartContext = createContext(null);
function CatalogCartProvider({ children, initialItems, storage }) {
	const [items, setItems] = useState(() => {
		if (initialItems) return initialItems;
		return loadCartFromStorage(storage).items;
	});
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	useEffect(() => {
		saveCartToStorage(items, storage);
	}, [items, storage]);
	/**
	* Agrega un producto al carrito.
	* Si ya existe, incrementa su cantidad en una única fila.
	*/
	const add = (product, quantityToAdd = 1) => {
		const safeAddQuantity = Math.max(1, Math.round(quantityToAdd));
		setItems((current) => {
			const existingIndex = current.findIndex((item) => item.productId === product.id);
			if (existingIndex >= 0) return current.map((item, index) => index === existingIndex ? {
				...item,
				quantity: item.quantity + safeAddQuantity
			} : item);
			const newItem = {
				productId: product.id,
				quantity: safeAddQuantity,
				lastKnown: {
					name: product.name.trim(),
					oem: product.oem ? product.oem.trim() : null
				}
			};
			return [...current, newItem];
		});
	};
	/**
	* Asigna una cantidad absoluta para un producto, forzando un mínimo de 1 unidad.
	*/
	const updateQuantity = (productId, quantity) => {
		const safeQuantity = Math.max(1, Math.round(quantity));
		setItems((current) => current.map((item) => item.productId === productId ? {
			...item,
			quantity: safeQuantity
		} : item));
	};
	/**
	* Modifica la cantidad de forma relativa (+1, -1), asegurando un mínimo de 1 unidad.
	*/
	const changeQuantity = (productId, delta) => {
		setItems((current) => current.map((item) => item.productId === productId ? {
			...item,
			quantity: Math.max(1, item.quantity + delta)
		} : item));
	};
	/**
	* Elimina un producto del carrito.
	*/
	const remove = (productId) => {
		setItems((current) => current.filter((item) => item.productId !== productId));
	};
	/**
	* Vacía el carrito por completo y purga el almacenamiento.
	*/
	const clear = () => {
		setItems([]);
		clearCartFromStorage(storage);
	};
	/**
	* Retorna la cantidad seleccionada de un producto o 0 si no está en el carrito.
	*/
	const getItemQuantity = (productId) => {
		const found = items.find((item) => item.productId === productId);
		return found ? found.quantity : 0;
	};
	const count = items.reduce((total, item) => total + item.quantity, 0);
	const uniqueCount = items.length;
	return /* @__PURE__ */ jsx(CatalogCartContext.Provider, {
		value: {
			items,
			count,
			uniqueCount,
			add,
			updateQuantity,
			changeQuantity,
			remove,
			clear,
			getItemQuantity,
			isDrawerOpen,
			setIsDrawerOpen
		},
		children
	});
}
/**
* Hook de acceso al contexto del carrito de catálogo.
*/
function useCatalogCart() {
	const context = useContext(CatalogCartContext);
	if (!context) throw new Error("useCatalogCart debe ser utilizado dentro de un CatalogCartProvider");
	return context;
}
//#endregion
//#region src/components/policies/policies-consent.ts
var POLICIES_STORAGE_KEY = "ld_policies_consent_v1";
var POLICIES_CONSENT_EVENT = "ld:policies-consent-changed";
/**
* Esquema Zod estricto para validar el consentimiento de políticas comerciales y de garantía.
* Cumple con el Principio 2 (Validación Estricta en Fronteras) y Principio 5 de la Constitución.
*/
var PoliciesConsentSchema = z.object({
	version: z.literal(1),
	accepted: z.boolean(),
	timestamp: z.number().positive()
}).strict();
var DEFAULT_POLICIES_CONSENT = {
	version: 1,
	accepted: false,
	timestamp: 0
};
/**
* Recupera y valida el estado de consentimiento desde localStorage.
* Si la clave no existe, o si falla la validación ante datos corruptos o versiones desactualizadas,
* purga inmediatamente la clave en localStorage (Fail-Fast) y retorna { accepted: false }.
*/
function getPoliciesConsent() {
	if (typeof window === "undefined" || !window.localStorage) return DEFAULT_POLICIES_CONSENT;
	try {
		const raw = window.localStorage.getItem(POLICIES_STORAGE_KEY);
		if (!raw) return DEFAULT_POLICIES_CONSENT;
		const json = JSON.parse(raw);
		const result = PoliciesConsentSchema.safeParse(json);
		if (result.success) return result.data;
		purgePoliciesConsent();
		return DEFAULT_POLICIES_CONSENT;
	} catch {
		try {
			purgePoliciesConsent();
		} catch {}
		return DEFAULT_POLICIES_CONSENT;
	}
}
/**
* Persiste el consentimiento en localStorage de forma segura y emite un evento personalizado
* para sincronización reactiva entre componentes de la aplicación.
*/
function savePoliciesConsent(accepted = true) {
	if (typeof window === "undefined" || !window.localStorage) return null;
	try {
		const payload = {
			version: 1,
			accepted,
			timestamp: Date.now()
		};
		window.localStorage.setItem(POLICIES_STORAGE_KEY, JSON.stringify(payload));
		if (typeof window.dispatchEvent === "function") window.dispatchEvent(new CustomEvent(POLICIES_CONSENT_EVENT, { detail: payload }));
		return payload;
	} catch (err) {
		console.warn("[policies-consent] Error al persistir en localStorage:", err);
		return null;
	}
}
/**
* Elimina la clave de consentimiento en localStorage de forma segura y notifica.
*/
function purgePoliciesConsent() {
	if (typeof window === "undefined" || !window.localStorage) return;
	try {
		window.localStorage.removeItem(POLICIES_STORAGE_KEY);
		if (typeof window.dispatchEvent === "function") window.dispatchEvent(new CustomEvent(POLICIES_CONSENT_EVENT, { detail: DEFAULT_POLICIES_CONSENT }));
	} catch {}
}
//#endregion
//#region src/components/policies/use-policies-consent.ts
/**
* Hook seguro y reactivo para consultar y actualizar el consentimiento de políticas comerciales.
* Implementa una arquitectura en dos fases (SSR / Client Mounted) para garantizar cero Hydration Mismatch (RNF-05).
*/
function usePoliciesConsent() {
	const [isMounted, setIsMounted] = useState(false);
	const [hasAccepted, setHasAccepted] = useState(true);
	const syncState = useCallback(() => {
		const consent = getPoliciesConsent();
		setHasAccepted(consent.accepted);
	}, []);
	useEffect(() => {
		setIsMounted(true);
		syncState();
		const handleSync = () => {
			syncState();
		};
		window.addEventListener(POLICIES_CONSENT_EVENT, handleSync);
		window.addEventListener("storage", handleSync);
		return () => {
			window.removeEventListener(POLICIES_CONSENT_EVENT, handleSync);
			window.removeEventListener("storage", handleSync);
		};
	}, [syncState]);
	const acceptPolicies = useCallback(() => {
		savePoliciesConsent(true);
		setHasAccepted(true);
	}, []);
	const resetPolicies = useCallback(() => {
		purgePoliciesConsent();
		setHasAccepted(false);
	}, []);
	return {
		isMounted,
		shouldShowBanner: isMounted && !hasAccepted,
		hasAccepted,
		acceptPolicies,
		resetPolicies
	};
}
//#endregion
//#region src/assets/workshop/taller-hero.webp
var taller_hero_default = "/assets/taller-hero-C6NEaO-B.webp";
//#endregion
//#region src/assets/workshop/banco-pruebas.webp
var banco_pruebas_default = "/assets/banco-pruebas-4D7k8Ixw.webp";
//#endregion
//#region src/assets/workshop/diagnostico-electronico.webp
var diagnostico_electronico_default = "/assets/diagnostico-electronico-C7aardjQ.webp";
//#endregion
//#region src/assets/workshop/inyectores-detalle.webp
var inyectores_detalle_default = "/assets/inyectores-detalle-CrqGDmIp.webp";
//#endregion
//#region src/assets/workshop/fachada-local.webp
var fachada_local_default = "/assets/fachada-local-Djapal-J.webp";
//#endregion
//#region src/config/site-config.ts
/**
* Configuración estática inmutable del sitio web de Laboratorio Diésel.
* Única fuente de verdad para datos de contacto, horarios, dirección,
* textos institucionales, servicios técnicos, marcas autorizadas,
* políticas comerciales y mensajes pre-formateados de WhatsApp (RNF-06, RF-02.2, RF-03.2, RF-04.1).
*/
var SITE_CONFIG = {
	name: "Laboratorio Diésel",
	tagline: "Especialistas en inyección diésel",
	valueProps: ["Más de 20 años en el rubro", "Equipamiento de última generación para la reparación y calibración de bombas e inyectores"],
	address: "Pres. Juan Domingo Perón 1215, Villa Mercedes, San Luis",
	businessHours: "Lunes a Viernes de 9:00 a 18:00 h",
	phone: "5492657659108",
	googleMapsEmbedUrl: "https://www.google.com/maps?q=Pres.+Juan+Domingo+Per%C3%B3n+1215,+Villa+Mercedes,+San+Luis&output=embed",
	googleMapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Pres.+Juan+Domingo+Per%C3%B3n+1215,+Villa+Mercedes,+San+Luis",
	workshopImages: {
		hero: taller_hero_default,
		bancoPruebas: banco_pruebas_default,
		diagnosticoElectronico: diagnostico_electronico_default,
		inyectoresDetalle: inyectores_detalle_default,
		fachadaLocal: fachada_local_default
	},
	navLinks: [
		{
			label: "Inicio",
			href: "#inicio"
		},
		{
			label: "Servicios",
			href: "#servicios"
		},
		{
			label: "Garantías",
			href: "#garantias"
		},
		{
			label: "Ubicación",
			href: "#ubicacion"
		}
	],
	whatsappMessages: {
		warranty: "Hola, me contacto desde la web de Laboratorio Diésel.\nMotivo: Consulta por garantía / soporte post-venta.",
		general: "Hola, me contacto desde la web de Laboratorio Diésel.\nMotivo: Consulta general / solicitar turno."
	},
	warrantyTerms: {
		title: "Garantía de Calidad y Confianza Técnica",
		summary: "Todos nuestros trabajos de reparación, calibración y recambio de inyectores cuentan con respaldo técnico garantizado.",
		details: [
			"Garantía técnica de 30 días corridos sobre mano de obra y componentes reemplazados.",
			"Pruebas de estanqueidad, entrega y retorno bajo parámetros estrictos de fabricante en banco computarizado.",
			"Atención y soporte de posventa directo a través de nuestro canal de WhatsApp para agilizar cualquier consulta técnica."
		]
	},
	services: [
		{
			id: "banco-pruebas",
			title: "Banco de Pruebas y Calibración Computarizada",
			description: "Ensayo dinámico y calibración milimétrica de caudal, retorno y curvas de presión bajo especificaciones estrictas de fabricante para bombas e inyectores diésel.",
			icon: "Gauge",
			image: banco_pruebas_default,
			badges: [
				"Banco de Pruebas Computarizado",
				"Calibración Milimétrica",
				"Tolerancia OEM"
			],
			colSpanDesktop: "lg:col-span-7"
		},
		{
			id: "bombas-inyectoras",
			title: "Servicio Integral de Bombas Inyectoras",
			description: "Diagnóstico, desarme y ajuste de bombas electrónicas, bombas lineales y bombas rotativas multimarca para utilitarios, transporte pesado y maquinaria agrícola.",
			icon: "Wrench",
			image: taller_hero_default,
			badges: ["Bombas Lineales y Rotativas", "Línea Pesada y Agrícola"],
			colSpanDesktop: "lg:col-span-5"
		},
		{
			id: "inyectores-common-rail",
			title: "Inyectores Electrónicos Common Rail",
			description: "Equipamiento y fuentes electrónicas de precisión para testear, reparar y calibrar inyectores inductivos, piezoeléctricos, bombeantes (UPS/PLD) e inyectores bomba (UIS).",
			icon: "Activity",
			image: inyectores_detalle_default,
			badges: [
				"Inductivos & Piezoeléctricos",
				"Sistemas UPS / PLD",
				"Sistemas UIS"
			],
			colSpanDesktop: "lg:col-span-6"
		},
		{
			id: "diagnostico-repuestos",
			title: "Diagnóstico Electrónico y Provisión de Repuestos",
			description: "Escaneo en tiempo real de circuitos de combustible diésel y disponibilidad permanente de toberas, válvulas y conjuntos de recambio originales y alternativos seleccionados.",
			icon: "Package",
			image: diagnostico_electronico_default,
			badges: ["Diagnóstico en Tiempo Real", "Originales & Alternativos"],
			colSpanDesktop: "lg:col-span-6"
		}
	],
	servicesTransparencyClause: "Trabajamos con repuestos legítimos de primer equipo (OEM) y líneas alternativas homologadas de máxima durabilidad, adecuándonos a la exigencia operativa de su vehículo o flota",
	workshopBrands: [
		{
			id: "bosch",
			name: "Bosch",
			subtitle: "Diesel Service"
		},
		{
			id: "zexel",
			name: "Zexel"
		},
		{
			id: "denso",
			name: "Denso"
		},
		{
			id: "siemens-vdo",
			name: "Siemens VDO"
		},
		{
			id: "delphi",
			name: "Delphi"
		},
		{
			id: "caterpillar",
			name: "Caterpillar",
			subtitle: "CAT"
		},
		{
			id: "cummins",
			name: "Cummins"
		},
		{
			id: "stanadyne",
			name: "Stanadyne"
		},
		{
			id: "diesel-kiki",
			name: "Diesel Kiki"
		},
		{
			id: "perkins",
			name: "Perkins"
		}
	],
	commercialPolicies: {
		title: "Políticas Comerciales y de Garantía",
		subtitle: "Términos operativos, validez de cotizaciones y respaldo técnico de Laboratorio Diésel",
		footerLinkText: "Políticas de Garantía y Cotización",
		axes: [
			{
				id: "cotizaciones-precios",
				number: 1,
				title: "Eje 1: Alcance de Cotizaciones y Precios Publicados",
				shortTitle: "Alcance de Cotizaciones y Precios",
				content: "Los precios exhibidos en el catálogo revisten carácter orientativo y referencial sujeto a variación cambiaria o de reposición de insumos. Toda consulta iniciada por WhatsApp o agregada al carrito representa una solicitud formal de presupuesto y asesoramiento técnico personalizado, no constituyendo en ningún caso una compra confirmada, reserva automática de stock físico ni obligación contractual exigible hasta tanto sea validada expresamente por el taller."
			},
			{
				id: "garantia-calibracion",
				number: 2,
				title: "Eje 2: Garantía de Calibración y Laboratorio",
				shortTitle: "Garantía de Calibración y Laboratorio",
				content: "Las reparaciones, calibraciones de caudal en banco computarizado e inyectores de recambio cuentan con garantía técnica de 30 días corridos sobre mano de obra y piezas reemplazadas. La validez de la garantía queda estrictamente sujeta a que el montaje en el vehículo sea ejecutado por personal idóneo, habiendo realizado la limpieza química completa del depósito y cañerías de combustible, drenaje del filtro de gasoil y sustitución de elementos filtrantes por nuevos bajo especificación original."
			},
			{
				id: "repuestos-originales-alternativos",
				number: 3,
				title: "Eje 3: Repuestos Originales y Alternativos",
				shortTitle: "Repuestos Originales y Alternativos",
				content: "Laboratorio Diésel mantiene una política de absoluta transparencia técnica. Se comercializan tanto repuestos legítimos de equipo original (OEM) de las principales marcas mundiales como líneas alternativas seleccionadas de probada confiabilidad. La procedencia, condición (nuevo o reacondicionado a nuevo) y garantía específica de cada pieza son notificadas de forma previa e inequívoca al cliente al emitir el presupuesto."
			},
			{
				id: "recepcion-envios-comisionistas",
				number: 4,
				title: "Eje 4: Recepción, Envíos y Comisionistas",
				shortTitle: "Recepción, Envíos y Comisionistas",
				content: "Para clientes, transportistas y talleres mecánicos del interior de San Luis y provincias vecinas, se ofrece recepción y despacho diario de bombas e inyectores mediante comisionistas de confianza y empresas de encomienda habilitadas. Todo envío debe ser previamente coordinado por WhatsApp indicando datos de remitente y síntomas de falla."
			}
		]
	}
};
//#endregion
//#region src/components/policies/PoliciesModal.tsx
var AXIS_ICON_MAP = {
	"cotizaciones-precios": FileText,
	"garantia-laboratorio": ShieldCheck,
	"repuestos-originales-alternativos": CheckCircle2,
	"recepcion-envios-comisionistas": Truck
};
function PoliciesModal({ open, onOpenChange }) {
	const { hasAccepted, acceptPolicies } = usePoliciesConsent();
	const handleAcceptAndClose = () => {
		acceptPolicies();
		onOpenChange(false);
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-white/10 bg-canvas p-6 shadow-2xl backdrop-blur-md ring-1 ring-orange-500/20 text-white",
			"aria-describedby": "policies-modal-description",
			children: [
				/* @__PURE__ */ jsxs(DialogHeader, {
					className: "space-y-1.5 pb-2 text-left",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-industrial",
							children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "size-4" }), "Marco Regulatorio y Comercial"]
						}),
						/* @__PURE__ */ jsx(DialogTitle, {
							className: "font-display text-2xl font-light tracking-tight text-white uppercase",
							children: "Políticas Comerciales y de Garantía"
						}),
						/* @__PURE__ */ jsx(DialogDescription, {
							id: "policies-modal-description",
							className: "text-xs text-zinc-400",
							children: "Términos técnicos, condiciones de garantía y protocolos operativos de Laboratorio Diésel."
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "my-2 max-h-[60vh] overflow-y-auto pr-2 space-y-3.5 technical-scrollbar",
					children: SITE_CONFIG.commercialPolicies.axes.map((policy) => {
						return /* @__PURE__ */ jsx("article", {
							className: "rounded-xl border border-white/10 bg-[#111111] p-4 text-white",
							children: /* @__PURE__ */ jsxs("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ jsx("div", {
									className: "flex size-9 shrink-0 items-center justify-center border border-orange-500/30 bg-orange-500/10 text-industrial",
									children: /* @__PURE__ */ jsx(AXIS_ICON_MAP[policy.id] ?? ShieldCheck, { className: "size-4" })
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h3", {
									className: "font-display text-sm font-semibold text-zinc-100",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "text-industrial mr-1.5",
										children: [
											"Eje ",
											policy.number,
											":"
										]
									}), policy.shortTitle]
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-1.5 text-xs leading-relaxed text-zinc-400",
									children: policy.content
								})] })]
							})
						}, policy.id);
					})
				}),
				/* @__PURE__ */ jsxs(DialogFooter, {
					className: "mt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-white/10 pt-4",
					children: [hasAccepted ? /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-1.5 text-xs font-semibold text-emerald-400",
						children: [/* @__PURE__ */ jsx("span", {
							className: "flex size-4 items-center justify-center rounded-full bg-emerald-950/80 border border-emerald-500/30",
							children: /* @__PURE__ */ jsx(Check, { className: "size-3 text-emerald-400" })
						}), /* @__PURE__ */ jsx("span", { children: "Políticas comerciales aceptadas previamente" })]
					}) : /* @__PURE__ */ jsx("span", {
						className: "text-xs text-zinc-500",
						children: "Al continuar, confirma haber leído los 4 ejes normativos."
					}), /* @__PURE__ */ jsx("div", {
						className: "flex items-center gap-2 justify-end",
						children: hasAccepted ? /* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "ghost",
							onClick: () => onOpenChange(false),
							className: "h-9 px-4 text-xs font-semibold rounded-none bg-transparent text-white border border-white/20 hover:bg-white/10 transition-colors",
							children: "Cerrar políticas"
						}) : /* @__PURE__ */ jsxs(Button, {
							type: "button",
							onClick: handleAcceptAndClose,
							className: "h-9 rounded-none bg-industrial px-4 text-xs font-bold text-white shadow-md hover:bg-industrial-hover active:scale-[0.98] transition-all cursor-pointer",
							children: ["Aceptar y Continuar", /* @__PURE__ */ jsx(ArrowRight, { className: "ml-1.5 size-3.5" })]
						})
					})]
				})
			]
		})
	});
}
//#endregion
//#region src/components/ui/CatalogCTAButton.tsx
/**
* Componente Unificado de Captación de Atención ("Ver Catálogo" / "Ir al catálogo").
* (Spec 010, RF-02, Módulo B, RNF-02, RNF-03)
*
* Características canónicas:
* 1. Estructura y tipografía estáticas (sin vibraciones en Navbar, Hero ni Barra Móvil).
* 2. Haz de luz interno (shimmer) diagonal a 45° con token canónico --shimmer-beam al 25% de ancho en ciclo de 5.2s
*    (4.0s de reposo + 1.2s de barrido activo con aceleración ease-in-out).
* 3. Micro-desplazamiento autónomo de flecha direccional en eje X (0px a 4px en 1.5s ease-in-out).
* 4. Suspensión al hover/focus-visible (oculta haz y fija flecha a 4px).
* 5. Feedback físico táctil: compresión scale-[0.98] en :active de escritorio.
* 6. Pausa táctil inmediata al pulsar en pantallas touch.
* 7. Suspensión automática ante inactividad de pestaña (Page Visibility API).
* 8. Cancelación total de animaciones ante 'prefers-reduced-motion: reduce'.
*/
var CatalogCTAButton = React.forwardRef(({ to = "/catalogo", label = "Ver Catálogo", children, className, size = "default", onTouchStart, onTouchEnd, onTouchCancel, ...props }, ref) => {
	const [isTabVisible, setIsTabVisible] = React.useState(true);
	const [isTouched, setIsTouched] = React.useState(false);
	React.useEffect(() => {
		const handleVisibilityChange = () => {
			setIsTabVisible(document.visibilityState === "visible" && !document.hidden);
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, []);
	const sizeClasses = {
		sm: "h-9 px-4 text-xs",
		default: "h-10 px-5 text-xs",
		lg: "h-12 px-7 text-sm"
	}[size];
	const isAnimationPaused = !isTabVisible || isTouched;
	const content = children ?? label;
	const baseClasses = cn("group relative inline-flex items-center justify-center gap-2 select-none", "overflow-hidden rounded-none border border-white/20 shadow-none", "bg-industrial text-white font-mono uppercase tracking-widest font-semibold", "hover:bg-industrial-hover hover:border-white/40", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-industrial focus-visible:ring-offset-2 focus-visible:ring-offset-black", "active:scale-[0.98] transition-all duration-200 cursor-pointer", sizeClasses, className);
	const innerContent = /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("span", {
			"aria-hidden": "true",
			className: "pointer-events-none absolute inset-0 overflow-hidden",
			children: /* @__PURE__ */ jsx("span", {
				className: cn("absolute inset-0 block pointer-events-none animate-shimmer", "bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.22)] to-transparent", isAnimationPaused && "[animation-play-state:paused]", "group-hover:opacity-0 group-focus-visible:opacity-0 group-active:opacity-0 transition-opacity duration-200"),
				style: {
					width: "200%",
					height: "200%",
					top: "-50%",
					left: "-50%"
				}
			})
		}),
		/* @__PURE__ */ jsx("span", {
			className: "relative z-10 flex items-center",
			children: content
		}),
		/* @__PURE__ */ jsx(ArrowRight, {
			"aria-hidden": "true",
			className: cn("relative z-10 size-3.5 shrink-0 transition-transform duration-200 animate-arrow", isAnimationPaused && "[animation-play-state:paused]", "group-hover:translate-x-1 group-focus-visible:translate-x-1", "group-hover:[animation-play-state:paused] group-focus-visible:[animation-play-state:paused]", "group-active:[animation-play-state:paused]")
		})
	] });
	const handleTouchStart = (e) => {
		setIsTouched(true);
		onTouchStart?.(e);
	};
	const handleTouchEnd = (e) => {
		setIsTouched(false);
		onTouchEnd?.(e);
	};
	const handleTouchCancel = (e) => {
		setIsTouched(false);
		onTouchCancel?.(e);
	};
	if (to) return /* @__PURE__ */ jsx(Link, {
		to,
		ref,
		className: baseClasses,
		onTouchStart: handleTouchStart,
		onTouchEnd: handleTouchEnd,
		onTouchCancel: handleTouchCancel,
		...props,
		children: innerContent
	});
	return /* @__PURE__ */ jsx("a", {
		ref,
		href: "#catalogo",
		className: baseClasses,
		onTouchStart: handleTouchStart,
		onTouchEnd: handleTouchEnd,
		onTouchCancel: handleTouchCancel,
		...props,
		children: innerContent
	});
});
CatalogCTAButton.displayName = "CatalogCTAButton";
//#endregion
//#region src/components/catalog/ProductImageWithFallback.tsx
/**
* Componente de Imagen de Producto con Fallback Esquematizado Técnico.
* (Spec 009, RF-11, Principio 6 de la Constitución, Bloque 2 - Tarea 2.4)
*
* Características:
* - Resuelve URLs relativas hacia el backend mediante resolveImageUrl() de api.ts.
* - Detecta ausencia de imagen o error de carga en el evento onError de forma opaca y silenciosa.
* - Renderiza un diagrama esquemático técnico vectorial de un inyector diésel en trazo fino monocrómico
*   sobre fondo mineral, eliminando fotografías de stock genéricas o iconos rotos.
* - Conserva accesibilidad semántica con role="img", aria-label y etiquetas accesibles.
*/
function ProductImageWithFallback({ src, alt, className = "size-full object-cover", fallbackClassName = "flex size-full flex-col items-center justify-center bg-card/60 p-4 text-center border-b border-border/80", loading = "lazy" }) {
	const [hasError, setHasError] = useState(false);
	useEffect(() => {
		setHasError(false);
	}, [src]);
	const resolvedUrl = resolveImageUrl(src);
	if (!resolvedUrl || hasError) return /* @__PURE__ */ jsxs("div", {
		role: "img",
		"aria-label": alt ? `Imagen no disponible para ${alt}` : "Imagen no disponible",
		className: fallbackClassName,
		"data-testid": "product-image-fallback",
		children: [
			/* @__PURE__ */ jsxs("svg", {
				xmlns: "http://www.w3.org/2000/svg",
				viewBox: "0 0 64 64",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.3",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				className: "size-14 stroke-white opacity-20 transition-opacity",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ jsx("path", { d: "M26 8h12v5H26z" }),
					/* @__PURE__ */ jsx("path", { d: "M30 4h4v4h-4z" }),
					/* @__PURE__ */ jsx("path", { d: "M28 13h8v16h-8z" }),
					/* @__PURE__ */ jsx("path", { d: "M36 17h6v4h-6" }),
					/* @__PURE__ */ jsx("path", { d: "M22 23h6v4h-6" }),
					/* @__PURE__ */ jsx("path", { d: "M28 29l2 15h4l2-15" }),
					/* @__PURE__ */ jsx("path", { d: "M30 44h4v12l-2 4-2-4v-12z" }),
					/* @__PURE__ */ jsx("line", {
						x1: "16",
						y1: "31",
						x2: "19",
						y2: "31",
						strokeDasharray: "1 1"
					}),
					/* @__PURE__ */ jsx("line", {
						x1: "45",
						y1: "31",
						x2: "48",
						y2: "31",
						strokeDasharray: "1 1"
					})
				]
			}),
			/* @__PURE__ */ jsx("span", {
				className: "mt-2.5 font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase",
				children: "Esquema Técnico Registrado"
			}),
			/* @__PURE__ */ jsx("span", {
				className: "mt-0.5 text-[10px] text-muted-foreground/60",
				children: "Imagen no disponible"
			})
		]
	});
	return /* @__PURE__ */ jsx("img", {
		src: resolvedUrl,
		alt,
		className,
		loading,
		onError: () => setHasError(true),
		"data-testid": "product-image"
	});
}
//#endregion
//#region src/lib/whatsapp-utils.ts
/**
* Utilidades puras para sanitización de teléfonos y construcción de URLs
* de la API de WhatsApp (wa.me) conforme al estándar RFC 3986.
* (RF-04, RF-06, RF-07, CL-04, CL-07)
*/
/**
* Normaliza un número telefónico eliminando cualquier carácter que no sea numérico
* (espacios, guiones, paréntesis, signo +, etc.).
*
* @param rawPhone Cadena con el número telefónico original
* @returns Número telefónico limpio únicamente con dígitos
* @throws Error si el número resultante contiene menos de 8 dígitos
*/
function sanitizePhoneNumber(rawPhone) {
	if (!rawPhone || typeof rawPhone !== "string") throw new Error("El número de teléfono debe ser una cadena no vacía.");
	const sanitized = rawPhone.replace(/\D/g, "");
	if (sanitized.length < 8) throw new Error(`El número de teléfono configurado para WhatsApp es inválido (mínimo 8 dígitos): "${rawPhone}"`);
	return sanitized;
}
/**
* Construye una URL canónica universal para WhatsApp Web y app móvil (https://wa.me/<NUMERO>?text=<MENSAJE>).
* Aplica codificación URI segura (RFC 3986) preservando emojis, saltos de línea y caracteres especiales.
*
* @param phone Número telefónico (puede venir formateado o crudo)
* @param message Mensaje en texto plano
* @returns URL canónica https://wa.me/...
*/
function buildWhatsAppUrl(phone, message) {
	const sanitizedPhone = sanitizePhoneNumber(phone);
	const trimmedMessage = (message ?? "").trim();
	if (!trimmedMessage) return `https://wa.me/${sanitizedPhone}`;
	return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(trimmedMessage)}`;
}
//#endregion
//#region src/lib/catalog-whatsapp.ts
/**
* Generador de Mensajes y URLs de Consulta para WhatsApp (wa.me).
* (Spec 003, RF-05, RF-06, RF-07, RF-09, RF-10, Bloque 4 - Tareas T-09, T-10, T-11)
*
* Utiliza el número centralizado inmutable de SITE_CONFIG.phone y
* la utilidad universal de codificación RFC 3986 buildWhatsAppUrl().
*/
/**
* Formatea un importe numérico en pesos argentinos según estándar local.
*/
function formatPrice(amount) {
	return `$${amount.toLocaleString("es-AR")} ARS`;
}
/**
* Genera la URL de WhatsApp para consultar directamente por un producto individual (RF-09).
* Asume e incluye automáticamente una cantidad de 1 unidad.
*/
function generateDirectProductWhatsAppUrl(product, brandName = "", customPhone = SITE_CONFIG.phone) {
	const priceDisplay = product.showPrice && product.price !== null ? formatPrice(product.price) : "A cotizar";
	return buildWhatsAppUrl(customPhone, [
		"Hola, me contacto desde la web de Laboratorio Diésel.",
		"Quisiera consultar por el siguiente repuesto:",
		"",
		`1x ${product.name}`,
		brandName ? `Marca: ${brandName}` : null,
		product.oem ? `Código OEM: ${product.oem}` : null,
		`Precio: ${priceDisplay}`,
		"",
		"¿Podrían confirmarme compatibilidad técnica y disponibilidad de entrega?"
	].filter((line) => line !== null).join("\n"));
}
/**
* Genera la URL de WhatsApp para enviar el pedido completo del carrito con datos enriquecidos (RF-10).
* Calcula el subtotal de productos con precio, discrimina ítems a cotizar y señala
* advertencias para ítems que requieren reconfirmación de vigencia (RF-11, RF-12).
*/
function generateCartWhatsAppUrl(enrichedItems, customPhone = SITE_CONFIG.phone, options) {
	if (!enrichedItems.length) throw new Error("El carrito no contiene productos para cotizar.");
	const lines = [
		"Hola, me contacto desde la web de Laboratorio Diésel.",
		"Quisiera solicitar cotización para los siguientes repuestos:",
		""
	];
	let subtotalPriced = 0;
	let hasQuotes = false;
	let hasReconfirmation = false;
	const quoteTag = options?.tagCotizar ? "[A Cotizar]" : "A cotizar";
	enrichedItems.forEach((item, index) => {
		let priceLabel = "";
		if (item.requiresReconfirmation) {
			priceLabel = `${quoteTag} (Requiere reconfirmación con taller)`;
			hasReconfirmation = true;
			hasQuotes = true;
		} else if (item.showPrice && item.price !== null && item.price > 0) {
			const itemTotal = item.price * item.quantity;
			subtotalPriced += itemTotal;
			priceLabel = item.quantity > 1 ? `${formatPrice(itemTotal)} (${formatPrice(item.price)} c/u)` : formatPrice(itemTotal);
		} else {
			priceLabel = quoteTag;
			hasQuotes = true;
		}
		const brandPart = item.brandName ? ` | Marca: ${item.brandName}` : "";
		const oemPart = item.oem ? ` | OEM: ${item.oem}` : "";
		lines.push(`${index + 1}. ${item.quantity}x ${item.name}${brandPart}${oemPart} -> ${priceLabel}`);
	});
	lines.push("");
	if (subtotalPriced > 0) lines.push(`Subtotal productos con precio público: ${formatPrice(subtotalPriced)}`);
	if (subtotalPriced > 0 && hasQuotes) lines.push(`*TOTAL ESTIMADO:* ${formatPrice(subtotalPriced)} + ÍTEMS A COTIZAR`);
	else if (subtotalPriced > 0) lines.push(`*TOTAL ESTIMADO:* ${formatPrice(subtotalPriced)}`);
	else lines.push("*TOTAL ESTIMADO:* PRESUPUESTO A CONFIRMAR");
	if (hasQuotes) lines.push("* Solicito cotización actualizada de los productos sin precio público.");
	if (hasReconfirmation) lines.push("⚠️ Algunos productos requieren verificar vigencia actual en taller.");
	lines.push("¿Podrían confirmarme compatibilidad técnica y disponibilidad de entrega?");
	return buildWhatsAppUrl(customPhone, lines.join("\n"));
}
/**
* Genera la URL de WhatsApp para asistir al usuario cuando la búsqueda o filtros
* no arrojaron resultados (RF-05).
* Preserva en el texto el término buscado y los filtros que estaban activos.
*/
function generateNoResultsWhatsAppUrl(searchQuery = "", activeBrandNames = [], activeCategoryNames = [], customPhone = SITE_CONFIG.phone) {
	const lines = [
		"Hola, me contacto desde la web de Laboratorio Diésel.",
		"Estuve buscando un repuesto en el catálogo pero no encontré resultados con mis criterios:",
		""
	];
	const cleanQuery = searchQuery.trim();
	if (cleanQuery) lines.push(`- Búsqueda: "${cleanQuery}"`);
	const cleanBrands = activeBrandNames.filter((b) => b && b.trim() !== "");
	if (cleanBrands.length) lines.push(`- Marcas: ${cleanBrands.join(", ")}`);
	const cleanCategories = activeCategoryNames.filter((c) => c && c.trim() !== "");
	if (cleanCategories.length) lines.push(`- Categorías: ${cleanCategories.join(", ")}`);
	if (!cleanQuery && !cleanBrands.length && !cleanCategories.length) lines.push("- Consulta general sobre repuestos diésel disponibles.");
	lines.push("");
	lines.push("¿Podrían confirmarme si disponen o pueden conseguir esta pieza o similar?");
	return buildWhatsAppUrl(customPhone, lines.join("\n"));
}
//#endregion
//#region src/components/landing/LandingFooter.tsx
function LandingFooter({ className = "", onOpenPoliciesModal }) {
	const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
	const [internalModalOpen, setInternalModalOpen] = useState(false);
	const handleOpenPolicies = () => {
		if (onOpenPoliciesModal) onOpenPoliciesModal();
		else setInternalModalOpen(true);
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("footer", {
		className: `border-t border-white/10 bg-canvas text-zinc-400 ${className}`,
		role: "contentinfo",
		children: /* @__PURE__ */ jsxs("div", {
			className: "site-container py-24 lg:py-32",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 gap-14 md:grid-cols-12 lg:gap-16",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-6 md:col-span-5",
						children: [
							/* @__PURE__ */ jsx("a", {
								href: "#inicio",
								className: "inline-block text-2xl font-medium tracking-tighter text-white transition-opacity hover:opacity-90",
								"aria-label": `${SITE_CONFIG.name} - Ir al inicio`,
								children: /* @__PURE__ */ jsxs("span", {
									className: "font-display",
									children: ["Laboratorio ", /* @__PURE__ */ jsx("span", {
										className: "text-zinc-400",
										children: "Diésel"
									})]
								})
							}),
							/* @__PURE__ */ jsx("p", {
								className: "max-w-sm text-sm leading-relaxed text-zinc-400",
								children: "Especialistas en diagnóstico, reparación y calibración de sistemas de inyección Common Rail. Tecnología de precisión y respaldo técnico para su motor."
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-start gap-3 pt-3 text-xs text-zinc-400",
								children: [/* @__PURE__ */ jsx(MapPin, { className: "mt-0.5 size-4 shrink-0 text-industrial" }), /* @__PURE__ */ jsx("span", { children: SITE_CONFIG.address })]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "md:col-span-4",
						children: [/* @__PURE__ */ jsx("h4", {
							className: "font-mono text-[10px] tracking-[0.25em] uppercase text-zinc-500",
							children: "Navegación"
						}), /* @__PURE__ */ jsx("ul", {
							className: "mt-8 space-y-3.5 text-sm",
							children: SITE_CONFIG.navLinks.map((link) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", {
								href: link.href,
								className: "transition-colors hover:text-white",
								children: link.label
							}) }, link.href))
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "md:col-span-3",
						children: [/* @__PURE__ */ jsx("h4", {
							className: "font-mono text-[10px] tracking-[0.25em] uppercase text-zinc-500",
							children: "Productos y Repuestos"
						}), /* @__PURE__ */ jsxs("ul", {
							className: "mt-8 space-y-3.5 text-sm",
							children: [
								/* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, {
									to: "/catalogo",
									className: "font-medium text-industrial transition-colors hover:text-industrial-hover hover:underline",
									children: "Explorar Catálogo Completo →"
								}) }),
								/* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", {
									href: "#garantias",
									className: "transition-colors hover:text-white",
									children: "Condiciones de Garantía"
								}) }),
								/* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", {
									href: "#ubicacion",
									className: "transition-colors hover:text-white",
									children: "Visitar Taller / Ubicación"
								}) }),
								/* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: handleOpenPolicies,
									className: "inline-flex items-center gap-1.5 text-left text-industrial transition-colors hover:text-industrial-hover hover:underline cursor-pointer",
									children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "size-3.5 shrink-0" }), /* @__PURE__ */ jsx("span", { children: SITE_CONFIG.commercialPolicies.footerLinkText })]
								}) })
							]
						})]
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-24 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-12 text-xs sm:flex-row",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-zinc-500",
						children: [
							/* @__PURE__ */ jsxs("p", { children: [
								"© ",
								currentYear,
								" ",
								SITE_CONFIG.name,
								". Todos los derechos reservados."
							] }),
							/* @__PURE__ */ jsx("span", {
								className: "hidden sm:inline",
								"aria-hidden": "true",
								children: "·"
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: handleOpenPolicies,
								className: "text-zinc-400 hover:text-white underline decoration-zinc-700 hover:decoration-zinc-400 transition-colors cursor-pointer",
								children: SITE_CONFIG.commercialPolicies.footerLinkText
							})
						]
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "font-mono text-[11px] text-[#a1a1aa] tracking-wider text-center",
						children: [
							"Desarrollada por",
							" ",
							/* @__PURE__ */ jsx("a", {
								href: "https://www.gepisoftware.com",
								target: "_self",
								rel: "noopener",
								className: "text-zinc-300 hover:text-industrial underline decoration-zinc-700 hover:decoration-industrial transition-colors",
								children: "GEPI SOFTWARE"
							})
						]
					}),
					/* @__PURE__ */ jsxs("a", {
						href: "#inicio",
						className: "inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase text-zinc-500 transition-colors hover:text-white",
						"aria-label": "Volver arriba de la página",
						children: [/* @__PURE__ */ jsx("span", { children: "Volver arriba" }), /* @__PURE__ */ jsx(ArrowUp, { className: "size-3.5" })]
					})
				]
			})]
		})
	}), !onOpenPoliciesModal && /* @__PURE__ */ jsx(PoliciesModal, {
		open: internalModalOpen,
		onOpenChange: setInternalModalOpen
	})] });
}
//#endregion
//#region src/components/landing/LandingNavbar.tsx
function LandingNavbar({ className = "", isCatalog }) {
	const [isOpen, setIsOpen] = useState(false);
	const isCatalogPage = isCatalog ?? (typeof window !== "undefined" && window.location.pathname.startsWith("/catalogo"));
	return /* @__PURE__ */ jsxs("header", {
		className: `fixed top-0 inset-x-0 z-50 w-full border-b border-white/10 bg-zinc-950/60 backdrop-blur-md transition-all ${className}`,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "site-container flex h-20 items-center justify-between gap-6",
			children: [
				isCatalogPage ? /* @__PURE__ */ jsx(Link, {
					to: "/",
					onClick: () => setIsOpen(false),
					className: "group flex items-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-white transition-opacity hover:opacity-80",
					"aria-label": `${SITE_CONFIG.name} - Volver al inicio`,
					children: /* @__PURE__ */ jsxs("span", {
						className: "font-display",
						children: ["Laboratorio ", /* @__PURE__ */ jsx("span", {
							className: "text-zinc-400",
							children: "Diésel"
						})]
					})
				}) : /* @__PURE__ */ jsx("a", {
					href: "#inicio",
					onClick: () => setIsOpen(false),
					className: "group flex items-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-white transition-opacity hover:opacity-80",
					"aria-label": `${SITE_CONFIG.name} - Ir al inicio`,
					children: /* @__PURE__ */ jsxs("span", {
						className: "font-display",
						children: ["Laboratorio ", /* @__PURE__ */ jsx("span", {
							className: "text-zinc-400",
							children: "Diésel"
						})]
					})
				}),
				/* @__PURE__ */ jsx("nav", {
					className: "hidden items-center gap-8 text-xs font-mono uppercase tracking-[0.2em] md:flex",
					"aria-label": "Navegación principal",
					children: SITE_CONFIG.navLinks.map((link) => {
						return /* @__PURE__ */ jsx("a", {
							href: isCatalogPage ? `/${link.href}` : link.href,
							className: "text-zinc-400 transition-colors hover:text-white",
							children: link.label
						}, link.href);
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "hidden items-center gap-4 md:flex",
					children: isCatalogPage ? /* @__PURE__ */ jsx(Button, {
						variant: "outline",
						asChild: true,
						className: "h-9 px-5 rounded-none border border-white/20 bg-transparent text-xs font-mono uppercase tracking-widest text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all",
						children: /* @__PURE__ */ jsxs(Link, {
							to: "/",
							children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "mr-2 size-3.5" }), "Volver al Inicio"]
						})
					}) : /* @__PURE__ */ jsx(CatalogCTAButton, {
						size: "sm",
						to: "/catalogo",
						children: "Ver Catálogo"
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex items-center md:hidden",
					children: /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setIsOpen((prev) => !prev),
						className: "inline-flex size-10 items-center justify-center border border-white/10 bg-zinc-950 text-white transition-colors hover:bg-zinc-900 focus-visible:outline-none",
						"aria-expanded": isOpen,
						"aria-label": isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación",
						children: isOpen ? /* @__PURE__ */ jsx(X, { className: "size-5" }) : /* @__PURE__ */ jsx(Menu, { className: "size-5" })
					})
				})
			]
		}), isOpen && /* @__PURE__ */ jsx("div", {
			className: "border-b border-white/10 bg-zinc-950/98 px-6 py-8 backdrop-blur-xl md:hidden",
			role: "navigation",
			"aria-label": "Menú móvil",
			children: /* @__PURE__ */ jsxs("nav", {
				className: "flex flex-col gap-5 text-xs font-mono uppercase tracking-[0.2em]",
				children: [SITE_CONFIG.navLinks.map((link) => {
					return /* @__PURE__ */ jsx("a", {
						href: isCatalogPage ? `/${link.href}` : link.href,
						onClick: () => setIsOpen(false),
						className: "py-1 text-zinc-400 transition-colors hover:text-white",
						children: link.label
					}, link.href);
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-4 border-t border-white/10 pt-6",
					children: isCatalogPage ? /* @__PURE__ */ jsx(Button, {
						variant: "outline",
						asChild: true,
						className: "w-full justify-center h-10 rounded-none border border-white/20 bg-transparent text-xs font-mono uppercase tracking-widest text-white",
						onClick: () => setIsOpen(false),
						children: /* @__PURE__ */ jsxs(Link, {
							to: "/",
							children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "mr-2 size-3.5" }), "Volver al Inicio"]
						})
					}) : /* @__PURE__ */ jsx(CatalogCTAButton, {
						size: "default",
						to: "/catalogo",
						className: "w-full justify-center",
						onClick: () => setIsOpen(false),
						children: "Ver Catálogo"
					})
				})]
			})
		})]
	});
}
//#endregion
//#region src/components/diesel-site.tsx
function pageHead(title, description) {
	return { meta: [
		{ title },
		{
			name: "description",
			content: description
		},
		{
			property: "og:title",
			content: title
		},
		{
			property: "og:description",
			content: description
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] };
}
//#endregion
export { usePoliciesConsent as _, generateCartWhatsAppUrl as a, buildWhatsAppUrl as c, PoliciesModal as d, SITE_CONFIG as f, taller_hero_default as g, banco_pruebas_default as h, formatPrice as i, ProductImageWithFallback as l, inyectores_detalle_default as m, LandingNavbar as n, generateDirectProductWhatsAppUrl as o, fachada_local_default as p, LandingFooter as r, generateNoResultsWhatsAppUrl as s, pageHead as t, CatalogCTAButton as u, CatalogCartProvider as v, useCatalogCart as y };
