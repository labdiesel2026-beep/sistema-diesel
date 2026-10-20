# Plan Técnico de Implementación: Landing Page y Sección Institucional

**Fase:** 2 de 4  
**Especificación:** [specs/002-landing-page/spec.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/specs/002-landing-page/spec.md)  
**Marco de Referencia:** [docs/constitution.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/docs/constitution.md) y [docs/SRS.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/docs/SRS.md)  
**Estado:** Listo para Revisión / Pendiente de Aprobación

---

## 1. Trazabilidad de Requisitos y Alineación Constitucional

El presente plan diseña la solución técnica para la Landing Page pública de Laboratorio Diésel, asegurando cobertura estricta de todos los requisitos funcionales (**RF-01 a RF-08**), no funcionales (**RNF-01 a RNF-06**), casos límite (**CL-01 a CL-07**) y los principios de la [Constitución del Proyecto](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/docs/constitution.md).

### 1.1 Matriz de Cobertura de Requisitos Funcionales

| Requisito | Descripción                                                           | Componente / Módulo Principal           | Cobertura en este Plan     |
| :-------- | :-------------------------------------------------------------------- | :-------------------------------------- | :------------------------- |
| **RF-01** | Barra de navegación fija con enlaces áncora y colapso móvil (< 768px) | `LandingNavbar.tsx`                     | Sección 2.1, 2.2, 5.1      |
| **RF-02** | Sección Hero (100dvh, denominación, eslogan, CTAs)                    | `HeroSection.tsx`                       | Sección 2.1, 2.2, 6.2      |
| **RF-03** | Sección de Servicios (grilla responsiva, 4 servicios base)            | `ServicesSection.tsx`                   | Sección 2.1, 2.2, 8.2      |
| **RF-04** | Sección de Garantías y botón posventa WhatsApp                        | `WarrantySection.tsx`                   | Sección 2.1, 2.2, 4.1      |
| **RF-05** | Sección de Ubicación (dirección, horarios, iframe mapa y fallback)    | `LocationSection.tsx`                   | Sección 2.1, 2.2, 6.4      |
| **RF-06** | Formulario de Contacto → WhatsApp con validación client-side y trim   | `ContactSection.tsx`, `ContactForm.tsx` | Sección 2.1, 3.1, 3.2, 4.2 |
| **RF-07** | Botón flotante de WhatsApp con mensaje general y anti-solapamiento    | `FloatingWhatsApp.tsx`                  | Sección 2.1, 2.2, 4.3, 6.5 |
| **RF-08** | Footer institucional con denominación, año dinámico, datos y áncoras  | `LandingFooter.tsx`                     | Sección 2.1, 2.2, 8.2      |

### 1.2 Validación contra los 6 Principios Constitucionales

| #   | Principio                              | Estado en Spec 002       | Justificación y Aplicación                                                                                                                                                                                                                                                                                        |
| :-- | :------------------------------------- | :----------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **SDD-First**                          | **CUMPLIDO**             | Ningún archivo de producción se modifica sin este documento técnico aprobado y alineado con `spec.md`.                                                                                                                                                                                                            |
| 2   | **Fail-Fast (Zod)**                    | **EXENCIÓN JUSTIFICADA** | No hay endpoints backend involucrados en esta fase. El formulario de contacto (RF-06) opera exclusivamente client-side redirigiendo al protocolo `wa.me`. La validación es client-side con tipado estricto TypeScript y validadores puros con `trim()`. Zod se integrará en fases con mutación HTTP hacia la API. |
| 3   | **Upload Paranoico (Sharp)**           | **NO APLICA**            | No hay carga de archivos por parte de usuarios en la Landing Page pública. Las imágenes estáticas son procesadas y optimizadas en tiempo de compilación por Vite.                                                                                                                                                 |
| 4   | **Sesión Zero-Trust (JWT)**            | **NO APLICA**            | La Landing Page es 100% de acceso público; no manipula cookies ni tokens de sesión de administrador.                                                                                                                                                                                                              |
| 5   | **Persistencia como Fuente de Verdad** | **CUMPLIDO**             | La Landing Page no almacena estado de negocio mutable en `localStorage`. Los datos de contacto, horarios y servicios son configuración estática inmutable del MVP en código (`src/config/site-config.ts`), no datos dinámicos de catálogo o pedidos.                                                              |
| 6   | **Errores Opacos**                     | **NO APLICA**            | Al no haber controladores de backend ni API endpoints en esta fase, no se exponen stack traces ni errores del sistema. Los errores de validación del formulario son mensajes de guía de usuario en el DOM.                                                                                                        |

