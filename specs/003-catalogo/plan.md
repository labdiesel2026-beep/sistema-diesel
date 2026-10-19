# Plan Técnico de Implementación — Spec 003: Catálogo de Productos y Repuestos

## 1. Propósito, alcance y principios

Este plan traduce la [Spec 003](./spec.md) en una propuesta técnica para la experiencia pública del catálogo. Extiende la ruta y los componentes de catálogo existentes, conserva la experiencia institucional de la Spec 002 y sustituye los datos de demostración por lecturas autoritativas del catálogo.

El alcance comprende búsqueda, filtros, listado y ficha pública, estado del carrito, generación de consultas a WhatsApp, manejo de productos que ya no están visibles, y estados de carga y error. No implementa compra, pagos, envíos, gestión administrativa del catálogo ni un proceso de carga de imágenes.

### 1.1 Reglas constitucionales aplicadas

| Principio | Aplicación en el plan |
|:---|:---|
| **1. SDD-First** | La implementación debe esperar la aprobación de esta Spec y plan. Cada cambio deberá corresponder a una tarea de implementación derivada posteriormente. |
| **2. Fail-Fast (Zod)** | Validar con esquemas Zod estrictos los search params, parámetros de ruta, entradas que crucen la frontera servidor/cliente y el contenido recuperado del caché local. Los errores de servidor no deben incluir detalles internos. |
| **3. Upload Paranoico (Sharp)** | La experiencia pública no recibe archivos. Solo renderiza imágenes publicadas y confiables; cualquier flujo administrativo de carga debe entregar imágenes reconstruidas con Sharp en WebP ≤ 500 KB, sin EXIF y con nombre opaco. La carga no se implementa en esta fase. |
| **4. Sesión Zero-Trust** | Las rutas de catálogo son públicas y no leen ni exponen credenciales o tokens de administrador. No se crea una sesión de cliente. |
| **5. Persistencia como fuente de verdad** | PostgreSQL, accedido exclusivamente mediante Prisma, es la fuente autoritativa de productos, precios, marcas, categorías y visibilidad. El caché del navegador guarda solo el estado recuperable del carrito y una etiqueta de último recurso para ítems eliminados; nunca es autoridad de precios ni de publicación. |
| **6. Errores Opacos** | Los errores internos se registran en el servidor con referencia y detalle. La respuesta de error al cliente contiene únicamente la referencia opaca. La interfaz presenta el mensaje funcional previsto en la Spec, sin stack traces ni detalles internos. |

### 1.2 Matriz de cobertura funcional

| RF | Componentes / servicios principales | Secciones de este plan |
|:---|:---|:---|
| **RF-01** | Layout público compartido, navegación y footer; ruta de catálogo | 2 |
| **RF-02** | Loader/servicio de catálogo visible; estado vacío; Error Boundary | 2, 5, 7 |
| **RF-03** | Search params validados; servicio de búsqueda parcial y priorización OEM | 2, 5, 7 |
| **RF-04** | Filtros de marca y categorías; algoritmo de combinación OR/AND | 2, 5, 7 |
| **RF-05** | Estado sin resultados y constructor de contexto para WhatsApp | 2, 5, 7 |
| **RF-06** | Tarjeta, ficha técnica, placeholder SVG y ruta de detalle | 2, 3, 7 |
| **RF-07** | Presentación de precio condicionada por visibilidad | 3, 5, 7 |
| **RF-08** | Proveedor y panel de carrito, validación de cantidad, caché efímera | 2, 3, 7 |
| **RF-09** | Acción de consulta directa y generador de WhatsApp con cantidad 1 | 2, 5, 7 |
| **RF-10** | Resolución fresca de ítems/precios y envío de consulta del carrito | 2, 5, 7 |
| **RF-11** | Estado de vigencia, resolución de ítems ocultos/eliminados y ficha no disponible | 2, 3, 5, 7 |
| **RF-12** | DTO público sin existencias; etiquetas de vigencia distintas de stock | 3, 5, 7 |

