# Constitución del Proyecto — Laboratorio Diésel (MVP)

> 6 principios innegociables. Toda decisión técnica se valida contra esta lista.

1. **SDD-First** — Ningún módulo se codifica sin su sección en el _Software Design Document_. Si no está en el SDD, no existe.
2. **Fail-Fast (Zod)** — Todo input (body, params, query, archivos) se valida con un schema Zod en la frontera del endpoint. Dato inválido → `400` inmediato, sin tocar lógica de negocio.
3. **Upload Paranoico (Sharp)** — Cada imagen subida se re-codifica con Sharp a `.webp` ≤ 500 KB, descartando metadata EXIF y cualquier payload embebido. El nombre original se reemplaza por UUID. Nunca se sirve el archivo crudo del usuario.
4. **Sesión Zero-Trust (JWT + HttpOnly)** — El token JWT viaja exclusivamente en cookie `HttpOnly; Secure; SameSite=Strict`. Nunca se expone al JavaScript del cliente. Refresh silencioso; logout = cookie destruida.
5. **Persistencia como fuente de verdad** — PostgreSQL es el único estado autoritativo. `localStorage` del carrito es caché efímera y descartable; no reemplaza ni contradice la DB.
6. **Errores Opacos** — El cliente recibe solo `{ error: "Referencia: <uuid>" }` con código HTTP genérico. El detalle real (stack, query, contexto) se registra internamente en logs estructurados, jamás se filtra al exterior.
