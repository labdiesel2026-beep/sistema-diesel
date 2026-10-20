# Tasks — Spec 003: Catálogo de Productos y Repuestos

Las tareas están organizadas en bloques lógicos secuenciales según su orden de dependencia técnica, con una estimación de **20–30 minutos** cada una. Cada tarea debe completarse de forma atómica y verificarse mediante su comando exacto antes de continuar con la siguiente.

---

## Prerrequisitos de Ejecución

1. **Backend y API REST Operativos (Fase 005):** El backend Express en `/server` ya provee los endpoints `/api/products`, `/api/categories` y `/api/brands` respaldados por PostgreSQL y Prisma. El frontend interactúa **exclusivamente** mediante el cliente HTTP centralizado (`src/lib/api.ts`). No se debe instalar ni referenciar Prisma en el paquete raíz del frontend.
2. **Entorno de Testing:** Las pruebas unitarias y de componentes se ejecutan con Vitest y `@testing-library/react` desde la raíz del proyecto (`npx vitest run ...`).
3. **Persistencia y Caché Efímera:** El almacenamiento en `localStorage` no es autoritativo (Principio 5 de `docs/constitution.md`). Todo precio o visibilidad debe ser contrastado contra los datos frescos del backend.

---

## Bloque 1: Contratos, Tipos y Capa de Consumo de API REST

- [x] **T-01 — Definir tipos TypeScript y DTOs del catálogo público** (20–30 min) — RF: RF-02, RF-06, RF-07, RF-12.  
      Crear el archivo `src/types/catalog.ts` declarando las interfaces de dominio público (`CatalogProduct`, `CatalogBrand`, `CatalogCategory`, `CartItemCache`, `CartCacheV1`, `EnrichedCartItem`). Asegurar total correspondencia con los DTOs devueltos por el backend (`server/src/services/product.service.ts` y `src/types/admin.ts`), excluyendo estrictamente cualquier campo de inventario o stock.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-types.test.ts -t "tipos del catalogo coinciden con DTOs y excluyen stock"` pasa y `npx tsc --noEmit` termina sin errores.

- [x] **T-02 — Implementar servicio de consumo HTTP del catálogo** (20–30 min) — RF: RF-02, RF-04, RF-10, RF-11.  
      Crear `src/services/catalog-service.ts` encapsulando las peticiones a la API mediante `api.get` de `src/lib/api.ts`: `getVisibleProducts()` (filtra `visible: true`), `getAllProductsForValidation()` (para revalidación del carrito), `getCategories()`, `getBrands()` y `getProductById(id)`. Manejar errores devolviendo excepciones tipadas `ApiError`.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-service.test.ts -t "consume endpoints de api.ts y filtra visible true para catalogo"` pasa mockeando `src/lib/api.ts`.

---

## Bloque 2: Algoritmos de Búsqueda, Filtrado Jerárquico y Search Params

- [x] **T-03 — Esquemas Zod para Search Params e Identificadores UUID** (20–30 min) — RF: RF-03, RF-04, RNF-05.  
      Crear `src/schemas/catalog-schemas.ts` con esquemas Zod estrictos (`.strict()`) para validar los parámetros de búsqueda en URL (`catalogSearchParamsSchema`: `q`, `brand`, `category`) e identificadores UUID de producto (`uuidParamSchema`). Rechazar tipos no admitidos o campos desconocidos sin coerción silenciosa.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-schemas.test.ts -t "valida estrictamente search params de URL y UUIDs"` pasa.

- [x] **T-04 — Implementar normalización y búsqueda técnica con priorización OEM** (20–30 min) — RF: RF-03.  
      Crear `src/lib/catalog-search.ts` con la función de normalización Unicode NFD (eliminación de acentos y minúsculas) y búsqueda parcial en nombre (`name`), código OEM (`oem`), marca del repuesto y compatibilidad vehicular (`vehicleCompatibility`). Si el término coincide con el código OEM, ordenar los productos resultantes con prioridad máxima sobre otros campos.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-search.test.ts -t "normaliza acentos y prioriza resultados coincidentes por OEM"` pasa.