## 2. Rutas y estructura de componentes React

### 2.1 Rutas públicas

Se conserva `/catalogo` como entrada del listado y se agrega una ruta de detalle con identificador estable:

| Ruta | Responsabilidad | RF |
|:---|:---|:---|
| `/catalogo` | Validar search params, cargar opciones de filtros y resultados visibles, renderizar búsqueda, listado, estados vacíos y CTA de consulta. | RF-01–RF-05, RF-07, RF-08, RF-12 |
| `/catalogo/$productId` | Cargar la ficha de un producto visible o mostrar “Producto no disponible” para un producto oculto, eliminado o inexistente. | RF-06, RF-07, RF-09, RF-11, RF-12 |

La ruta existente `/catalogo` ya utiliza TanStack Router y un layout público compartido. Se conserva ese punto de entrada y se integra el detalle en el mismo sistema de rutas. No se crea una nueva zona de autenticación ni una ruta de checkout.

### 2.2 Árbol de interfaz propuesto

```text
Root route
└── QueryClientProvider
    └── CatalogCartProvider (vacío al inicio; hidrata caché validada)
        └── Outlet
            ├── /catalogo
            │   └── PublicLayout (Header + Footer existentes)
            │       └── CatalogPage
            │           ├── CatalogIntro
            │           ├── CatalogSearch (q en URL)
            │           ├── CatalogFilters
            │           │   ├── BrandFilter
            │           │   └── CategoryFilter
            │           ├── ActiveFilterChips
            │           ├── ResultsSummary
            │           ├── ProductGrid
            │           │   └── ProductCard
            │           │       ├── ProductImage / ImageUnavailablePlaceholder
            │           │       ├── PriceLabel
            │           │       ├── ViewProductLink
            │           │       ├── AddToCartButton
            │           │       └── DirectWhatsAppCTA
            │           ├── EmptyCatalogState
            │           ├── NoResultsState + NoResultsWhatsAppCTA
            │           ├── CatalogErrorBoundary
            │           └── CatalogCartTrigger + CartDrawer
            └── /catalogo/$productId
                └── PublicLayout
                    ├── ProductDetail
                    │   ├── ProductImage / ImageUnavailablePlaceholder
                    │   ├── ProductAttributes
                    │   ├── PriceLabel
                    │   ├── AddToCartButton
                    │   └── DirectWhatsAppCTA (cantidad asumida: 1)
                    └── ProductUnavailableState
```

### 2.3 Límites entre componentes y servidor

| Superficie | Responsabilidad | RF |
|:---|:---|:---|
| `CatalogPage` | Orquestar estado de búsqueda y filtros desde la URL; presentar datos del loader y estados de carga/error. No contiene reglas duplicadas de filtrado. | RF-01–RF-05 |
| `ProductCard` / `ProductDetail` | Renderizar solo datos públicos; usar placeholder local si no hay imagen; delegar acciones al carrito y al generador de WhatsApp. | RF-06, RF-07, RF-09 |
| `CatalogCartProvider` | Exponer operaciones add, cambiar cantidad, quitar y vaciar; consolidar IDs repetidos; persistir caché efímera validada. No guarda precios autoritativos. | RF-08, RF-11 |
| `CartDrawer` | Mostrar ítems y cantidades, estado vacío, reconfirmación de vigencia y acción de consulta. No representa una orden confirmada. | RF-08, RF-10–RF-12 |
| `PublicCatalogService` | Consultar PostgreSQL mediante Prisma, aplicar visibilidad y filtros y construir DTO públicos. | RF-02–RF-07, RF-11, RF-12 |
| `WhatsAppQuoteService` | Resolver IDs del carrito contra datos vigentes, determinar la etiqueta de precio y generar el mensaje. | RF-05, RF-07, RF-09–RF-12 |
| `CatalogErrorBoundary` | Recuperar fallos de carga con el mensaje “Error temporal al cargar el catálogo” y una acción de reintento; no mostrar detalles internos. | RF-02 |

