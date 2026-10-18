# Lista de Tareas: Landing Page y Sección Institucional

**Fase:** 2 de 4  
**Especificación:** [specs/002-landing-page/spec.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/specs/002-landing-page/spec.md)  
**Plan Técnico:** [specs/002-landing-page/plan.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/specs/002-landing-page/plan.md)  
**Marco de Referencia:** [docs/constitution.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/docs/constitution.md) y [docs/SRS.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/docs/SRS.md)  
**Estado:** Listo para Ejecución  

> **Reglas de Ejecución:**
> - Se ejecuta **estrictamente una sola tarea a la vez** respetando el orden secuencial de dependencias.
> - Cada tarea debe estar completada y validada según su criterio **"Hecho cuando:"** antes de marcar su checkbox `[x]` y avanzar a la siguiente.
> - Ningún criterio de finalización es subjetivo: todos deben ser verificables de forma binaria mediante la terminal (códigos de salida, comandos de test o inspección) o aserciones de pruebas automatizadas sobre el DOM.

---

## Bloque 1: Configuración Centralizada, Limpieza y Utilidades Puras

- [x] **Tarea 1.1 — Eliminar ruta stub `src/routes/servicios.tsx`** `(RF-01, DoD #16)`
  - **Objetivo:** Eliminar físicamente el archivo de ruta `src/routes/servicios.tsx` para erradicar rutas huérfanas y permitir que los servicios sean navegados exclusivamente mediante el ancla `/#servicios` en la ruta `/`.
  - **Archivos involucrados:** `src/routes/servicios.tsx`.
  - **Hecho cuando:** En PowerShell, `!(Test-Path src/routes/servicios.tsx)` devuelva `True` y `npx tsc --noEmit` no reporte errores de resolución de rutas.

- [x] **Tarea 1.2 — Crear módulo de configuración estática inmutable `site-config.ts`** `(RF-01, RF-02, RF-04, RF-05, RF-07, RF-08, RNF-06)`
  - **Objetivo:** Crear `src/config/site-config.ts` como única fuente de verdad inmutable para los datos de contacto, dirección, horarios, eslogan y textos institucionales, acompañado de su prueba unitaria `src/test/landing/site-config.test.ts`.
  - **Archivos involucrados:** `src/config/site-config.ts`, `src/test/landing/site-config.test.ts`.
  - **Hecho cuando:** `npx vitest run src/test/landing/site-config.test.ts` termine con código de salida 0 validando que `SITE_CONFIG.phone` sea `"5491112345678"`, `SITE_CONFIG.address` contenga `"Pres. Juan Domingo Perón 1215, Villa Mercedes, San Luis"`, y `SITE_CONFIG.tagline` sea `"Especialistas en inyección diésel"`.

- [x] **Tarea 1.3 — Implementar utilidades de WhatsApp y suite de pruebas** `(RF-04, RF-06, RF-07, CL-04, CL-07)`
  - **Objetivo:** Implementar en `src/lib/whatsapp-utils.ts` las funciones puras `sanitizePhoneNumber(phone)` y `buildWhatsAppUrl(phone, message)` siguiendo el pseudocódigo del plan, testeando sanitización numérica y codificación URI (emojis, saltos de línea y caracteres especiales).
  - **Archivos involucrados:** `src/lib/whatsapp-utils.ts`, `src/test/landing/whatsapp-utils.test.ts`.
  - **Hecho cuando:** `npx vitest run src/test/landing/whatsapp-utils.test.ts` termine con código de salida 0 y 100% de tests aprobados.

---

## Bloque 2: Modelo de Estado y Validación del Formulario de Contacto

- [x] **Tarea 2.1 — Implementar tipos y lógica de validación del formulario con `trim()`** `(RF-06, CL-03)`
  - **Objetivo:** Crear `src/components/landing/types.ts` con las interfaces de datos y errores, y `src/components/landing/contact-validation.ts` con la función pura `validateContactForm(values)`, aplicando sanitización previa con `.trim()` y restricciones de longitud (nombre: 2-100, contacto: 5-100, mensaje: 10-1000).
  - **Archivos involucrados:** `src/components/landing/types.ts`, `src/components/landing/contact-validation.ts`, `src/test/landing/contact-validation.test.ts`.
  - **Hecho cuando:** `npx vitest run src/test/landing/contact-validation.test.ts` termine con código de salida 0 verificando el rechazo de campos con solo espacios en blanco, la generación de mensajes inline y la devolución de `isValid: true` con strings saneados.

---

## Bloque 3: Componentes de Navegación y Secciones de Presentación

