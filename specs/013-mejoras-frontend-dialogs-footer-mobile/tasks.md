# Tareas de Ejecución — Fase 13: Mejoras Frontend

**Fase:** 013-mejoras-frontend-dialogs-footer-mobile  
**Regla:** Ejecutar estrictamente UNA tarea a la vez, validar con tests, marcar con `[x]` y detenerse para control de calidad.

---

- [x] **T-01: Modal de Detalles de Producto en el Catálogo**
  - Crear `src/components/catalog/ProductDetailModal.tsx` con `Dialog` de `shadcn/ui`, imagen destacada, título, marca, categoría, SKU/OEM, precio condicional, badge de stock/disponibilidad, descripción técnica y los dos botones del footer ("Agregar al pedido" y "Consultar por WhatsApp").
  - Modificar `src/components/catalog/ProductCard.tsx` para agregar `cursor-pointer` y trigger de detalle en contenedor de imagen y título, y aplicar `e.stopPropagation()` en el botón "Agregar al Carrito" y enlace de WhatsApp directo.
  - Integrar el estado `selectedProductForModal` y `ProductDetailModal` en `src/routes/catalogo.tsx`.
  - Crear pruebas unitarias en `src/test/catalog/ProductDetailModal.test.tsx` y validar con vitest.

- [x] **T-02: Modales de Políticas en el Footer (Privacidad y Aviso Legal)**
  - Crear `src/components/policies/PrivacyPolicyModal.tsx` con el texto reglamentario de Ley 25.326 y diseño oscuro.
  - Crear `src/components/policies/LegalNoticeModal.tsx` con las cláusulas de Precios/Stock, Referencias OEM y Garantía.
  - Modificar `src/components/landing/LandingFooter.tsx` para incorporar los disparadores hacia ambos modales.
  - Crear pruebas unitarias en `src/test/policies/LegalModals.test.tsx` y validar con vitest.

- [x] **T-03: Arreglo del Banner de Políticas/Cookies en Mobile**
  - Modificar `src/components/policies/PoliciesBanner.tsx` para aplicar `bottom-24 inset-x-3 z-50 md:bottom-6 md:left-6 md:right-auto md:max-w-md` evitando que sea tapado por `MobileStickyBar` o `FloatingWhatsApp`.
  - Actualizar `src/test/policies/PoliciesBanner.test.tsx` para validar la presencia de `z-50`.
  - Validar suite de pruebas con vitest.

- [x] **T-04: Transformación Estilística del Botón "Volver Arriba" en Footer**
  - Modificar el enlace `Volver arriba` en `src/components/landing/LandingFooter.tsx` para aplicar las clases exactas solicitadas: `inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-white/20 bg-white/[0.03] hover:bg-white/10 hover:border-white/40 text-zinc-300 text-xs font-semibold uppercase tracking-wider transition-all rounded-md cursor-pointer`.
  - Validar renderizado en `src/test/landing/LandingFooter.test.tsx`.

- [x] **T-05: Verificación Integral del Sistema y Build de Producción**
  - Ejecutar suite completa de pruebas unitarias e integración (`vitest`).
  - Ejecutar compilación de producción con Vite (`npm run build`).
  - Confirmar ausencia de regresiones visuales o funcionales.

---

### Fase de Refinamiento Puntual

- [x] **T-06: Refinamiento del Footer (Limpiar enlaces barra inferior y revertir Volver Arriba)**
  - En `src/components/landing/LandingFooter.tsx`, remover el botón de políticas comerciales de la barra inferior junto a su separador `·`, dejando únicamente "Política de Privacidad" y "Aviso Legal y Términos".
  - Revertir las clases del botón "Volver arriba" exactamente a su diseño original sin recuadro: `inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase text-zinc-500 transition-colors hover:text-white`.
  - Actualizar pruebas en `src/test/landing/LandingFooter.test.tsx` y validar con vitest.

- [x] **T-07: Blindaje del Cliente API y Manejo de Errores en Catálogo**
  - Asegurar la exportación de `api` en `src/services/api.ts` (alias a `src/lib/api.ts`).
  - Verificar que todas las llamadas a `/api/products`, `/api/brands`, `/api/categories` y `/api/products/featured` usen `VITE_API_URL` con fallback a `http://localhost:3001`.
  - Asegurar que `src/routes/catalogo.tsx` maneje el estado de error de forma limpia (`CatalogErrorView`) sin entrar en bucles de peticiones.
  - Validar con vitest.

- [x] **T-08: Corrección de Advertencia de Code-Splitting en `src/routes/index.tsx`**
  - Extraer `LandingPage` a `src/components/landing/LandingPage.tsx`.
  - En `src/routes/index.tsx`, importar `LandingPage` y exportar únicamente `Route`.
  - Actualizar import en `src/test/landing/index-route.test.tsx`.
  - Validar con vitest.

- [x] **T-09: Silenciar Hydration Mismatch en `<html>` y `<video>`**
  - Agregar `suppressHydrationWarning` en `<html lang="es">` en `src/routes/__root.tsx`.
  - Agregar `suppressHydrationWarning` en `<video>` en `BenchShowcaseSection.tsx` y `WarrantySection.tsx`.
  - Validar build y pruebas.

- [x] **T-10: Verificación Final Integral y Compilación**
  - Ejecutar suite completa con Vitest.
  - Ejecutar `npm run build` confirmando 0 advertencias de code-splitting.