**Frontera servidor/cliente:** TanStack Router carga y valida la navegación; las lecturas de catálogo y la resolución final del carrito se ejecutan del lado servidor mediante funciones/servicios de TanStack Start. El servicio usa Prisma para acceder a PostgreSQL. El cliente nunca recibe acceso directo a la base de datos.

La resolución final del carrito debe ser una sola operación de lectura por lote: recibe IDs y cantidades validados, recupera producto y precio vigentes, y devuelve un resultado listo para componer el mensaje. No convertir esta operación en una escritura ni crear una orden o reserva.

La resolución del carrito es un contrato interno distinto del listado público: puede determinar si un ID corresponde a un producto visible, oculto o eliminado para conservar el contexto de una selección previa. Para los no visibles devuelve únicamente la información mínima necesaria para esa consulta; nunca los incorpora a resultados, opciones de filtro ni fichas públicas.

## 3. Modelo de datos TypeScript y estado del carrito

Los siguientes contratos son tipos de diseño para el plan, no código de implementación. Los DTO públicos excluyen explícitamente las existencias y cualquier campo administrativo no necesario para la navegación pública.

### 3.1 Tipos de dominio/DTO

```ts
type ProductId = string;
type BrandId = string;
type CategoryId = string;

type ProductCategory = {
  id: CategoryId;
  name: string;
  parentId: CategoryId | null;
};

type VehicleCompatibility = {
  make: string | null;
  model: string | null;
  engine: string | null;
};

type PublicPrice = {
  amountArs: string;
  isVisible: true;
};

type PublicProduct = {
  id: ProductId;
  name: string;
  description: string;
  imageUrl: string | null;
  oemCode: string | null;
  brand: { id: BrandId; name: string } | null;
  categories: ProductCategory[];
  compatibility: VehicleCompatibility[];
  condition: string | null;
  price: PublicPrice | null;
};

type CartItemCache = {
  productId: ProductId;
  quantity: number;
  lastKnown: {
    name: string;
    oemCode: string | null;
  };
};

type CartCacheV1 = {
  version: 1;
  items: CartItemCache[];
};
```

`PublicPrice` solo existe cuando el producto tiene precio cargado y habilitado para mostrarse. Si no, el DTO contiene `price: null`, que se representa como “Consultar precio” en catálogo/ficha y “A cotizar” en carrito/mensaje. El valor monetario viaja en representación decimal exacta, no como precio de cálculo binario en el cliente.

La entidad persistida del producto además de los campos públicos debe permitir filtrar por estado visible y mantener las relaciones con marca y una o varias categorías. El modelo no agrega un campo de stock al DTO ni a los mensajes. La visibilidad y el precio real se leen desde la entidad fuente de verdad.

**RF cubiertos:** RF-02, RF-03, RF-04, RF-06, RF-07, RF-11, RF-12.

### 3.2 Estado del carrito y ejemplo JSON

El estado en memoria contiene los mismos ítems validados del contrato de caché, junto a un estado de hidratación/error de interfaz. `version` permite invalidar formatos incompatibles explícitamente. Cada ID aparece como máximo una vez.

Ejemplo ilustrativo del contenido efímero del navegador:

```json
{
  "version": 1,
  "items": [
    {
      "productId": "prod_amarok_20",
      "quantity": 2,
      "lastKnown": {
        "name": "Inyector Amarok 2.0 TDI",
        "oemCode": "0445110369"
      }
    },
    {
      "productId": "prod_ranger_32",
      "quantity": 1,
      "lastKnown": {
        "name": "Inyector Ranger 3.2 TDCi",
        "oemCode": "28236381"
      }
    }
  ]
}
```

