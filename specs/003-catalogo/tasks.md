# Tasks — Spec 003: Catálogo de Productos y Repuestos

Las tareas están ordenadas por dependencia y acotadas para una ejecución aproximada de 20–30 minutos cada una. Cada tarea debe completarse de forma atómica y verificarse antes de iniciar la siguiente. Si una tarea bloqueante no se puede completar, detener la secuencia.

## Prerrequisito

- La fuente autoritativa debe ser PostgreSQL mediante Prisma. El `package.json` revisado no declara actualmente `prisma` ni `@prisma/client`; por eso T-01 es una puerta de verificación **actualmente bloqueante**. No sustituir persistencia por datos mock en producción. Si no existe una integración PostgreSQL/Prisma disponible, detenerse y resolver ese prerequisito antes de avanzar.
- Para los tests nuevos se usarán Vitest y Testing Library ya configurados. Los nombres de pruebas indicados abajo son los nombres exactos que deberán asignarse al escribirlas.
- Las marcas múltiples se implementarán con OR entre marcas, tal como supone el plan; esa semántica no está especificada en la Spec y deberá confirmarse si difiere de la intención del producto.

## Tareas

- [ ] **T-01 — Verificar la frontera de lectura PostgreSQL/Prisma (BLOQUEANTE)** (20–30 min) — RF: RF-02, RF-07, RF-10, RF-11, RF-12. Confirma si existe un cliente Prisma, configuración de PostgreSQL y acceso seguro desde servidor; identifica el punto de integración de lecturas. No avanzar con persistencia simulada si falta esta base.
  - **Hecho cuando:** `npm ls prisma @prisma/client` confirma los paquetes requeridos y `npx vitest run src/test/catalog/catalog-repository.test.ts -t "consulta solo productos visibles y resuelve productos por lote"` pasa. Si no existe integración PostgreSQL/Prisma, mantener T-01 sin completar y detener la secuencia para resolver el prerequisito.

- [ ] **T-02 — Definir DTO público del catálogo** (20–30 min) — RF: RF-02, RF-06, RF-07, RF-11, RF-12. Crear los tipos de producto público, categoría, compatibilidad y precio; omitir del DTO cualquier dato de stock y campos administrativos.
  - **Hecho cuando:** `npx vitest run src/test/catalog/public-product.test.ts -t "expone solo campos públicos y excluye stock"` pasa y `npx tsc --noEmit` termina sin errores.

- [ ] **T-03 — Validar search params e identificadores** (20–30 min) — RF: RF-03, RF-04. Definir esquemas Zod `.strict()` para `q`, marcas, categorías y el identificador de producto. Rechazar formas y tipos no admitidos sin coerción silenciosa.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-search-schema.test.ts -t "valida estrictamente texto marcas categorías y productId"` pasa, incluyendo claves desconocidas y tipos inválidos.

- [ ] **T-04 — Normalizar términos de búsqueda** (20–30 min) — RF: RF-03. Implementar normalización para búsqueda parcial insensible a mayúsculas y acentos en términos y campos buscables.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-search.test.ts -t "normaliza mayúsculas acentos y coincidencias parciales"` pasa para nombre, OEM, marca y compatibilidad.

- [ ] **T-05 — Implementar búsqueda parcial y prioridad OEM** (20–30 min) — RF: RF-03. Buscar por cualquiera de los campos acordados y ordenar primero los productos que coinciden por código OEM, sin excluir las demás coincidencias válidas.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-search.test.ts -t "prioriza OEM sin excluir coincidencias en otros campos"` pasa.

- [ ] **T-06 — Implementar filtrado cruzado** (20–30 min) — RF: RF-02, RF-04. Aplicar visibilidad primero; combinar AND entre texto, marca y grupo de categorías; combinar categorías seleccionadas con OR. Aplicar OR a marcas múltiples según el supuesto documentado.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-filter.test.ts -t "aplica visibilidad AND entre grupos y OR dentro de categorías"` pasa e incluye el caso de varias marcas.