---

## 2. Estructura y Jerarquía de Componentes React

Para mantener modularidad, testeabilidad y cumplimiento del principio de responsabilidad única (SRP), se desmantela el archivo monolítico `diesel-site.tsx` heredado del detox, separando la Landing en componentes semánticos dentro de `src/components/landing/`.

### 2.1 Árbol de Componentes de la Landing Page (`RF-01` a `RF-08`)

```
src/routes/index.tsx (Punto de entrada de la ruta '/')
│
├── LandingNavbar (`RF-01`)
│   ├── BrandTypography (Denominación 'Laboratorio Diésel')
│   ├── NavAnchorLinks (Enlaces de scroll: #inicio, #servicios, #garantias, #ubicacion, #contacto)
│   ├── CatalogLinkButton (Botón a /catalogo)
│   └── MobileMenuDrawer (Menú hamburguesa en < 768px con Radix Sheet/Dialog o estado local)
│
├── <main>
│   ├── HeroSection (`RF-02`, `RNF-01`, `RNF-02`)
│   │   ├── BrandTypography
│   │   ├── HeroTagline ("Especialistas en inyección diésel")
│   │   ├── ValuePropsList ("Más de 20 años en el rubro", equipamiento de última generación)
│   │   └── HeroActions (CTA Principal -> /catalogo, CTA Secundario -> #contacto)
│   │
│   ├── ServicesSection (`RF-03`, `RNF-01`)
│   │   └── ServiceCard[] (Mapeo de lista estática con íconos Lucide, título y descripción)
│   │
│   ├── WarrantySection (`RF-04`, `RNF-01`)
│   │   ├── WarrantyTermsText (Términos estáticos centralizados)
│   │   └── WhatsAppActionLink (Botón 'Solicitar Garantía' con mensaje preformateado)
│   │
│   ├── LocationSection (`RF-05`, `RNF-06`)
│   │   ├── AddressInfo (Dirección desde configuración centralizada)
│   │   ├── BusinessHours (Lunes a Viernes 9:00 a 18:00 h)
│   │   └── MapEmbed (iframe Google Maps responsivo con fallback accesible ante fallo)
│   │
│   └── ContactSection (`RF-06`, `RNF-06`)
│       ├── ContactInfoAside (Datos directos de contacto)
│       └── ContactForm (Formulario client-side con validación inline y redirección wa.me)
│           ├── FormField[Nombre] (Input texto)
│           ├── FormField[Contacto] (Input teléfono/email)
│           ├── FormField[Mensaje] (Textarea)
│           └── SubmitButton (Botón "Enviar consulta a WhatsApp")
│
├── FloatingWhatsApp (`RF-07`)
│   └── FloatingButton (Botón fijo inferior derecho con detector de colisión/visibilidad)
│
└── LandingFooter (`RF-08`, `RNF-06`)
    ├── BrandTypography
    ├── CopyrightNotice (Año dinámico con new Date().getFullYear())
    ├── FooterAddress (Dirección desde configuración centralizada)
    ├── FooterAnchorLinks (Duplicación accesible de navegación por anclas)
    └── FooterCatalogLink (Acceso a /catalogo)
```

### 2.2 Especificación de Módulos y Responsabilidades