El caché **no incluye** precio, visibilidad, marca/categoría autoritativas ni stock. `lastKnown` únicamente permite identificar en el carrito un producto eliminado o que ya no se puede resolver; se etiqueta como pendiente de reconfirmación y nunca se usa para presentar precio o disponibilidad. Al enviar, se consultan datos actuales para todos los IDs. Si un producto no tiene resolución vigente, se usa su etiqueta almacenada solo para identificar la consulta y se cotiza sin precio.

Las entradas de `localStorage` son datos no confiables. Se validan al hidratarlas y antes de cada transición con Zod `.strict()`; ID, cantidad entera positiva y estructura de `lastKnown` deben ser válidos. Si el contenido es inválido o el formato/versionado no se reconoce, no se interpreta ni se usa para componer una consulta: se presenta un aviso recuperable, se ofrece vaciar/reiniciar el caché y se registra el fallo sin filtrar información sensible.

**Transiciones principales:**

1. **Add existente:** localizar por `productId` e incrementar cantidad en `+1`, conservando una única línea.
2. **Add nuevo:** agregar con cantidad `1` y etiqueta actual conocida.
3. **Cambiar cantidad:** aceptar únicamente enteros positivos; no aplicar ninguna restricción de existencias ni un máximo propio de productos.
4. **Quitar/vaciar:** actualizar el estado en memoria y el caché.
5. **Hidratación:** validar estructura; consultar la resolución interna por lote para resolver etiqueta/estado vigente; preservar como pendiente de reconfirmación lo que ya no esté publicado.
6. **Cambio de producto/visibilidad:** actualizar la etiqueta auxiliar para futuras cargas solo como último dato conocido; nunca alterar el rol autoritativo de la base de datos.

**RF cubiertos:** RF-08, RF-10, RF-11, RF-12; RNF-07 y CL-05–CL-07, CL-13.

## 4. Estado de filtros en URL

### 4.1 Search params

La ruta `/catalogo` mantiene el estado navegable en search params repetibles:

| Param | Tipo conceptual | Significado |
|:---|:---|:---|
| `q` | texto opcional | Término de búsqueda. |
| `brand` | lista de IDs | Marcas seleccionadas. |
| `category` | lista de IDs | Categorías/subcategorías seleccionadas. |

Ejemplo de URL compartible: `/catalogo?q=044511&brand=bosch&category=common-rail&category=injectores-piezo`. El ejemplo es solo ilustrativo: la codificación concreta debe ser consistente con TanStack Router.

El esquema de validación de búsqueda de la ruta será Zod `.strict()`. Se validan tipos, forma de las listas y estructura de los identificadores; se normalizan espacios del texto sin cambiar el valor visible que el visitante ingresó. Parámetros desconocidos o malformados no deben producir resultados silenciosamente distintos: se manejan mediante el estado de error de navegación, sin exponer errores internos.

### 4.2 Flujo de sincronización

1. El usuario escribe, activa o quita un filtro.
2. La interfaz actualiza search params mediante navegación de TanStack Router; los cambios frecuentes de `q` reemplazan la entrada actual de historial, mientras que filtros confirmados pueden mantener navegación atrás/adelante útil.
3. El loader vuelve a obtener resultados con los search params validados.
4. Carga directa, recarga, enlace compartido y botones atrás/adelante reconstruyen la misma búsqueda/filtros desde la URL.
5. “Limpiar filtros” elimina `brand` y `category`; “Limpiar búsqueda” elimina `q`. Ninguna acción borra el carrito.

El carrito se mantiene fuera de search params porque no debe exponerse en URL compartible y se conserva como caché local efímera. La URL no contendrá cantidades, datos de contacto ni detalles de cotización.

**RF cubiertos:** RF-03, RF-04, RF-05 y RF-08.

## 5. Algoritmos en pseudocódigo

### 5.1 Búsqueda parcial y filtrado cruzado

El filtrado aplica AND entre los grupos texto, marca y categoría; la selección múltiple de categorías aplica OR. Como la Spec no establece explícitamente cómo combinar varias marcas, este plan conserva la selección múltiple ya presente en la interfaz y usa OR dentro del grupo de marcas; la condición del grupo de marcas se combina mediante AND con texto y categorías.