- [ ] **T-07 — Crear servicio de lectura pública** (20–30 min) — RF: RF-02, RF-03, RF-04, RF-07, RF-12. Consultar los productos desde el repositorio PostgreSQL/Prisma, construir DTO públicos y devolver opciones de marcas/categorías sin exponer productos no visibles ni stock.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-repository.test.ts -t "lista DTOs públicos visibles con opciones de filtro"` pasa con repositorio controlado y no aparece stock en el resultado.

- [ ] **T-08 — Sincronizar filtros con search params** (20–30 min) — RF: RF-03, RF-04. Integrar búsqueda y filtros en la ruta `/catalogo`; mantenerlos al recargar, compartir URL, navegar atrás/adelante y limpiar uno sin borrar los demás.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-route.test.tsx -t "restaura y actualiza q brand y category desde search params"` pasa para carga directa, cambios, historial y limpieza selectiva.

- [ ] **T-09 — Implementar estados de catálogo y consulta sin resultados** (20–30 min) — RF: RF-02, RF-05. Distinguir catálogo sin productos publicados de una búsqueda sin coincidencias. Preparar el contexto de WhatsApp con el término y los filtros activos.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-empty-states.test.tsx -t "distingue catálogo vacío de búsqueda vacía y contextualiza WhatsApp"` pasa.

- [ ] **T-10 — Crear placeholder de imagen accesible** (20–30 min) — RF: RF-06. Mostrar el SVG local genérico “Imagen no disponible” ante ausencia o fallo de imagen, con alternativa accesible.
  - **Hecho cuando:** `npx vitest run src/test/catalog/product-image.test.tsx -t "muestra placeholder local accesible si falta o falla la imagen"` pasa.

- [ ] **T-11 — Construir tarjetas y navegación a ficha** (20–30 min) — RF: RF-01, RF-06, RF-07. Renderizar imagen/placeholder, nombre, OEM opcional, precio o “Consultar precio” y CTA; conservar layout público institucional.
  - **Hecho cuando:** `npx vitest run src/test/catalog/product-card.test.tsx -t "muestra campos mínimos y navega a la ficha"` pasa.

- [ ] **T-12 — Implementar loader y pantalla de ficha técnica** (20–30 min) — RF: RF-06, RF-07. Cargar datos vigentes del producto visible y representar sus atributos opcionales sin inventar valores.
  - **Hecho cuando:** `npx vitest run src/test/catalog/product-detail.test.tsx -t "muestra atributos disponibles y omite opcionales ausentes"` pasa.

- [ ] **T-13 — Manejar productos no disponibles en enlace directo** (20–30 min) — RF: RF-02, RF-11, RF-12. Para producto oculto, eliminado o inexistente, no renderizar ficha ni CTA de selección; presentar “Producto no disponible”.
  - **Hecho cuando:** `npx vitest run src/test/catalog/product-detail.test.tsx -t "muestra Producto no disponible para ocultos eliminados o inexistentes"` pasa.

- [ ] **T-14 — Validar e hidratar el caché efímero del carrito** (20–30 min) — RF: RF-08, RF-11. Definir esquema estricto versionado con IDs, cantidades positivas y `lastKnown`; ignorar precio y stock. Recuperarse de datos corruptos o versiones incompatibles.
  - **Hecho cuando:** `npx vitest run src/test/catalog/cart-cache.test.ts -t "hidrata solo caché versionado válido y rechaza datos corruptos"` pasa.

- [ ] **T-15 — Implementar operaciones del estado del carrito** (20–30 min) — RF: RF-08. Agregar productos, incrementar duplicados en una sola línea, cambiar cantidades, quitar y vaciar sin límites basados en stock ni máximo de ítems.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-cart.test.ts -t "consolida producto repetido incrementa cantidad y permite editar o quitar"` pasa.

- [ ] **T-16 — Resolver vigencia de ítems del carrito** (20–30 min) — RF: RF-08, RF-11, RF-12. Volver a resolver IDs contra el catálogo al hidratar; mantener ítems ocultos/eliminados con advertencia “Vigencia en catálogo”, no con indicador de disponibilidad.
  - **Hecho cuando:** `npx vitest run src/test/catalog/cart-resolution.test.ts -t "mantiene productos no visibles con vigencia pendiente sin exponer stock"` pasa.