| Componente         | Ruta de Archivo                               | Responsabilidad Principal                                                                                                                                                                  | RF Cubierto                                           |
| :----------------- | :-------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------- |
| `SiteConfig`       | `src/config/site-config.ts`                   | Única fuente de verdad inmutable para teléfono de WhatsApp, dirección física, horarios y textos predeterminados.                                                                           | `RF-04`, `RF-05`, `RF-06`, `RF-07`, `RF-08`, `RNF-06` |
| `LandingNavbar`    | `src/components/landing/LandingNavbar.tsx`    | Header con posición `sticky top-0 z-40`, fondo translúcido con desenfoque (`backdrop-blur`), enlaces áncora con scroll suave y colapso móvil bajo breakpoint `md` (768px).                 | `RF-01`                                               |
| `HeroSection`      | `src/components/landing/HeroSection.tsx`      | Presentación con altura mínima `min-h-[100dvh]`, fondo oscuro con degradados en tonos azules (`slate-900`, `blue-900/30`), eslogan institucional y CTAs duales.                            | `RF-02`, `RNF-01`                                     |
| `ServicesSection`  | `src/components/landing/ServicesSection.tsx`  | Sección ancla `#servicios`. Renderiza grilla de 4 tarjetas (1 columna en móvil, 2 en tablet, 4 en desktop) con íconos Lucide representativos.                                              | `RF-03`                                               |
| `WarrantySection`  | `src/components/landing/WarrantySection.tsx`  | Sección ancla `#garantias`. Expone las condiciones comerciales de garantía y el disparador de posventa hacia WhatsApp.                                                                     | `RF-04`                                               |
| `LocationSection`  | `src/components/landing/LocationSection.tsx`  | Sección ancla `#ubicacion`. Visualización de dirección, horarios y contenedor iframe con fallback de error.                                                                                | `RF-05`                                               |
| `ContactSection`   | `src/components/landing/ContactSection.tsx`   | Sección ancla `#contacto`. Contiene el formulario interactivo para composición de consultas.                                                                                               | `RF-06`                                               |
| `ContactForm`      | `src/components/landing/ContactForm.tsx`      | Manejo de estado local del formulario, validación de longitudes tras `.trim()`, feedback de errores inline y limpieza inmediata on-submit.                                                 | `RF-06`                                               |
| `FloatingWhatsApp` | `src/components/landing/FloatingWhatsApp.tsx` | Botón flotante en esquina inferior derecha (`fixed bottom-6 right-6 z-50`). Implementa detector de solapamiento en móviles para ocultarse si `#contacto` o `#garantias` están en pantalla. | `RF-07`                                               |
| `LandingFooter`    | `src/components/landing/LandingFooter.tsx`    | Pie de página institucional con derechos reservados, año dinámico, datos de ubicación y enlaces de navegación secundaria.                                                                  | `RF-08`                                               |
| `WhatsAppUtils`    | `src/lib/whatsapp-utils.ts`                   | Funciones utilitarias puras para sanitizar números de teléfono y componer URLs seguras para el protocolo `wa.me`.                                                                          | `RF-04`, `RF-06`, `RF-07`                             |

---

## 3. Modelo de Estado del Formulario y Ciclo de Vida (`RF-06`)

El formulario de contacto es estrictamente de composición en frontend y carece de persistencia. Se utiliza un estado local reactivo mediante hooks estándar de React (`useState`), evitando dependencias pesadas innecesarias y asegurando máximo rendimiento.

### 3.1 Definición de Tipos TypeScript

```typescript
// src/components/landing/types.ts

export interface ContactFormData {
  nombre: string;
  contacto: string;
  mensaje: string;
}

export interface ContactFormErrors {
  nombre?: string;
  contacto?: string;
  mensaje?: string;
}

export type FormFieldKey = keyof ContactFormData;

export interface ValidationRule {
  minLength: number;
  maxLength: number;
  requiredMessage: string;
  lengthMessage: string;
}

export const FORM_VALIDATION_RULES: Record<FormFieldKey, ValidationRule> = {
  nombre: {
    minLength: 2,
    maxLength: 100,
    requiredMessage: "El nombre es obligatorio.",
    lengthMessage: "El nombre debe tener entre 2 y 100 caracteres.",
  },
  contacto: {
    minLength: 5,
    maxLength: 100,
    requiredMessage: "Indique un teléfono o correo electrónico de contacto.",
    lengthMessage: "El dato de contacto debe tener entre 5 y 100 caracteres.",
  },
  mensaje: {
    minLength: 10,
    maxLength: 1000,
    requiredMessage: "El mensaje no puede estar vacío.",
    lengthMessage: "El mensaje debe tener entre 10 y 1000 caracteres.",
  },
};
```

### 3.2 Función de Validación Pura y Fail-Fast Client-Side