- [x] **T-05 — Implementar resolución de árbol de categorías y filtrado cruzado** (20–30 min) — RF: RF-02, RF-04.  
      Crear `src/lib/catalog-filter.ts` con el algoritmo de resolución jerárquica de categorías: si se selecciona una categoría padre, expandir automáticamente la búsqueda para incluir todas sus subcategorías hijas; aplicar `OR` entre categorías y marcas seleccionadas, y combinar `AND` entre búsqueda de texto, marcas y categorías.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-filter.test.ts -t "expande categorias padre a hijas y aplica AND entre dimensiones"` pasa.

---

## Bloque 3: Estado del Carrito y Revalidación contra Backend

- [x] **T-06 — Esquema Zod y persistencia efímera en localStorage** (20–30 min) — RF: RF-08, RNF-05, RNF-07, Principio 5.  
      Crear `src/lib/cart-storage.ts` con el esquema Zod `cartCacheSchema` (`CartCacheV1`). Implementar lectura y escritura en `localStorage` almacenando únicamente `productId`, `quantity` (enteros >= 1) y `lastKnown` (`name`, `oem`). Si la clave contiene JSON corrupto o versión no reconocida, limpiar la clave y devolver un carrito vacío sin romper la ejecución.
  - **Hecho cuando:** `npx vitest run src/test/catalog/cart-storage.test.ts -t "valida e hidrata cache efimera descartando datos corruptos"` pasa.

- [x] **T-07 — Contexto y máquina de estado del carrito** (20–30 min) — RF: RF-08, RF-12.  
      Crear `src/context/catalog-cart-context.tsx` (`CatalogCartProvider` y hook `useCatalogCart`). Proveer funciones `add` (si ya existe, incrementa cantidad en una sola fila), `updateQuantity` (asegura mínimo 1 unidad), `remove` y `clear`. No imponer límites de existencias ni simulaciones de stock.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-cart-context.test.tsx -t "gestiona operaciones del carrito sin restricciones de inventario"` pasa.

- [x] **T-08 — Servicio de enriquecimiento y revalidación del carrito con el backend** (20–30 min) — RF: RF-07, RF-08, RF-10, RF-11, Principio 5.  
      Crear `src/lib/cart-revalidation.ts` con la función `revalidateCartItems()`. Al recibir los ítems del carrito, consultar los datos frescos de la base de datos mediante `catalogService.getAllProductsForValidation()`. Marcar como `requiresReconfirmation: true` aquellos ítems con `visible: false` o cuyo registro haya sido eliminado, rotulando su precio como “A cotizar”.
  - **Hecho cuando:** `npx vitest run src/test/catalog/cart-revalidation.test.ts -t "detecta productos no visibles y actualiza precios autoritativos"` pasa.

---

## Bloque 4: Generación de Consultas a WhatsApp

- [x] **T-09 — Generador de consulta directa de producto por WhatsApp** (20–30 min) — RF: RF-06, RF-07, RF-09.  
      Crear en `src/lib/catalog-whatsapp.ts` la función `generateDirectProductWhatsAppUrl(product, brandName)`. Utilizar el número centralizado `SITE_CONFIG.phone` y `buildWhatsAppUrl()` de `src/lib/whatsapp-utils.ts`. Generar mensaje con cantidad asumida de 1 unidad, nombre, marca, OEM y precio público en ARS o leyenda “A cotizar”.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-whatsapp.test.ts -t "genera consulta directa con telefono oficial cantidad uno y precio correcto"` pasa.

- [x] **T-10 — Generador de mensaje de pedido del carrito** (20–30 min) — RF: RF-07, RF-08, RF-10, RF-11, RF-12.  
      Crear en `src/lib/catalog-whatsapp.ts` la función `generateCartWhatsAppUrl(enrichedItems)`. Generar mensaje pre-estructurado enumerando productos, cantidades, marcas, OEM y precios unitarios o "A cotizar". Incluir subtotal de ítems con precio público, advertencias de reconfirmación cuando apliquen y leyenda de solicitud de presupuesto sin reserva de existencias.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-whatsapp.test.ts -t "genera mensaje de carrito con items subtotal y notas de reconfirmacion"` pasa.

- [x] **T-11 — Generador de consulta asistida para estado sin resultados** (20–30 min) — RF: RF-05.  
      Crear en `src/lib/catalog-whatsapp.ts` la función `generateNoResultsWhatsAppUrl(searchQuery, activeBrandNames, activeCategoryNames)`. Generar mensaje contextualizado indicando la pieza buscada y los filtros aplicados para asistir al cliente desde WhatsApp.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-whatsapp.test.ts -t "genera consulta contextualizada para estado sin resultados"` pasa.

---

## Bloque 5: Componentes de UI, Skeletons y Placeholders

- [x] **T-12 — Componente ProductImageWithFallback con SVG accesible** (20–30 min) — RF: RF-06.  
      Crear `src/components/catalog/ProductImageWithFallback.tsx`. Resolver URLs de imagen mediante `resolveImageUrl()` de `src/lib/api.ts`. En caso de imagen ausente o fallo en el evento `onError`, renderizar un SVG vectorial local accesible con `role="img"` y leyenda _“Imagen no disponible”_.
  - **Hecho cuando:** `npx vitest run src/test/catalog/product-image.test.tsx -t "renderiza imagen resuelta o placeholder SVG local accesible ante fallo"` pasa.

- [x] **T-13 — Componente ProductCard y esqueleto de carga** (20–30 min) — RF: RF-06, RF-07, RF-08, RF-09.  
      Crear `src/components/catalog/ProductCard.tsx` y `ProductGridSkeleton.tsx`. Renderizar imagen con fallback, nombre del repuesto, marca, OEM, badge de condición ('Nuevo' | 'Reacondicionado' | 'Usado'), precio formateado en ARS o "Consultar precio", botón de agregar/remover del carrito y botón de WhatsApp directo.
  - **Hecho cuando:** `npx vitest run src/test/catalog/product-card.test.tsx -t "renderiza tarjeta completa precios condicionales y acciones"` pasa.

- [x] **T-14 — Componente CatalogFilters con árbol jerárquico** (20–30 min) — RF: RF-04.  
      Crear `src/components/catalog/CatalogFilters.tsx`. Desplegar selector de marcas con conteo dinámico de piezas y árbol de categorías con indentación visual para subcategorías hijas; incluir drawer deslizable para vista móvil y botón de limpieza de filtros.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-filters.test.tsx -t "renderiza arbol de categorias y marcas con conteos dinamicos"` pasa.