- [ ] **T-17 — Presentar el carrito y sus estados** (20–30 min) — RF: RF-08, RF-11, RF-12. Mostrar cantidades, controles accesibles, estado vacío, advertencias de vigencia y confirmación de que la consulta no reserva existencias.
  - **Hecho cuando:** `npx vitest run src/test/catalog/cart-drawer.test.tsx -t "muestra cantidades estado vacío y vigencia sin indicar stock"` pasa.

- [ ] **T-18 — Generar consulta directa por WhatsApp** (20–30 min) — RF: RF-07, RF-09, RF-12. Usar el teléfono de `SITE_CONFIG.phone`; incluir identificación del producto, OEM si existe, precio vigente o “A cotizar”, consulta informativa y cantidad asumida de una unidad.
  - **Hecho cuando:** `npx vitest run src/test/catalog/whatsapp-quote.test.ts -t "genera consulta directa con teléfono central cantidad uno y precio correcto"` pasa, incluidos caracteres especiales codificados.

- [ ] **T-19 — Generar consulta contextual sin resultados** (20–30 min) — RF: RF-05, RF-12. Incluir término de búsqueda cuando exista y las marcas/categorías filtradas que originaron el resultado vacío.
  - **Hecho cuando:** `npx vitest run src/test/catalog/whatsapp-quote.test.ts -t "incluye búsqueda y filtros activos en consulta sin resultados"` pasa.

- [ ] **T-20 — Preparar el mensaje vigente del carrito** (20–30 min) — RF: RF-07, RF-08, RF-10, RF-11, RF-12. Resolver productos por lote al iniciar el envío; incluir cantidad, OEM opcional, precio unitario público vigente o “A cotizar”; no usar precios de `localStorage`. Conservar el carrito y no generar enlace si falla la lectura autoritativa.
  - **Hecho cuando:** `npx vitest run src/test/catalog/whatsapp-quote.test.ts -t "usa datos vigentes y nunca reutiliza precio local al enviar carrito"` pasa, incluidos ítems ocultos/eliminados y error recuperable de lectura.

- [ ] **T-21 — Conectar CTA y apertura externa de WhatsApp** (20–30 min) — RF: RF-05, RF-09, RF-10. Conectar las acciones de tarjeta/ficha, estado sin resultados y carrito al generador validado; no declarar entrega, compra ni reserva.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-whatsapp-actions.test.tsx -t "abre borrador de WhatsApp y no afirma envío compra ni reserva"` pasa.

- [ ] **T-22 — Implementar Error Boundary recuperable del catálogo** (20–30 min) — RF: RF-02. Capturar errores de carga, mostrar “Error temporal al cargar el catálogo” y reintentar sin filtrar detalles internos.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-error-boundary.test.tsx -t "muestra error amigable y reintenta sin exponer excepción"` pasa.

- [ ] **T-23 — Verificar integración de rutas y accesibilidad responsive** (20–30 min) — RF: RF-01, RF-06, RF-08; RNF-01, RNF-02, RNF-04, RNF-06. Verificar continuidad del layout público, navegación entre listado/ficha, uso por teclado, nombres accesibles y textos en español.
  - **Hecho cuando:** `npx vitest run src/test/catalog/catalog-routes.test.tsx -t "integra listado ficha layout navegación y controles accesibles"` pasa; la revisión en viewport de 320 px y escritorio no presenta desbordamiento horizontal.

- [ ] **T-24 — Ejecutar verificación de aceptación y regresión** (20–30 min) — RF: RF-01–RF-12; RNF-01–RNF-07. Revisar criterios de finalización de la Spec, rendimiento de búsqueda/filtros, calidad y regresiones del sistema.
  - **Hecho cuando:** pasan `npm test`, `npx tsc --noEmit`, `npm run lint` y `npm run build`; la medición repetible de búsqueda y filtros cumple menos de 2 segundos bajo las condiciones normales acordadas.