```typescript
export function validateContactForm(values: ContactFormData): {
  isValid: boolean;
  errors: ContactFormErrors;
  cleanedValues: ContactFormData;
} {
  const errors: ContactFormErrors = {};

  // Procesamiento con .trim() mandatario según RF-06 y directiva de QA
  const cleanedValues: ContactFormData = {
    nombre: values.nombre.trim(),
    contacto: values.contacto.trim(),
    mensaje: values.mensaje.trim(),
  };

  // Validación: Nombre
  if (!cleanedValues.nombre) {
    errors.nombre = FORM_VALIDATION_RULES.nombre.requiredMessage;
  } else if (
    cleanedValues.nombre.length < FORM_VALIDATION_RULES.nombre.minLength ||
    cleanedValues.nombre.length > FORM_VALIDATION_RULES.nombre.maxLength
  ) {
    errors.nombre = FORM_VALIDATION_RULES.nombre.lengthMessage;
  }

  // Validación: Teléfono / Email
  if (!cleanedValues.contacto) {
    errors.contacto = FORM_VALIDATION_RULES.contacto.requiredMessage;
  } else if (
    cleanedValues.contacto.length < FORM_VALIDATION_RULES.contacto.minLength ||
    cleanedValues.contacto.length > FORM_VALIDATION_RULES.contacto.maxLength
  ) {
    errors.contacto = FORM_VALIDATION_RULES.contacto.lengthMessage;
  }

  // Validación: Mensaje
  if (!cleanedValues.mensaje) {
    errors.mensaje = FORM_VALIDATION_RULES.mensaje.requiredMessage;
  } else if (
    cleanedValues.mensaje.length < FORM_VALIDATION_RULES.mensaje.minLength ||
    cleanedValues.mensaje.length > FORM_VALIDATION_RULES.mensaje.maxLength
  ) {
    errors.mensaje = FORM_VALIDATION_RULES.mensaje.lengthMessage;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cleanedValues,
  };
}
```

### 3.3 Ejemplo Práctico de Estado y Transiciones

1. **Estado Inicial:**

   ```json
   {
     "values": { "nombre": "", "contacto": "", "mensaje": "" },
     "errors": {},
     "isSubmitted": false
   }
   ```

2. **Transición 1: Entrada Inválida con Espacios en Blanco (Caso Límite `CL-03` y directiva QA):**
   - El usuario ingresa `"   "` en `nombre` y presiona Enviar.
   - La validación detecta que `values.nombre.trim()` resulta en `""`.
   - **Estado Resultante:**
     ```json
     {
       "values": { "nombre": "   ", "contacto": "", "mensaje": "" },
       "errors": {
         "nombre": "El nombre es obligatorio.",
         "contacto": "Indique un teléfono o correo electrónico de contacto.",
         "mensaje": "El mensaje no puede estar vacío."
       },
       "isSubmitted": true
     }
     ```
   - La interfaz bloquea la llamada a WhatsApp y renderiza alertas accesibles `role="alert"` en rojo bajo cada input.

3. **Transición 2: Envío Exitoso y Limpieza Inmediata (Directiva de QA):**
   - El usuario corrige los campos con datos válidos y hace clic en `submit`.
   - Se ejecuta la función `validateContactForm`. Resulta `isValid: true`.
   - Se genera la URL de WhatsApp y se dispara `window.open(url, "_blank", "noopener,noreferrer")`.
   - **Inmediatamente** (de forma síncrona en el manejador del click), se ejecuta `setValues(INITIAL_STATE)` y `setErrors({})`, dejando los campos en blanco sin esperar feedback del sistema operativo ni de la apertura de ventana externa.

---

## 4. Algoritmo de Generación del Enlace a WhatsApp (`RF-04`, `RF-06`, `RF-07`)

Para evitar inconsistencias en el formateo de números telefónicos internacionales y garantizar que los emojis o signos especiales (`#`, `&`, `?`, saltos de línea) no corrompan los parámetros query, la lógica de composición se aísla en `src/lib/whatsapp-utils.ts`.

### 4.1 Pseudocódigo de Construcción de URL Universal