```text
NORMALIZAR(texto):
    convertir a forma Unicode descompuesta
    quitar marcas diacríticas (acentos)
    convertir a minúsculas con configuración regional española
    devolver texto normalizado

FILTRAR(productosVisibles, q, marcasSeleccionadas, categoriasSeleccionadas):
    consulta = NORMALIZAR(q)
    marcas = conjunto(marcasSeleccionadas)
    categorias = conjunto(categoriasSeleccionadas)

    para cada producto visible:
        camposTexto = [nombre, OEM, marca, fabricante/modelo/motor compatible]
        coincidencias = camposTexto cuyos valores normalizados contienen consulta
        coincideTexto = consulta vacía OR coincidencias no vacío

        coincideMarca =
            marcas vacías OR producto.marcaId pertenece a marcas

        coincideCategoria =
            categorias vacías OR producto.categoryIds intersecta categorias

        incluir producto si:
            coincideTexto AND coincideMarca AND coincideCategoria

        prioridadOEM = 0 si el OEM normalizado contiene consulta;
                       1 si coincide solo otro campo;
                       2 si la consulta está vacía

    ordenar primero por prioridadOEM y luego por orden estable del catálogo
    devolver resultados
```

Para la consulta vacía, no se asigna preferencia OEM. El servidor aplica primero visibilidad y filtros compatibles con la consulta ORM; la normalización/accent-folding se resuelve con un valor de búsqueda normalizado mantenido para cada producto, generado junto con sus campos buscables al guardar o actualizarlo. La consulta debe seguir usando Prisma y parámetros tipados; no se interpolan términos de búsqueda en SQL.

Las coincidencias parciales pueden aparecer en cualquier posición del campo. El término OEM tiene prioridad de orden, no exclusividad: los productos coincidentes en nombre, marca o compatibilidad también se incluyen si cumplen los demás filtros.

**RF cubiertos:** RF-02–RF-05.

### 5.2 Construcción del enlace de WhatsApp

El número destino se obtiene de la constante inmutable existente `SITE_CONFIG.phone` en la configuración del sitio; no se duplica en el catálogo. Se reutiliza el helper de URL de WhatsApp existente si satisface la codificación y el contrato; de lo contrario, se extiende en un único punto compartido.

```text
GENERAR_CONSULTA_DIRECTA(productId):
    validar productId en la frontera servidor
    producto = leer producto vigente por ID
    si no existe o no está visible:
        mostrar “Producto no disponible”; no crear enlace
    datosMensaje = producto actual, cantidad 1
    precioMensaje = precio solo si está habilitado; en otro caso “A cotizar”
    mensaje = componer consulta identificada como solicitud de información
    devolver URL wa.me(SITE_CONFIG.phone, codificar(mensaje))

GENERAR_CONSULTA_CARRITO(itemsCache):
    validar estrictamente IDs y cantidades del carrito
    si itemsCache está vacío:
        bloquear acción y mostrar estado de carrito vacío
    productosActuales = leer en una operación por lote los IDs desde PostgreSQL
    para cada item:
        si existe y está visible:
            usar nombre, OEM, vigencia y precio públicos actuales
        si existe pero ya no está visible:
            usar identidad actual, marcar “Vigencia en catálogo: requiere reconfirmación”
            no presentar stock ni disponibilidad
        si no existe:
            usar lastKnown solo para identificar el producto
            marcar reconfirmación y precio “A cotizar”
        si precio público actual falta, está oculto o no se pudo resolver:
            representar como “A cotizar”; nunca usar precio del localStorage
    mensaje = componer líneas (cantidad × producto, OEM si existe, precio unitario o “A cotizar”)
    incluir nota de consulta/no reserva y advertencias de vigencia cuando apliquen
    devolver URL wa.me(SITE_CONFIG.phone, codificar(mensaje))
```

