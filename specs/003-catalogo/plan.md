# Plan Técnico de Implementación — Spec 003: Catálogo de Productos y Repuestos

**Fase:** 003-catalogo  
**Versión:** 2.0 (Alineado con Spec 003 v2.0, Specs 004/005, `docs/constitution.md` y `AGENTS.MD`)  
**Fecha:** 2026-10-19  
**Estado:** Documento de Planificación de Arquitectura Técnica

---

## 1. Propósito, Alcance y Principios Arquitectónicos

Este documento define la arquitectura técnica para la implementación del Catálogo Público de Repuestos e Inyectores Diésel. Sustituye cualquier dependencia previa de datos mockeados o simulados (`catalog-data.ts`), integrando la interfaz pública directamente con la API REST del backend desarrollada en la Fase 005 a través del cliente HTTP centralizado (`src/lib/api.ts`).

### 1.1 Reglas Constitucionales y de Seguridad Aplicadas

| Principio                                 | Aplicación Concreta en el Catálogo                                                                                                                                                                                                                                                                                          |
| :---------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. SDD-First**                          | Prohibido escribir código sin completar la triada Spec -> Plan -> Tasks. Toda funcionalidad del catálogo debe estar respaldada por su correspondiente requerimiento funcional (RF).                                                                                                                                         |
| **2. Fail-Fast (Zod)**                    | Validación rigurosa con esquemas Zod `.strict()` sobre los search params de la URL (`q`, `brand`, `category`), identificadores UUID de ruta (`$productId`) y el contenido recuperado de `localStorage` para el carrito.                                                                                                     |
| **3. Upload Paranoico (Sharp)**           | El frontend público **no realiza subidas de archivos**. Solo consume y renderiza imágenes ya procesadas y sanitizadas por el backend (WebP ≤ 500 KB con UUID opaco bajo `/uploads/`), aplicando resolución de URLs mediante `resolveImageUrl()` y un fallback SVG local accesible ante fallos.                              |
| **4. Sesión Zero-Trust**                  | El catálogo y el carrito son rutas públicas no autenticadas. No manejan JWT de administrador ni tocan cookies de sesión; viajan con `credentials: 'include'` estándar del cliente `api.ts`.                                                                                                                                 |
| **5. Persistencia como fuente de verdad** | PostgreSQL (vía backend Express/Prisma) es la **única autoridad** de productos, categorías, marcas, precios y visibilidad. `localStorage` es una caché efímera descartable y no autoritativa: al abrir el carrito o preparar el mensaje de WhatsApp, los datos deben revalidarse obligatoriamente contra el backend fresco. |
| **6. Errores Opacos**                     | Los fallos de red (`ApiError`) se atrapan mediante un Error Boundary específico del catálogo que expone al visitante el mensaje amigable _“Error temporal al cargar el catálogo”_ con opción de reintento, sin filtrar detalles internos del servidor.                                                                      |

---

## 2. Topología de Red y Frontera Cliente-Servidor

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FRONTEND (Vite + React 19 + SPA)                     │
│                                                                        │
│  Ruta /catalogo y /catalogo/$productId (TanStack Router)               │
│    │                                                                   │
│    ├── CatalogSearch & CatalogFilters (URL Search Params con Zod)      │
│    ├── CatalogCartProvider (Estado en memoria + Caché localStorage)    │
│    └── CatalogService (Consumo HTTP tipado)                            │
│           │                                                            │
│           ▼                                                            │
│       src/lib/api.ts (fetch, credentials: 'include', CSRF Header)      │
└───────────┬────────────────────────────────────────────────────────────┘
            │ HTTP GET (CORS / Cookies HttpOnly)
            ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express + Prisma)                  │
│                                                                        │
│  /api/products?visibleOnly=true  --> Retorna ProductDto[] (Fase 5)     │
│  /api/categories                 --> Retorna Category[] con jerarquía  │
│  /api/brands                     --> Retorna Brand[]                   │
│  /api/products/:id               --> Retorna ProductDto individual     │
│           │                                                            │
│           ▼                                                            │
│  PostgreSQL (Prisma ORM) [Única fuente de verdad autoritativa]         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Modelo de Datos y Tipos TypeScript

