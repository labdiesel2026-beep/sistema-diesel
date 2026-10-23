import { t as pageHead } from "./diesel-site-DP12_HDl.js";
import "react";
import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import "react/jsx-runtime";
import "lucide-react";
import "react-icons/fa";
//#region src/routes/catalogo.$productId.tsx
/**
* Ficha Técnica Detallada de Repuesto Diésel (/catalogo/$productId).
* (Spec 003, RF-06, RF-07, RF-09, RF-11, RF-12, Bloque 6 - Tarea T-18)
*
* Características:
* - Consulta individual mediante catalogService.getProductById(productId).
* - Tratamiento de productos pausados o eliminados: si visible === false o no existe,
*   despliega el estado accesible "Producto no disponible" y botón de retorno al catálogo (RF-11).
* - Ficha técnica completa para repuestos visibles (RF-06):
*   - Imagen de alta resolución con fallback SVG local accesible.
*   - Nombre, Marca, Código OEM, Condición ('Nuevo' | 'Reacondicionado' | 'Usado').
*   - Compatibilidad vehicular y especificaciones técnicas.
*   - Exhibición condicional de precios en ARS o rótulo "Consultar precio" (RF-07).
*   - Acciones: Agregar al Carrito (useCatalogCart) y Consulta Directa por WhatsApp (RF-09).
* - Integración institucional con LandingNavbar, LandingFooter y CartDrawer.
*/
var $$splitComponentImporter = () => import("./catalogo._productId-Bcwf3_bU.js");
var Route = createFileRoute("/catalogo/$productId")({
	head: () => pageHead("Ficha Técnica de Repuesto — Laboratorio Diésel", "Detalle técnico, compatibilidad vehicular, código OEM y cotización en pesos argentinos con garantía de banco."),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