El enlace solo abre WhatsApp con un borrador para revisión del visitante; no envía automáticamente, crea una orden, cobra ni reserva. No se impone un límite de productos ni se trunca el mensaje en el sitio. Si la lectura de datos vigentes falla, se conserva el carrito y se presenta una opción explícita de reintento; no se genera una consulta con un precio cacheado como si fuese actual.

Para una consulta sin resultados, el contexto incluye el término de búsqueda, las marcas seleccionadas y las categorías/subcategorías seleccionadas que estén activas. El mensaje no debe implicar que se encontró, reservó o confirmó una pieza.

**RF cubiertos:** RF-05, RF-07, RF-09–RF-12.

## 6. Decisiones técnicas justificadas y alternativas descartadas

| Decisión | Justificación | Alternativa descartada |
|:---|:---|:---|
| **Mantener TanStack Router y sus loaders/search params** | Conserva la ruta actual, permite URLs reproducibles y validación de entrada en la frontera de navegación. | Guardar todos los filtros solo en estado React local: no restaura filtros al recargar ni permite compartirlos. |
| **Lecturas del catálogo en servidor con Prisma/PostgreSQL** | Cumple la fuente autoritativa constitucional, controla visibilidad y permite devolver solo datos públicos. Prisma mantiene las consultas parametrizadas. | Importar un arreglo de productos de demostración como fuente de producción o consultar la base de datos desde el navegador. |
| **Filtrado y ranking en el servicio de catálogo** | Centraliza semántica parcial/acento/OEM y evita que tarjeta, listado y búsqueda sin resultados apliquen reglas distintas. | Duplicar filtros en componentes React o confiar únicamente en comparación literal del navegador. |
| **Zod estricto en search params, ruta, servicio y caché** | Search params, IDs y `localStorage` son entradas controladas por el usuario y deben fallar de manera explícita si están malformados. | Aceptar valores con coerciones silenciosas o asumir que `localStorage` es confiable. |
| **Carrito por ID/cantidad con etiqueta auxiliar no autoritativa** | Minimiza datos persistidos localmente, permite restaurar la intención del usuario y conserva una identificación de productos eliminados sin usar precios antiguos. | Guardar el objeto del producto y su precio completos en `localStorage` como si fueran actuales. |
| **Una lectura por lote al preparar WhatsApp** | Evita inconsistencias entre precio/visibilidad guardados localmente y catálogo vigente, con un único punto de decisión sobre “A cotizar”. | Generar la URL directamente desde el snapshot del componente o hacer una consulta individual por producto. |
| **`SITE_CONFIG.phone` como número de destino único** | Respeta la configuración inmutable de Spec 002 y evita destinos divergentes entre catálogo, landing y footer. | Duplicar el número en constantes del catálogo o codificarlo en cada CTA. |
| **Error Boundary de ruta y mensaje funcional genérico** | Permite reintento requerido por RF-02, mientras se mantiene el detalle de servidor fuera del cliente. | Renderizar el mensaje de excepción original, stack trace o JSON interno. |
| **No incluir stock en DTO ni estado de carrito** | Hace imposible exponer accidentalmente cantidades de existencias o inducir una reserva. La “vigencia en catálogo” es un estado distinto. | Representar disponibilidad mediante cantidad, `inStock` u otros indicadores de existencias. |
| **Renderizar solo imágenes publicadas/procesadas** | La ruta pública no acepta cargas; las imágenes deben cumplir la política Sharp/UUID/WebP de la constitución antes de servirse. | Servir archivos originales subidos por usuario o agregar una carga pública al catálogo. |
| **Usar representación decimal exacta para precio** | Evita errores de formato/cálculo en ARS y garantiza que el precio del mensaje corresponda a la lectura autoritativa. | Usar el valor monetario del carrito local o tratar el precio como número binario de cálculo sin conversión. |

## 7. Manejo de errores y seguridad