Los tipos de datos del catálogo se alinean de forma exacta con los DTOs devueltos por el backend (`server/src/services/product.service.ts` y `src/types/admin.ts`).

### 3.1 DTOs y Contratos de Consumo (`src/types/catalog.ts`)

```ts
/**
 * Repuesto diésel público del catálogo (compatible 1:1 con ProductDto del backend).
 */
export interface CatalogProduct {
  id: string; // UUID v4
  name: string;
  description: string;
  imageUrl: string; // e.g. "/uploads/a0f1e2d3-1111-4000-8000-111111111111.webp"
  categoryIds: string[]; // UUIDs planos
  brandId: string; // UUID de la marca
  vehicleCompatibility: string | null;
  condition: "Nuevo" | "Reacondicionado" | "Usado";
  price: number | null; // Entero en ARS o null si es "A cotizar"
  showPrice: boolean; // Si false, se muestra "Consultar precio"
  visible: boolean; // Solo visible === true se exhibe en el listado público
  oem: string | null; // Código OEM grabado en la pieza
}

/**
 * Marca de repuestos obtenida de GET /api/brands.
 */
export interface CatalogBrand {
  id: string; // UUID v4
  name: string;
}

/**
 * Categoría con estructura jerárquica (máx 1 nivel) obtenida de GET /api/categories.
 */
export interface CatalogCategory {
  id: string; // UUID v4
  name: string;
  parentId: string | null;
  parent?: { id: string; name: string } | null;
  children?: { id: string; name: string }[];
}

/**
 * Representación efímera en localStorage (Principio 5: Caché no autoritativa).
 */
export interface CartItemCache {
  productId: string; // UUID v4
  quantity: number; // Entero >= 1
  lastKnown: {
    name: string;
    oem: string | null;
  };
}

export interface CartCacheV1 {
  version: 1;
  items: CartItemCache[];
}

/**
 * Ítem de carrito enriquecido y contrastado contra el backend fresco.
 */
export interface EnrichedCartItem {
  productId: string;
  quantity: number;
  name: string;
  oem: string | null;
  imageUrl: string;
  brandName: string;
  condition: "Nuevo" | "Reacondicionado" | "Usado";
  price: number | null;
  showPrice: boolean;
  visible: boolean;
  requiresReconfirmation: boolean; // true si visible === false o fue modificado/eliminado
  isDeletedOrUnavailable: boolean; // true si ya no existe en el backend
}
```

---

## 4. Capa de Servicio del Catálogo (`src/services/catalog-service.ts`)

La capa de servicio abstrae las llamadas a la API a través del cliente `api` (`src/lib/api.ts`):

```ts
import { api, resolveImageUrl } from "@/lib/api";
import type { CatalogProduct, CatalogCategory, CatalogBrand } from "@/types/catalog";

export const catalogService = {
  /**
   * Obtiene todos los productos del catálogo y filtra visible: true para el listado público.
   */
  async getVisibleProducts(): Promise<CatalogProduct[]> {
    const products = await api.get<CatalogProduct[]>("/api/products");
    return products.filter((p) => p.visible === true);
  },

  /**
   * Obtiene todos los productos para revalidación del carrito (incluye visible: false).
   */
  async getAllProductsForValidation(): Promise<CatalogProduct[]> {
    return api.get<CatalogProduct[]>("/api/products");
  },

  /**
   * Obtiene el detalle de un producto individual por ID.
   */
  async getProductById(id: string): Promise<CatalogProduct> {
    return api.get<CatalogProduct>(`/api/products/${id}`);
  },

  /**
   * Obtiene el árbol completo de categorías.
   */
  async getCategories(): Promise<CatalogCategory[]> {
    return api.get<CatalogCategory[]>("/api/categories");
  },

  /**
   * Obtiene la lista completa de marcas.
   */
  async getBrands(): Promise<CatalogBrand[]> {
    return api.get<CatalogBrand[]>("/api/brands");
  },
};
```

---

## 5. Algoritmos en Detalle (Pseudocódigo)

### 5.1 Normalización y Búsqueda Técnica con Prioridad OEM

