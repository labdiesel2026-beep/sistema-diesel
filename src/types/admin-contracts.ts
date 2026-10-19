import type { AdminProduct, AdminUser } from "./admin";

/**
 * Contratos de Red Tipados para Integración con Backend (API REST).
 * (RF-03, RF-09, RF-13, D-10, D-11, D-16, D-17, constitution.md §4, §6, AGENTS.MD §2, §5)
 *
 * Todas las peticiones mutables (POST, PUT, DELETE) deben viajar con:
 * - credentials: 'include' (para transporte seguro de cookies HttpOnly)
 * - Headers: { [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE }
 */

export const CSRF_HEADER_NAME = "X-Requested-With" as const;
export const CSRF_HEADER_VALUE = "XMLHttpRequest" as const;

export interface StandardApiHeaders {
  [CSRF_HEADER_NAME]: typeof CSRF_HEADER_VALUE;
  "Content-Type"?: string;
}

// ==========================================
// Respuestas de Error Estandarizadas
// ==========================================

export interface ApiValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Error 400 Bad Request estandarizado con detalles de validación de campo.
 */
export interface ApiValidationError {
  error: string;
  details?: ApiValidationErrorDetail[];
}

/**
 * Error 401 Unauthorized para credenciales incorrectas o sesión ausente.
 */
export interface ApiUnauthorizedError {
  error: string;
}

/**
 * Error 500 Internal Server Error estrictamente opaco con identificador de auditoría UUID.
 * (constitution.md §6: Errores Opacos)
 */
export interface ApiOpaqueError {
  error: string;
  referencia: string;
}

// ==========================================
// 1. Contrato de Autenticación (RF-03)
// ==========================================

export interface LoginRequestBody {
  email: string;
  password: string;
}

/**
 * POST /api/auth/login
 * Éxito: 200 OK + Set-Cookie: session=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/
 */
export interface LoginResponseBody {
  user: AdminUser;
}

/**
 * POST /api/auth/logout
 * Éxito: 200 OK + Set-Cookie: session=; Max-Age=0; HttpOnly; Secure; SameSite=Strict; Path=/
 */
export interface LogoutResponseBody {
  success: boolean;
}

// ==========================================
// 2. Contrato de Upload de Imágenes (Tubería CDR) (RF-09)
// ==========================================

/**
 * POST /api/uploads/product-image
 * Payload: multipart/form-data con campo 'file' (máx 5 MB)
 * Tubería backend: multer -> whitelist (.jpg/.png/.webp) -> Magic Bytes -> Sharp (.webp <= 500KB) -> UUID opaco.
 * Éxito: 201 Created
 */
export interface UploadImageResponseBody {
  imageUrl: string;
}

// ==========================================
// 3. Contrato CRUD de Productos (RF-13)
// ==========================================

/**
 * Payload plano para crear producto (categoryIds es array de UUIDs, sin anidamiento redundante).
 */
export type CreateProductRequestBody = Omit<AdminProduct, "id">;

/**
 * Payload plano para actualización de producto.
 */
export type UpdateProductRequestBody = Partial<CreateProductRequestBody>;

/**
 * GET /api/products -> Array plano de productos (sin paginación compleja en MVP).
 */
export type GetProductsResponseBody = AdminProduct[];

/**
 * GET /api/products/:id -> Entidad individual de producto.
 */
export type GetProductByIdResponseBody = AdminProduct;

/**
 * DELETE /api/products/:id -> Confirmación de eliminación física.
 */
export interface DeleteProductResponseBody {
  success: boolean;
}