1. **Fallos de lectura del catálogo:** el servicio registra detalle estructurado y una referencia; la respuesta de servidor solo comunica la referencia opaca. `CatalogErrorBoundary` muestra exactamente “Error temporal al cargar el catálogo” y permite reintentar la carga.
2. **Producto oculto/eliminado/inexistente:** el loader de detalle devuelve el estado funcional “Producto no disponible”, no la ficha ni una excepción con información del registro.
3. **Parámetros de URL inválidos:** los search params y IDs se validan en la frontera con Zod `.strict()`. La interfaz presenta una respuesta segura y el error interno no se filtra.
4. **Caché local manipulado o incompatible:** nunca se confía en los datos leídos; validar el objeto completo antes de hidratar. Rechazar estados malformados con aviso recuperable, sin convertirlos silenciosamente en una consulta ni derivar precio de ellos.
5. **Consultas a datos actuales fallidas:** no crear enlace de carrito con precios potencialmente obsoletos; mantener selección y ofrecer reintentar.
6. **Codificación WhatsApp:** codificar el mensaje completo como parámetro de texto y usar número de destino de configuración. Caracteres especiales, acentos y saltos de línea deben conservarse.
7. **Sin existencias ni reserva:** no transferir información de stock a los DTOs, componentes, estados ni textos de WhatsApp.

**Cobertura:** principios 2, 5 y 6 de la Constitución; RF-02, RF-05, RF-07, RF-09–RF-12; CL-08, CL-09, CL-11 y CL-12.

## 8. Estrategia de tests

Usar Vitest y React Testing Library ya configurados; agregar pruebas de navegador solo si el entorno de validación del proyecto ya las soporta o se aprueba su incorporación. Probar contratos y comportamiento observable, no detalles privados de implementación.

### 8.1 Unitarios

| Suite | Casos de prueba | RF / RNF |
|:---|:---|:---|
| Normalización y búsqueda | Coincidencia parcial en nombre/OEM/marca/compatibilidad; equivalencia de acentos y mayúsculas; OEM antes que coincidencias en otros campos; término vacío. | RF-03 |
| Filtrado cruzado | Sin filtros; marca sola; categorías múltiples con OR; texto+marca+categorías con AND entre grupos; quitar un filtro y preservar los demás; productos no visibles excluidos. | RF-02–RF-04 |
| Precios | Precio publicado solo con valor cargado y bandera habilitada; oculto o ausente produce “Consultar precio” y “A cotizar”; no incluir stock en los DTOs. | RF-07, RF-12 |
| Estado del carrito | Add nuevo inicia en 1; volver a agregar incrementa en una sola línea; cantidades positivas; quitar/vaciar; no hay límite de productos ni de existencias; serialización y lectura del caché versionado. | RF-08, RF-11, RF-12 |
| Validación Zod | Search params estrictos; ID y cantidad inválidos; campos extra; JSON local dañado, versión incompatible o forma incorrecta no se usa para enviar. | Principio 2, RF-03, RF-04, RF-08 |
| WhatsApp | Número exacto desde `SITE_CONFIG.phone`; caracteres Unicode, acentos y saltos de línea codificados; mensaje de ficha lleva cantidad 1; mensaje de carrito incluye cantidad, OEM opcional, precio actual o “A cotizar”; advertencia de vigencia; sin autocheckout/reserva. | RF-05, RF-07, RF-09–RF-12 |

### 8.2 Integración de rutas/servicios

