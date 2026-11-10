# Plan de Implementación — Fase 13: Mejoras Frontend

**Fase:** 013-mejoras-frontend-dialogs-footer-mobile  
**Arquitectura:** React 19 / Vite / TanStack Router / Radix UI Dialog / Tailwind CSS  
**Regla de Ejecución:** SDD & Zero Trust (Planificación exhaustiva previa a la codificación atómica)  

---

## 1. Arquitectura de Componentes y Flujo de Datos

```
src/
├── components/
│   ├── catalog/
│   │   ├── ProductCard.tsx            <-- Agregar stopPropagation en botones, click en imagen/título
│   │   └── ProductDetailModal.tsx     <-- NUEVO: Modal de Ficha Técnica accesible (shadcn Dialog)
│   ├── policies/
│   │   ├── PoliciesBanner.tsx         <-- Ajuste responsive bottom-24 / md:bottom-6 / z-50
│   │   ├── PrivacyPolicyModal.tsx     <-- NUEVO: Modal accesible con texto Ley 25.326
│   │   └── LegalNoticeModal.tsx       <-- NUEVO: Modal accesible con 3 cláusulas legales/términos
│   └── landing/
│       └── LandingFooter.tsx          <-- Integración de modales de privacidad/legal y botón "Volver arriba"
├── routes/
│   └── catalogo.tsx                   <-- Estado selectedProductForModal, render de ProductDetailModal
└── test/
    ├── catalog/
    │   ├── ProductDetailModal.test.tsx <-- Pruebas unitarias de modal y stopPropagation
    │   └── product-card.test.tsx       <-- Verificación de click handlers
    ├── policies/
    │   ├── PoliciesBanner.test.tsx     <-- Actualización de aserción z-50
    │   └── LegalModals.test.tsx        <-- Pruebas de PrivacyPolicyModal y LegalNoticeModal
    └── landing/
        └── LandingFooter.test.tsx      <-- Pruebas de botones de modales y estilo Volver Arriba
```

---

## 2. Decisiones Técnicas y Justificación de Trade-offs

1. **Componente Modular `ProductDetailModal`:**
   - *Decisión:* Separar el modal de detalles en un componente dedicado en `src/components/catalog/ProductDetailModal.tsx` en vez de incrustarlo inline en `catalogo.tsx`.
   - *Justificación:* Mantiene la modularidad, facilita el testeo unitario aislado con `@testing-library/react` y permite reusarlo eventualmente en el carrusel de destacados u otras vistas si fuera requerido.

2. **Aislamiento de Eventos con `stopPropagation`:**
   - *Decisión:* En `ProductCard.tsx`, envolver los manejadores de los botones "Agregar al Carrito" y "WhatsApp Directo" con `e.stopPropagation()`.
   - *Justificación:* Previene que al pulsar el botón del carrito dentro de la tarjeta se active el disparador del modal de la tarjeta, evitando una experiencia frustrante de doble acción.

3. **Modales de Políticas en Footer (`PrivacyPolicyModal` & `LegalNoticeModal`):**
   - *Decisión:* Crear dos componentes modales limpios que encapsulan el texto legal exacto y proveen accesibilidad semántica.
   - *Justificación:* Cumplen con las leyes de privacidad y protección de datos argentinas sin recargar ni redireccionar al usuario fuera del embudo de conversión.

4. **Corrección de Cobertura en Mobile (`PoliciesBanner.tsx`):**
   - *Decisión:* Usar `fixed bottom-24 inset-x-3 z-50 md:bottom-6 md:left-6 md:right-auto md:max-w-md`.
   - *Justificación:* En móviles, `MobileStickyBar` mide 64px (`z-40`), por lo que `bottom-24` (96px) posiciona el banner con un margen ergonómico holgado por encima de la barra y botones flotantes, y `z-50` garantiza que el diálogo o banner quede en la capa superior sin solapamientos.

5. **Transformación del enlace "Volver arriba":**
   - *Decisión:* Modificar el elemento `<a>` existente para conservar el comportamiento nativo de anclaje a `#inicio` o desplazamiento suave, aplicándole la lista exacta de clases utilitarias pedidas.
   - *Justificación:* No rompe la accesibilidad nativa del hipervínculo y adopta inmediatamente la apariencia de un botón premium industrial.

---

## 3. Plan de Verificación y Validación

- Pruebas unitarias de componentes con Vitest y Testing Library (`npx vitest run src`).
- Verificación de renderizado de elementos clave: badges de stock, precios, códigos OEM, textos de políticas y clases CSS.
- Verificación de la compilación de producción con `npm run build`.

---

## 4. Plan de Refinamiento y Blindaje

1. **Footer:**
   - Remover botón de garantías de la barra inferior de `LandingFooter.tsx` conservando únicamente "Política de Privacidad" y "Aviso Legal y Términos".
   - Restaurar las clases tipográficas originales del enlace `#inicio` ("Volver arriba").
2. **API & Catálogo:**
   - Crear `src/services/api.ts` exportando `api` desde `src/lib/api.ts`.
   - Verificar `rawBaseUrl` con fallback `http://localhost:3001` y endpoints `/api/products`, `/api/brands`, `/api/categories`, `/api/products/featured`.
   - Proteger `catalogo.tsx` contra disparos múltiples o bucles infinitos ante errores de conexión.
3. **Code-Splitting:**
   - Extraer `LandingPage` a `src/components/landing/LandingPage.tsx` y dejar `src/routes/index.tsx` exportando únicamente `Route`.
4. **Hydration Warning:**
   - Añadir `suppressHydrationWarning` en `<html>` de `__root.tsx` y en `<video>` de `BenchShowcaseSection.tsx` y `WarrantySection.tsx`.