- [x] **Tarea 3.1 — Implementar barra de navegación fija `LandingNavbar.tsx`** `(RF-01, RNF-01, RNF-02)`
  - **Objetivo:** Crear `src/components/landing/LandingNavbar.tsx` con clase `sticky top-0 z-40`, denominación tipográfica "Laboratorio Diésel", enlaces áncora (`#inicio`, `#servicios`, `#garantias`, `#ubicacion`, `#contacto`), botón a `/catalogo`, y menú colapsable hamburguesa para pantallas < 768px (`md`).
  - **Archivos involucrados:** `src/components/landing/LandingNavbar.tsx`, `src/test/landing/LandingNavbar.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/landing/LandingNavbar.test.tsx` termine con código de salida 0 comprobando que no existen tags `<img>` para el logo, que los 5 enlaces áncora y el enlace a `/catalogo` existen en el DOM, y que el botón hamburguesa conmuta el menú móvil.

- [x] **Tarea 3.2 — Implementar sección Hero `HeroSection.tsx`** `(RF-02, RNF-01, RNF-02)`
  - **Objetivo:** Crear `src/components/landing/HeroSection.tsx` con contenedor `id="inicio"`, altura `min-h-[100dvh]`, denominación tipográfica, eslogan estático `"Especialistas en inyección diésel"`, propuestas de valor ("Más de 20 años en el rubro", equipamiento de última generación), CTA principal a `/catalogo` y CTA secundario a `#contacto`.
  - **Archivos involucrados:** `src/components/landing/HeroSection.tsx`, `src/test/landing/HeroSection.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/landing/HeroSection.test.tsx` termine con código de salida 0 comprobando la presencia del eslogan, las propuestas de valor, los atributos `href` de ambos CTAs y la clase CSS `min-h-[100dvh]`.

- [x] **Tarea 3.3 — Implementar sección de Servicios `ServicesSection.tsx`** `(RF-03, RNF-01)`
  - **Objetivo:** Crear `src/components/landing/ServicesSection.tsx` con `id="servicios"`, clase `scroll-mt-20` y grilla responsiva que renderice al menos 4 tarjetas de servicios (reparación, calibración en banco, diagnóstico electrónico, venta de repuestos) con íconos Lucide y descripciones técnicas.
  - **Archivos involucrados:** `src/components/landing/ServicesSection.tsx`, `src/test/landing/ServicesSection.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/landing/ServicesSection.test.tsx` termine con código de salida 0 verificando que el contenedor posee `id="servicios"`, `scroll-mt-20` y que se renderizan exactamente 4 o más tarjetas con títulos y descripciones no vacíos.

---

## Bloque 4: Secciones de Confianza y Ubicación

- [x] **Tarea 4.1 — Implementar sección de Garantías `WarrantySection.tsx`** `(RF-04, RNF-01)`
  - **Objetivo:** Crear `src/components/landing/WarrantySection.tsx` con `id="garantias"`, clase `scroll-mt-20`, bloque de texto institucional estructurado para políticas de garantía y botón "Solicitar Garantía" con enlace `wa.me` preformateado y target `_blank`.
  - **Archivos involucrados:** `src/components/landing/WarrantySection.tsx`, `src/test/landing/WarrantySection.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/landing/WarrantySection.test.tsx` termine con código de salida 0 verificando que el botón contiene el enlace a `https://wa.me/5491112345678?text=...` con el mensaje codificado que incluye `"Motivo: Consulta por garantía / soporte post-venta."`.

- [x] **Tarea 4.2 — Implementar sección de Ubicación y Mapa `LocationSection.tsx`** `(RF-05, RNF-06, CL-01)`
  - **Objetivo:** Crear `src/components/landing/LocationSection.tsx` con `id="ubicacion"`, clase `scroll-mt-20`, dirección en texto plano desde `site-config.ts`, horarios de atención ("Lunes a Viernes de 9:00 a 18:00 h"), iframe responsivo de Google Maps Embed y fallback visible con enlace "Cómo llegar".
  - **Archivos involucrados:** `src/components/landing/LocationSection.tsx`, `src/test/landing/LocationSection.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/landing/LocationSection.test.tsx` termine con código de salida 0 comprobando la presencia del elemento `iframe`, la renderización de la dirección exacta, los horarios de atención y el enlace de fallback.

---

## Bloque 5: Formulario Interactivo, Botón Flotante y Footer

