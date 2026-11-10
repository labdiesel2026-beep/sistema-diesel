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