```
ALGORITMO buildWhatsAppUrl(rawPhone: Cadena, rawMessage: Cadena) -> Cadena
  ENTRADA:
    rawPhone: Número telefónico recibido de la configuración centralizada (ej. "+54 9 11 1234-5678")
    rawMessage: Texto plano con saltos de línea y variables interpoladas

  // 1. Normalización estricta del número telefónico (E.164 sin símbolos)
  // Remover cualquier carácter que no sea dígito numérico (0 al 9)
  sanitizedPhone <- REEMPLAZAR_REGEX(rawPhone, "[^0-9]", "")

  SI LONGITUD(sanitizedPhone) < 8 ENTONCES
    LANZAR_ERROR("El número de teléfono configurado para WhatsApp es inválido.")
  FIN SI

  // 2. Normalización del mensaje
  // Se recortan espacios periféricos sin alterar los saltos de línea internos
  trimmedMessage <- RECORTAR_ESPACIOS(rawMessage)

  // 3. Codificación de caracteres segura para URI (RFC 3986)
  // Preserva emojis, signos de puntuación y codifica saltos de línea (\n -> %0A)
  encodedMessage <- CODIFICAR_URI_COMPONENTE(trimmedMessage)

  // 4. Composición de la URL canónica de WhatsApp
  urlDestino <- "https://wa.me/" + sanitizedPhone + "?text=" + encodedMessage

  RETORNAR urlDestino
FIN ALGORITMO
```

### 4.2 Plantillas de Mensajes Preformateados por Caso de Uso

#### A. Consulta por Garantía (`RF-04`):

```
Hola, me contacto desde la web de Laboratorio Diésel.
Motivo: Consulta por garantía / soporte post-venta.
```

_Codificación:_ Al abrir la conversación, el cursor del usuario queda naturalmente al final de la última línea para que describa la falla de su inyector antes de pulsar enviar.

#### B. Formulario de Contacto (`RF-06`):

```
Hola, me contacto desde la web de Laboratorio Diésel.
Nombre: {cleanedNombre}
Contacto: {cleanedContacto}
Consulta: {cleanedMensaje}
```

_Interpolación:_ Las variables `{cleaned...}` corresponden a los valores saneados por `validateContactForm`.

#### C. Botón Flotante (`RF-07`):

```
Hola, me contacto desde la web de Laboratorio Diésel.
Motivo: Consulta general / solicitar turno.
```

---

## 5. Comportamiento y Algoritmo de Navegación por Anclas (Hash) (`RF-01`)

La Landing Page utiliza un esquema single-page con secciones identificadas por atributos `id`:

- `#inicio` (HeroSection)
- `#servicios` (ServicesSection)
- `#garantias` (WarrantySection)
- `#ubicacion` (LocationSection)
- `#contacto` (ContactSection)

### 5.1 Desafíos Técnicos de la Navegación por Hash en TanStack Router

1. **Header Fijo:** La barra de navegación sticky/fixed (`h-16` / `h-20`) cubre el inicio del contenido de la sección si se realiza un scroll nativo simple.
2. **Carga Inicial con Hash:** Cuando el usuario ingresa directamente a `https://dominio.com/#contacto` o llega desde `/catalogo`, el navegador puede intentar saltar antes de que los componentes y fuentes se hayan renderizado completamente, provocando desalineación.
3. **Scroll Suave Coherente:** El desplazamiento debe ser animado (`smooth`) al hacer clic en los enlaces, sin romper la accesibilidad para usuarios con preferencia de movimiento reducido (`prefers-reduced-motion`).

### 5.2 Estrategia Técnica Implementada

1. **Compensación de Scroll mediante CSS:**
   Cada elemento contenedor `<section>` poseerá la propiedad `scroll-mt-20` (scroll margin top) de Tailwind CSS. Esto instruye al motor de renderizado del navegador a dejar un margen superior de 80px antes del elemento, impidiendo que el header tape el título de la sección.

2. **Algoritmo de Gestión de Hash (`useHashNavigation`):**