```text
NORMALIZAR(texto):
    si texto es nulo o indefinido: retornar ""
    retornar texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remueve marcas diacríticas (acentos)
        .toLowerCase()
        .trim()

FILTRAR_Y_ORDENAR_CATALOGO(productos, query, marcasSeleccionadas, categoriasSeleccionadas, mapaCategorias, mapaMarcas):
    qNorm = NORMALIZAR(query)
    setMarcas = Set(marcasSeleccionadas)

    // 1. Expandir selección de categorías para incluir subcategorías hijas
    setCategoriasExpandidas = Set()
    para cada catId en categoriasSeleccionadas:
        setCategoriasExpandidas.add(catId)
        cat = mapaCategorias.get(catId)
        si cat y cat.children:
            para cada hija en cat.children:
                setCategoriasExpandidas.add(hija.id)

    resultados = []

    para cada producto en productos:
        // A. Filtro de Texto
        coincideOEM = producto.oem != null AND NORMALIZAR(producto.oem).includes(qNorm)
        marcaNombre = mapaMarcas.get(producto.brandId)?.name || ""
        coincideTexto = (qNorm == "") OR (
            NORMALIZAR(producto.name).includes(qNorm) OR
            coincideOEM OR
            NORMALIZAR(marcaNombre).includes(qNorm) OR
            (producto.vehicleCompatibility != null AND NORMALIZAR(producto.vehicleCompatibility).includes(qNorm))
        )

        // B. Filtro de Marca (OR entre marcas seleccionadas)
        coincideMarca = (setMarcas.size == 0) OR setMarcas.has(producto.brandId)

        // C. Filtro de Categoría (OR entre categorías expandidas)
        coincideCategoria = (setCategoriasExpandidas.size == 0) OR (
            producto.categoryIds.some(id => setCategoriasExpandidas.has(id))
        )

        // D. Combinación AND global
        si coincideTexto AND coincideMarca AND coincideCategoria:
            prioridadOEM = coincideOEM ? 0 : 1
            resultados.push({ producto, prioridadOEM })

    // Ordenar: primero los coincidentes por OEM, luego por orden alfabético
    ordenar resultados por:
        si a.prioridadOEM != b.prioridadOEM:
            retornar a.prioridadOEM - b.prioridadOEM
        retornar a.producto.name.localeCompare(b.producto.name)

    retornar resultados.map(r => r.producto)
```

### 5.2 Revalidación Autorizada del Carrito contra Backend (Principio 5)

```text
REVALIDAR_CARRITO(itemsCache, catalogoFresco, mapaMarcas):
    itemsEnriquecidos = []
    mapaProductos = Map(catalogoFresco.map(p => [p.id, p]))

    para cada item en itemsCache:
        prodActual = mapaProductos.get(item.productId)

        si no existe prodActual:
            // Producto eliminado físicamente de la base de datos
            itemsEnriquecidos.push({
                productId: item.productId,
                quantity: item.quantity,
                name: item.lastKnown.name,
                oem: item.lastKnown.oem,
                imageUrl: "",
                brandName: "No disponible",
                condition: "Usado",
                price: null,
                showPrice: false,
                visible: false,
                requiresReconfirmation: true,
                isDeletedOrUnavailable: true
            })
        sino si prodActual.visible == false:
            // Producto existente pero ocultado en el panel administrativo
            itemsEnriquecidos.push({
                productId: prodActual.id,
                quantity: item.quantity,
                name: prodActual.name,
                oem: prodActual.oem,
                imageUrl: prodActual.imageUrl,
                brandName: mapaMarcas.get(prodActual.brandId)?.name || "",
                condition: prodActual.condition,
                price: null, // Forzado a null para cotizar
                showPrice: false,
                visible: false,
                requiresReconfirmation: true,
                isDeletedOrUnavailable: false
            })
        sino:
            // Producto activo y plenamente vigente
            itemsEnriquecidos.push({
                productId: prodActual.id,
                quantity: item.quantity,
                name: prodActual.name,
                oem: prodActual.oem,
                imageUrl: prodActual.imageUrl,
                brandName: mapaMarcas.get(prodActual.brandId)?.name || "",
                condition: prodActual.condition,
                price: prodActual.price,
                showPrice: prodActual.showPrice,
                visible: true,
                requiresReconfirmation: false,
                isDeletedOrUnavailable: false
            })

    retornar itemsEnriquecidos
```