- [x] **T-15 — Componente CartDrawer con revalidación activa** (20–30 min) — RF: RF-08, RF-10, RF-11, RF-12.  
      Crear `src/components/catalog/CartDrawer.tsx` (reemplazando la versión previa acoplada a mocks). Conectar con `CatalogCartContext`, ejecutar `revalidateCartItems()` al abrir el drawer, mostrar ítems enriquecidos, controles de cantidad, advertencias visuales de vigencia para ítems ocultos y botón de checkout hacia WhatsApp.
  - **Hecho cuando:** `npx vitest run src/test/catalog/cart-drawer.test.tsx -t "despliega items enriquecidos advertencias de vigencia y checkout"` pasa.

---

## Bloque 6: Vistas de Ruta, Integración y Error Boundary

- [x] **T-16 — Componente CatalogErrorBoundary** (20–30 min) — RF: RF-02, Principio 6.  
      Crear `src/components/catalog/CatalogErrorBoundary.tsx`. Capturar fallos de red (`ApiError`), presentar al usuario el mensaje amigable _“Error temporal al cargar el catálogo”_ y un botón de reintento que vuelva a disparar las peticiones a la API sin filtrar datos internos.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-error-boundary.test.tsx -t "atrapa errores de carga y ofrece reintento sin exponer detalles"` pasa.

- [x] **T-17 — Actualizar ruta principal /catalogo** (20–30 min) — RF: RF-01, RF-02, RF-03, RF-04, RF-05, RNF-01, RNF-02.  
      Actualizar `src/routes/catalogo.tsx` integrando `LandingNavbar` y `LandingFooter` de `src/components/landing/`, sincronizando search params con TanStack Router (`q`, `brand`, `category`), renderizando `CatalogFilters`, `ProductCard`, `ProductGridSkeleton`, estados vacíos y el botón flotante del carrito.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalogo-route.test.tsx -t "integra layout institucional search params y estados del catalogo"` pasa.

- [x] **T-18 — Implementar ruta de ficha detallada /catalogo/$productId** (20–30 min) — RF: RF-06, RF-07, RF-09, RF-11.  
      Crear `src/routes/catalogo.$productId.tsx`. Consumir `catalogService.getProductById(id)`. Si el producto no existe o tiene `visible: false`, mostrar la vista de _“Producto no disponible”_ con botón para volver al catálogo. Si es visible, renderizar la ficha técnica completa con galería, especificaciones y acciones de compra/consulta.
  - **Hecho cuando:** `npx vitest run src/test/catalog/product-detail-route.test.tsx -t "muestra ficha tecnica para producto visible y estado no disponible para oculto"` pasa.

---

## Bloque 7: Verificación Integral de Aceptación y Calidad

- [x] **T-19 — Pruebas de integración E2E de flujos de usuario del catálogo** (20–30 min) — RF: RF-01 a RF-12; RNF-01 a RNF-07.  
      Crear `src/test/catalog/catalog-integration.test.tsx` simulando el flujo completo de navegación: carga inicial con skeletons -> búsqueda por código OEM -> filtrado por categoría padre -> agregado al carrito -> revalidación contra backend -> apertura de WhatsApp con mensaje estructurado.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-integration.test.tsx -t "flujo completo de navegacion busqueda carrito y checkout"` pasa.

- [x] **T-20 — Verificación final de tipado estricto, calidad de código y compilación** (20–30 min) — RF: Todos los RF y RNF de la Spec 003.  
      Ejecutar el chequeo completo de TypeScript en modo estricto, linter y suite completa de tests unitarios del catálogo.
  - **Hecho cuando:** `npx tsc --noEmit` termina con 0 errores y `npx vitest run src/test/catalog/` aprueba el 100% de las suites de prueba.