| Suite | Casos de prueba | RF |
|:---|:---|:---|
| Loader `/catalogo` | Devuelve solo productos visibles, filtros y resultados según search params; estado vacío sin productos visibles; búsqueda/filtros llegan al servicio ya validados. | RF-02–RF-05 |
| Loader `/catalogo/$productId` | Producto visible carga detalle; oculto, eliminado o desconocido devuelve “Producto no disponible” sin exponer campos administrativos. | RF-06, RF-11, RF-12 |
| Servicio de resolución del carrito | Lee todos los IDs en un lote; usa valores actuales; no reutiliza precios de caché; oculta precio deshabilitado; producto eliminado queda identificable como pendiente y sin precio; falla de lectura conserva estado y no genera URL. | RF-07, RF-10–RF-12 |
| Errores de servidor | Error interno devuelve referencia opaca, nunca stack ni consulta; logs contienen detalle de diagnóstico; retry vuelve a ejecutar loader. | Principio 6, RF-02 |
| Search params | Carga directa/recarga restaura texto y filtros; enlaces con categorías repetidas; atrás/adelante; limpiar búsqueda y filtros; parámetros desconocidos o inválidos no se aceptan silenciosamente. | RF-03–RF-05 |

### 8.3 Componentes y pruebas end-to-end

- Verificar que el layout común preserve header, navegación, footer y paleta institucional en listado y ficha. **RF-01, RNF-01, RNF-02.**
- Verificar tarjeta mínima, CTA de ficha, imagen alternativa SVG “Imagen no disponible” y visualización de datos opcionales ausentes. **RF-06, RF-07, CL-03.**
- Verificar estados vacío, sin resultados y error con retry; el CTA sin resultados compone texto/filtros correctos. **RF-02, RF-05, CL-01, CL-02, CL-11.**
- Verificar carrito vacío, agregar/incrementar en una sola línea, cambiar cantidad, quitar, vaciar y restaurar tras recarga. **RF-08, CL-05, CL-07.**
- Verificar que ítems ocultos se marquen con vigencia pendiente, no con stock, y se incluyan en consulta; un enlace directo oculto/eliminado/inexistente muestra el estado no disponible. **RF-11, RF-12, CL-06, CL-12, CL-13.**
- Verificar consulta directa con cantidad uno sin selector, consulta de varios ítems, revisión del mensaje en WhatsApp y que el sitio no afirme entrega/compra/reserva. **RF-09, RF-10, RF-12, CL-08.**
- Verificar teclado, etiquetas accesibles, feedback de cambios y uso en viewport de 320 px y desktop; revisar contraste y descripciones alternativas de imagen. **RNF-02, RNF-04.**
- Medir interacción de búsqueda/filtros bajo las condiciones normales del proyecto y comprobar el objetivo inferior a 2 segundos. **RNF-03.**
- Verificar textos en español y mensajes UI sin información técnica interna. **RNF-05, RNF-06, principio 6.**

### 8.4 Verificación de aceptación

La revisión final debe recorrer los criterios de finalización de la Spec 003 y dejar trazabilidad de cada prueba a RF/CL/RNF. Antes de aprobar la implementación, verificar además:

- `npm run test`, `npx tsc --noEmit` y `npm run build` según scripts vigentes.
- No hay `localStorage` con precio/stock autoritativo ni accesos a PostgreSQL desde el cliente.
- El carrito continúa funcionando sin red después de haber sido cargado, pero no prepara un mensaje con precio no verificado.
- El destino WhatsApp proviene de una única constante compartida.

## 9. Supuestos y puntos por confirmar durante el plan de tareas

1. La Spec define OR entre categorías, pero no define explícitamente la combinación de varias marcas. Este plan conserva la selección múltiple de la ruta actual y aplica OR entre marcas seleccionadas; AND se aplica entre el grupo de marcas, texto y categorías.
2. La selección de una categoría padre no implica automáticamente todas sus subcategorías salvo que el catálogo ya modele la asociación de esa forma. El algoritmo aplica coincidencia contra las categorías asociadas al producto; no inventa expansión jerárquica.
3. La Spec delega el límite de longitud a WhatsApp. El sitio no truncará ni limitará el número de ítems; si el enlace no puede abrirse por límite del navegador/WhatsApp, la UI debe conservar el carrito y mostrar un fallo recuperable sin afirmar que el mensaje fue enviado.
4. El número oficial ya está centralizado en `SITE_CONFIG.phone` según la Spec 002; el catálogo lo reutiliza sin cambiarlo ni replicarlo.