### 5.3 Construcción de Mensajes y URLs de WhatsApp (`src/lib/whatsapp-utils.ts`)

```text
CONSTRUIR_MENSAJE_CARRITO(itemsEnriquecidos):
    lineas = ["Hola, me contacto desde la web de Laboratorio Diésel.", "Quisiera solicitar cotización para los siguientes repuestos:", ""]

    subtotalCalculable = 0
    hayProductosACotizar = false
    hayRequiereReconfirmacion = false

    para cada (item, indice) en itemsEnriquecidos:
        etiquetaPrecio = ""
        si item.requiresReconfirmation:
            etiquetaPrecio = "A cotizar (Requiere reconfirmación con taller)"
            hayRequiereReconfirmacion = true
            hayProductosACotizar = true
        sino si item.showPrice == true AND item.price != null:
            subtotalCalculable += (item.price * item.quantity)
            etiquetaPrecio = formatPrice(item.price * item.quantity) + " (" + formatPrice(item.price) + " c/u)"
        sino:
            etiquetaPrecio = "A cotizar"
            hayProductosACotizar = true

        oemTexto = item.oem ? " | OEM: " + item.oem : ""
        marcaTexto = item.brandName ? " | Marca: " + item.brandName : ""

        lineas.push((indice + 1) + ". " + item.quantity + "x " + item.name + marcaTexto + oemTexto + " -> " + etiquetaPrecio)

    lineas.push("")
    si subtotalCalculable > 0:
        lineas.push("Subtotal productos con precio público: " + formatPrice(subtotalCalculable))

    si hayProductosACotizar:
        lineas.push("* Solicito cotización actualizada de los productos sin precio público.")

    si hayRequiereReconfirmacion:
        lineas.push("⚠️ Algunos productos requieren verificar vigencia actual en taller.")

    lineas.push("¿Podrían confirmarme compatibilidad técnica y disponibilidad de entrega?")

    retornar lineas.join("\n")
```

---

## 6. Jerarquía de Componentes de UI (React 19)

```text
<PublicLayout> (LandingNavbar + LandingFooter)
  │
  ├── [Ruta: /catalogo] (src/routes/catalogo.tsx)
  │     ├── <CatalogHeroHeader> (Título, subtítulo y barra de búsqueda interactiva)
  │     ├── <CatalogContainer> (Grid adaptable: Sidebar en escritorio, Drawer en móvil)
  │     │     ├── <CatalogFiltersSidebar>
  │     │     │     ├── <BrandFilterSection> (Checkboxes con conteo dinámico de productos)
  │     │     │     ├── <CategoryFilterSection> (Árbol con indentación para subcategorías)
  │     │     │     └── <ClearFiltersButton>
  │     │     │
  │     │     └── <CatalogMainContent>
  │     │           ├── <ActiveFilterChips> (Etiquetas removibles de búsqueda y filtros)
  │     │           ├── <ResultsCountBadge>
  │     │           ├── <ProductGrid>
  │     │           │     ├── <ProductCard> (Iteración de productos visibles)
  │     │           │     │     ├── <ProductImageWithFallback> (resolveImageUrl + SVG local)
  │     │           │     │     ├── Badges (Marca, Condición, OEM)
  │     │           │     │     ├── <PriceDisplay> (Precio formateado o "Consultar precio")
  │     │           │     │     ├── <AddToCartButton> (Alterna estado si ya está en carrito)
  │     │           │     │     └── <DirectWhatsAppCTA> (Consulta individual 1 unidad)
  │     │           │     └── <ProductGridSkeleton> (Estado de carga asíncrona)
  │     │           ├── <EmptyCatalogState> (Sin productos visibles publicados)
  │     │           ├── <NoResultsState> (Con botón WhatsApp contextualizado)
  │     │           └── <CatalogErrorBoundary> (Mensaje "Error temporal" con botón reintentar)
  │     │
  │     ├── <CatalogCartTrigger> (Botón flotante con badge contador)
  │     └── <CartDrawer> (Sheet lateral interactivo del carrito)
  │           ├── <CartItemsList> (Controles de cantidad +, -, eliminar)
  │           ├── <CartReconfirmationAlert> (Aviso de vigencia en catálogo)
  │           ├── <CartSubtotalSection>
  │           └── <WhatsAppCheckoutButton> (Revalida con backend y abre wa.me)
  │
  └── [Ruta: /catalogo/$productId] (src/routes/catalogo.$productId.tsx)
        ├── <ProductDetailView> (Ficha técnica completa)
        └── <ProductUnavailableState> (Si visible === false o no existe)
```

