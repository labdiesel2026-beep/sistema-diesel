/**
 * Re-exportación para retrocompatibilidad arquitectónica.
 * (Spec 010, TASK-18)
 *
 * El componente canónico de la tabla de inventario del Admin es ProductList.tsx.
 */

export * from "./ProductList";
export { ProductList as default } from "./ProductList";
