import { t as pageHead } from "./diesel-site-BOnuZYa-.js";
import "react";
import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import "react/jsx-runtime";
import { z } from "zod";
import "lucide-react";
import "react-icons/fa";
//#region src/schemas/catalog-schemas.ts
/**
* Validador atómico de UUID v4 estándar.
*/
var uuidSchema = z.string().uuid("Identificador UUID inválido");
z.object({ id: uuidSchema }).strict();
/**
* Esquema Zod estricto para validar parámetros de búsqueda en URL del catálogo (/catalogo).
* (Spec 003, RF-03, RF-04, RNF-05, Fail-Fast Zod)
*
* Rechaza de forma inmediata campos desconocidos (.strict()) o valores que no sean UUIDs válidos.
*/
var catalogSearchParamsSchema = z.object({
	q: z.string().trim().optional().default(""),
	brand: z.union([uuidSchema, z.array(uuidSchema)]).optional(),
	category: z.union([uuidSchema, z.array(uuidSchema)]).optional()
}).strict();
/**
* Normaliza un valor de filtro que puede venir como string único o array de strings
* en un array homogéneo de UUIDs (útil para TanStack Router search params).
*/
function normalizeFilterParam(param) {
	if (!param) return [];
	if (Array.isArray(param)) return param;
	return [param];
}
//#endregion
//#region src/routes/catalogo.tsx
/**
* Ruta Principal del Catálogo Público (/catalogo).
* (Spec 003, RF-01 a RF-12, Bloque 6 - Tarea T-17)
*
* Características:
* - Integración institucional con LandingNavbar y LandingFooter (RF-01).
* - Sincronización bidireccional de Search Params en URL con TanStack Router (RF-03, RF-04).
* - Consumo del cliente HTTP centralizado (catalogService) filtrando visible: true (RF-02).
* - Grilla con esqueleto de carga ProductGridSkeleton y tarjetas ProductCard (RF-06 a RF-09).
* - Filtros facetados combinados CatalogFilters con árbol jerárquico y conteos (RF-04).
* - Estado sin resultados con consulta asistida hacia WhatsApp (RF-05).
* - Botón flotante reactivo del carrito de consultas y drawer CartDrawer (RF-08, RF-10, RF-12).
* - Error boundary CatalogErrorBoundary ante fallos de conexión (Principio 6).
*/
var $$splitComponentImporter = () => import("./catalogo-DgdIUgzt.js");
var Route = createFileRoute("/catalogo")({
	validateSearch: (search) => {
		const parsed = catalogSearchParamsSchema.safeParse(search);
		return parsed.success ? parsed.data : {};
	},
	head: () => pageHead("Catálogo de inyectores — Laboratorio Diésel", "Inyectores Bosch, Delphi y Denso. Buscá por código OEM, filtrá por marca y categoría y consultá precios en pesos argentinos."),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { normalizeFilterParam as n, Route as t };