```
ALGORITMO manejarNavegacionHash()
  // 1. Detección en montaje de componente (Efecto de React)
  AL_MONTAR_COMPONENTE:
    hashActual <- OBTENER_HASH_DE_URL() // ej. "#servicios"

    SI hashActual NO ESTÁ VACÍO ENTONCES
      idDestino <- REMOVER_CARACTER(hashActual, "#")
      elemento <- OBTENER_ELEMENTO_POR_ID(idDestino)

      SI elemento EXISTE ENTONCES
        // Verificar preferencia de accesibilidad
        animacion <- PREFIERE_MOVIMIENTO_REDUCIDO() ? "auto" : "smooth"

        // Ejecutar tras el ciclo de renderizado del navegador
        EJECUTAR_EN_PROXIMO_FRAME(() => {
          elemento.scrollIntoView({ behavior: animacion, block: "start" })
        })
      FIN SI
    FIN SI

  // 2. Intercepción de Clics en Enlaces Áncora de Navegación
  FUNCION alHacerClicEnAncora(evento, idDestino)
    SI ESTAMOS_EN_RUTA("/") ENTONCES
      evento.PREVENIR_COMPORTAMIENTO_POR_DEFECTO()
      elemento <- OBTENER_ELEMENTO_POR_ID(idDestino)

      SI elemento EXISTE ENTONCES
        animacion <- PREFIERE_MOVIMIENTO_REDUCIDO() ? "auto" : "smooth"
        elemento.scrollIntoView({ behavior: animacion, block: "start" })
        ACTUALIZAR_HISTORIAL_HASH("#" + idDestino) // history.pushState sin recargar
        CERRAR_MENU_MOVIL_SI_ESTA_ABIERTO()
      FIN SI
    SINO
      // Si el usuario está en /catalogo o /admin, TanStack Router navega a "/#" + idDestino
      NAVEGAR_A("/#" + idDestino)
    FIN SI
  FIN FUNCION
FIN ALGORITMO
```

---

## 6. Decisiones Técnicas Justificadas y Alternativas Descartadas

### 6.1 Validación del Formulario de Contacto: Client-Side TypeScript Puro vs. Schema Zod en Navegador

- **Decisión:** Implementar validación funcional pura en TypeScript (`validateContactForm`) con reglas de longitud y `.trim()`.
- **Justificación:** La Constitución #2 exige Zod en la frontera de endpoints backend para prevenir inyecciones y datos corruptos en el servidor. El formulario de la Landing Page **no tiene endpoint backend**, no realiza peticiones `fetch`/`POST` y su única tarea es formatear una cadena de texto para WhatsApp. Usar una función pura reduce el tamaño del bundle en el cliente, elimina overhead y cumple con precisión la exención documentada en la sección 1.6 de la Spec 002.
- **Alternativa Descartada:** Usar `@hookform/resolvers/zod` + `react-hook-form`. Se descartó por sobredimensionamiento (añadiría ~45 KB al paquete cliente) para validar tres simples campos de texto en una página estática.

### 6.2 Altura de la Sección Hero: `100dvh` vs. `100vh` tradicional

- **Decisión:** Aplicar `min-h-[100dvh]` en el Hero (`RF-02`).
- **Justificación:** En navegadores móviles (Safari iOS, Chrome Android), la barra de direcciones superior e inferior es dinámica. Un contenedor con `100vh` calcula la altura ignorando la barra, provocando que los CTAs queden cortados u ocultos bajo la interfaz del sistema operativo. `100dvh` (dynamic viewport height) se recalcula dinámicamente asegurando que el contenido sea 100% visible sin provocar desbordamiento.
- **Alternativa Descartada:** `h-screen` estándar (`100vh`). Descartada por provocar problemas de usabilidad conocidos en dispositivos móviles (Caso Límite `CL-02` y punto 14 de la auditoría QA).

### 6.3 Eliminación Física de la Ruta `src/routes/servicios.tsx` vs. Redirección HTTP