- [x] **Tarea 5.1 — Implementar formulario de contacto reactivo `ContactSection.tsx` y `ContactForm.tsx`** `(RF-06, RNF-06, CL-03, CL-04)`
  - **Objetivo:** Crear `src/components/landing/ContactForm.tsx` y su contenedor `ContactSection.tsx` con `id="contacto"` y `scroll-mt-20`. El formulario debe capturar Nombre, Contacto y Mensaje, mostrar alertas inline ante campos inválidos, invocar `window.open` con la URL de WhatsApp compuesta ante datos válidos y resetear los campos inmediatamente en el submit síncrono.
  - **Archivos involucrados:** `src/components/landing/ContactForm.tsx`, `src/components/landing/ContactSection.tsx`, `src/test/landing/ContactForm.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/landing/ContactForm.test.tsx` termine con código de salida 0 validando:
    1. Envío con campos vacíos o con solo espacios previene la apertura de ventana y muestra mensajes de error con `role="alert"`.
    2. Envío con datos válidos llama a `window.open` con los parámetros codificados y limpia inmediatamente los valores de los 3 inputs.

- [x] **Tarea 5.2 — Implementar botón flotante de WhatsApp `FloatingWhatsApp.tsx`** `(RF-07, RNF-06)`
  - **Objetivo:** Crear `src/components/landing/FloatingWhatsApp.tsx` con clases fijas en esquina inferior derecha (`fixed bottom-6 right-6 z-50`), enlace `wa.me` con el mensaje preformateado de consulta general/turnos, e integración con `IntersectionObserver` para ocultarse si las secciones `#garantias` o `#contacto` se encuentran visibles en pantalla pequeña.
  - **Archivos involucrados:** `src/components/landing/FloatingWhatsApp.tsx`, `src/test/landing/FloatingWhatsApp.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/landing/FloatingWhatsApp.test.tsx` termine con código de salida 0 comprobando las clases de posición fija en la esquina inferior derecha, el enlace de WhatsApp codificado con `"Motivo: Consulta general / solicitar turno."` y la respuesta del estado de visibilidad ante eventos de intersección.

- [x] **Tarea 5.3 — Implementar pie de página institucional `LandingFooter.tsx`** `(RF-08, RNF-06)`
  - **Objetivo:** Crear `src/components/landing/LandingFooter.tsx` con la denominación "Laboratorio Diésel", copyright con año dinámico (`new Date().getFullYear()`), dirección desde `site-config.ts`, enlaces áncora duplicados del navbar y enlace a `/catalogo`.
  - **Archivos involucrados:** `src/components/landing/LandingFooter.tsx`, `src/test/landing/LandingFooter.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/landing/LandingFooter.test.tsx` termine con código de salida 0 verificando que el texto de copyright contiene el año actual en curso (ej. 2026), la dirección centralizada y los enlaces de navegación.

---

## Bloque 6: Ensamble en Ruta Raíz, Navegación por Hash y Verificación DoD

- [x] **Tarea 6.1 — Crear hook de navegación por hash `use-hash-navigation.ts` y ensamblar `src/routes/index.tsx`** `(RF-01 a RF-08)`
  - **Objetivo:** Implementar `src/components/landing/use-hash-navigation.ts` para manejar scroll suave al montar la página con hash o al hacer clic en enlaces áncora, y reescribir `src/routes/index.tsx` reemplazando los componentes viejos de `diesel-site.tsx` por los nuevos componentes modulares.
  - **Archivos involucrados:** `src/components/landing/use-hash-navigation.ts`, `src/routes/index.tsx`, `src/test/landing/index-route.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/landing/index-route.test.tsx` termine con código de salida 0 validando que la ruta `/` renderiza el Navbar, Hero (`#inicio`), Servicios (`#servicios`), Garantías (`#garantias`), Ubicación (`#ubicacion`), Contacto (`#contacto`), Footer y Botón Flotante.

- [x] **Tarea 6.2 — Verificar integridad de tipos TypeScript global** `(DoD #14)`
  - **Objetivo:** Ejecutar la verificación estricta del compilador TypeScript sin emisión de archivos sobre todo el workspace.
  - **Archivos involucrados:** Todo el proyecto (`src/**/*`).
  - **Hecho cuando:** `npx tsc --noEmit` devuelva código de salida 0 sin ningún error de tipado.

- [x] **Tarea 6.3 — Ejecutar suite completa de tests automatizados** `(DoD #15)`
  - **Objetivo:** Correr la totalidad de pruebas unitarias y de integración de Vitest para garantizar cero regresiones en el catálogo, enrutamiento y landing.
  - **Archivos involucrados:** `src/test/**/*.test.ts*`.
  - **Hecho cuando:** `npm run test` (o `npx vitest run`) termine con código de salida 0 y 0 pruebas fallidas.

- [x] **Tarea 6.4 — Ejecutar build de producción y validar artefactos empaquetados** `(DoD #13)`
  - **Objetivo:** Compilar la aplicación para producción mediante Vite y TanStack Start asegurando optimización de bundles y cero errores de packaging.
  - **Archivos involucrados:** Configuración y assets de build.
  - **Hecho cuando:** `npm run build` termine con código de salida 0 y genere el bundle en disco sin advertencias fatales.