---

## 7. Esquemas de Validación con Zod (Fail-Fast)

```ts
// src/schemas/catalog-schemas.ts
import { z } from "zod";

/**
 * Esquema estricto para los parámetros de búsqueda en la URL de /catalogo.
 */
export const catalogSearchParamsSchema = z
  .object({
    q: z.string().trim().optional().default(""),
    brand: z.union([z.string().uuid(), z.array(z.string().uuid())]).optional(),
    category: z.union([z.string().uuid(), z.array(z.string().uuid())]).optional(),
  })
  .strict();

export type CatalogSearchParams = z.infer<typeof catalogSearchParamsSchema>;

/**
 * Esquema estricto para validar la caché del carrito en localStorage.
 */
export const cartCacheSchema = z
  .object({
    version: z.literal(1),
    items: z.array(
      z
        .object({
          productId: z.string().uuid("ID de producto inválido"),
          quantity: z.number().int().positive("La cantidad debe ser mayor a 0"),
          lastKnown: z
            .object({
              name: z.string().min(1),
              oem: z.string().nullable(),
            })
            .strict(),
        })
        .strict(),
    ),
  })
  .strict();
```

---

## 8. Estrategia de Pruebas Automatizadas (Vitest)

Las pruebas unitarias y de integración se ejecutan con Vitest simulando las respuestas del cliente HTTP `src/lib/api.ts` mediante `vi.mock("@/lib/api")`.

### 8.1 Pruebas Unitarias

| Suite                       | Casos de Prueba Críticos                                                                                                                            | RF Asociado         |
| :-------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------ |
| `catalog-search.test.ts`    | Normalización Unicode NFD (acentos, mayúsculas); coincidencias parciales; priorización de OEM sobre otros campos.                                   | RF-03               |
| `catalog-filter.test.ts`    | Filtrado por marcas (OR); árbol de categorías (selección de padre expande a hijas); combinación AND entre búsqueda, marca y categorías.             | RF-04               |
| `cart-cache.test.ts`        | Validación Zod de `localStorage`; recuperación segura ante JSON dañado o versión incorrecta (inicializa vacío).                                     | RF-08, RNF-05       |
| `cart-revalidation.test.ts` | Detección de productos ocultados (`visible: false`) y marcación con aviso de vigencia; productos eliminados conservan `lastKnown` sin precio.       | RF-08, RF-10, RF-11 |
| `whatsapp-utils.test.ts`    | Construcción de URL con `SITE_CONFIG.phone`; codificación segura de saltos de línea y emojis; cálculo correcto de subtotal y etiquetas "A cotizar". | RF-05, RF-09, RF-10 |

### 8.2 Pruebas de Integración de Componentes y Rutas

| Suite                             | Casos de Prueba Críticos                                                                                                                                                   | RF Asociado                       |
| :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| `catalogo-route.test.tsx`         | Carga asíncrona con skeleton; renderizado de productos visibles; sincronización bidireccional de search params en la URL; estado sin resultados con botón contextualizado. | RF-01, RF-02, RF-03, RF-04, RF-05 |
| `cart-drawer.test.tsx`            | Incremento de cantidad en fila única; eliminación de ítem; bloqueo de botón cuando está vacío; advertencia de vigencia para productos no visibles.                         | RF-08, RF-10, RF-11               |
| `product-detail-route.test.tsx`   | Renderizado de ficha técnica con atributos opcionales; estado "Producto no disponible" para UUIDs no visibles o inexistentes.                                              | RF-06, RF-07, RF-11               |
| `catalog-error-boundary.test.tsx` | Captura de `ApiError` 500/red; muestra mensaje "Error temporal al cargar el catálogo"; botón reintentar dispara nueva petición.                                            | RF-02                             |