- **Decisión:** Eliminar completamente el archivo de ruta `src/routes/servicios.tsx` (`RF-01`, DoD #16).
- **Justificación:** La arquitectura del proyecto estipula que los servicios se exploran dentro de la Landing Page en la sección ancla `/#servicios`. Mantener un archivo de ruta genera colisiones semánticas en TanStack Router, incrementa el árbol de rutas innecesariamente y confunde la indexación SEO al tener dos lugares para el mismo contenido.
- **Alternativa Descartada:** Crear una redirección client-side `beforeLoad: () => redirect({ to: '/#servicios' })`. Descartada porque deja código muerto en el repositorio y rompe el principio de base limpia de la Spec 001.

### 6.4 Embebido de Google Maps: Iframe Embed Estático vs. Google Maps JavaScript API

- **Decisión:** Utilizar un elemento `<iframe>` con la URL de embed estándar de Google Maps centrada en `Pres. Juan Domingo Perón 1215, Villa Mercedes, San Luis`.
- **Justificación:** Cumple al 100% el requerimiento `RF-05` sin incurrir en costos de facturación de Google Cloud Platform ni exponer una API Key pública que deba ser rotada o restringida. Incluye además un enlace externo accesible "Cómo llegar en Google Maps" como fallback ante bloqueadores (`CL-01`).
- **Alternativa Descartada:** Integrar el SDK `@react-google-maps/api` o Mapbox GL. Descartada por violar el alcance del MVP, requerir credenciales pagas y penalizar severamente el LCP (Largest Contentful Paint, `RNF-03`).

### 6.5 Prevención de Solapamiento del Botón Flotante (`RF-07`): IntersectionObserver vs. Posición Estática

- **Decisión:** Implementar un hook reactivo `useIntersectionObserver` que detecte cuándo las secciones `#garantias` o `#contacto` entran en el viewport para ocultar temporalmente (o reposicionar sutilmente mediante opacidad/translate) el botón flotante de WhatsApp en pantallas pequeñas (< 768px).
- **Justificación:** En smartphones (anchos de 320px a 400px), un botón flotante fijo en la esquina inferior derecha puede colocarse exactamente encima del botón "Solicitar Garantía" o del botón "Enviar consulta", impidiendo el click del usuario (Caso Límite auditado por QA).
- **Alternativa Descartada:** Dejar el botón flotante estático con un `z-index` elevado. Descartada porque causa fricción grave de UX en terminales móviles pequeños.

---

## 7. Estrategia y Plan de Pruebas (Test Plan)

La suite de tests utilizará el stack nativo configurado en la fase anterior: **Vitest + React Testing Library + happy-dom/jsdom**. Se prohíbe el uso de mocks externos innecesarios; se probará el comportamiento real de los componentes.

### 7.1 Matriz de Pruebas Unitarias y de Integración

```
src/test/
├── landing/
│   ├── site-config.test.ts          # Verifica integridad de constantes inmutables
│   ├── whatsapp-utils.test.ts       # Prueba algoritmos puros de codificación y sanitización
│   ├── contact-validation.test.ts   # Pruebas de reglas de validación y casos de trim()
│   ├── LandingNavbar.test.tsx       # Render, enlaces áncora, toggle menú móvil
│   ├── HeroSection.test.tsx         # Textos obligatorios, propuesta de valor, CTAs
│   ├── ServicesSection.test.tsx     # Tarjetas de servicios, accesibilidad de íconos
│   ├── WarrantySection.test.tsx     # Texto institucional y enlace wa.me de garantía
│   ├── LocationSection.test.tsx     # Dirección, horarios y fallback de mapa
│   ├── ContactForm.test.tsx         # Ciclo completo de formulario, errores y submit
│   ├── FloatingWhatsApp.test.tsx    # Visibilidad y enlace wa.me de consulta general
│   └── LandingFooter.test.tsx       # Año dinámico, enlaces duplicados y configuración
└── routing/
    └── landing-routes.test.tsx      # Comprueba ausencia de /servicios y carga de /
```

### 7.2 Casos de Prueba Críticos Especificados

#### A. Módulo `whatsapp-utils.test.ts`:

- **TC-WA-01 (`RF-04`, `RF-06`, `RF-07`):** Debe remover caracteres no numéricos del teléfono (guiones, espacios, paréntesis, signos `+`).
- **TC-WA-02 (`CL-04`):** Debe codificar caracteres especiales y emojis con `encodeURIComponent` sin corromper la URL.
- **TC-WA-03 (`CL-07`):** Debe componer URLs válidas respetando el límite seguro de tamaño del protocolo `wa.me`.

#### B. Módulo `contact-validation.test.ts`:

- **TC-VAL-01 (`RF-06`):** Debe fallar si el nombre contiene solo espacios (`"   "`).
- **TC-VAL-02 (`RF-06`):** Debe fallar si el nombre tiene menos de 2 caracteres útiles tras `.trim()`.
- **TC-VAL-03 (`RF-06`):** Debe validar que el mensaje tenga entre 10 y 1000 caracteres.
- **TC-VAL-04 (`RF-06`):** Debe retornar `isValid: true` y los valores limpios cuando todos los campos son válidos.

#### C. Componente `ContactForm.test.tsx`:

- **TC-FORM-01 (`RF-06`, `CL-03`):** Al presionar "Enviar" con campos vacíos, no debe invocar `window.open` y debe mostrar los 3 mensajes de error en el DOM.
- **TC-FORM-02 (`RF-06`):** Al ingresar datos válidos y enviar, debe invocar `window.open` con la URL codificada correcta y limpiar los inputs inmediatamente.

#### D. Componente `LandingNavbar.test.tsx`:

- **TC-NAV-01 (`RF-01`):** Debe renderizar la denominación tipográfica "Laboratorio Diésel" sin etiquetas de imagen `<img>` para logotipo.
- **TC-NAV-02 (`RF-01`):** En viewport de escritorio, los enlaces directos a las secciones deben estar visibles.
- **TC-NAV-03 (`RF-01`):** En viewport móvil (< 768px), los enlaces de escritorio deben estar ocultos y debe existir un botón accesible para abrir el menú colapsable.

#### E. Componente `FloatingWhatsApp.test.tsx`:

- **TC-FLOAT-01 (`RF-07`):** Debe renderizarse en la esquina inferior derecha y apuntar al enlace con el mensaje de consulta general.
- **TC-FLOAT-02 (`RF-07`, `CL-05`):** Debe aplicar la clase o estado de ocultamiento cuando se dispara el evento de intersección sobre la sección de contacto.

#### F. Integridad de Rutas `landing-routes.test.tsx`:

- **TC-ROUTE-01 (`DoD #16`):** La ruta `/servicios` no debe existir en el router del proyecto (debe devolver 404 o redirigir).

---

## 8. Plan de Implementación por Etapas (Roadmap de Ejecución)

La implementación se dividirá en pasos lógicos secuenciales para mantener la suite de tests en verde en todo momento (`npm run test`, `npm run build`, `npx tsc --noEmit`):

### Etapa 1: Limpieza de Rutas y Configuración Centralizada

1. Eliminar `src/routes/servicios.tsx`.
2. Crear `src/config/site-config.ts` con todos los datos inmutables:
   - Nombre tipográfico: `"Laboratorio Diésel"`
   - Eslogan: `"Especialistas en inyección diésel"`
   - Propuestas de valor: `"Más de 20 años en el rubro"`, `"Equipamiento de última generación para la reparación y calibración de bombas e inyectores"`
   - Dirección: `"Pres. Juan Domingo Perón 1215, Villa Mercedes, San Luis"`
   - Horarios: `"Lunes a Viernes de 9:00 a 18:00 h"`
   - WhatsApp Placeholder: `"5491112345678"` (marcado para reemplazo futuro)
3. Crear `src/lib/whatsapp-utils.ts` y sus pruebas unitarias.

### Etapa 2: Componentes Atómicos y Secciones Estáticas

1. Crear `LandingNavbar.tsx` con soporte de menú responsive (breakpoint `md`).
2. Crear `HeroSection.tsx` con estilo `100dvh` y paleta en tonos azules (`RNF-01`).
3. Crear `ServicesSection.tsx` con las 4 tarjetas de servicio y sus íconos correspondientes.
4. Crear `WarrantySection.tsx` con el texto de términos y el botón preformateado.
5. Crear `LocationSection.tsx` con el iframe responsivo y fallback de texto.

### Etapa 3: Formulario Interactivo y Botón Flotante

1. Implementar `validateContactForm` y `ContactForm.tsx` con reseteo inmediato y feedback inline.
2. Implementar `FloatingWhatsApp.tsx` con lógica de posicionamiento y anti-colisión.
3. Crear `LandingFooter.tsx` con año dinámico y constantes centralizadas.

### Etapa 4: Integración en `src/routes/index.tsx` y Verificación Final

1. Reemplazar los componentes antiguos de `diesel-site.tsx` en `src/routes/index.tsx` por la nueva arquitectura modular.
2. Configurar la compensación de scroll (`scroll-mt-20`) y el hook de gestión de hash.
3. Ejecutar suite de pruebas completa:
   - `npx tsc --noEmit`
   - `npm run test`
   - `npm run build`
4. Validar el cumplimiento estricto de los 16 puntos del Definition of Done (DoD).
