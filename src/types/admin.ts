/**
 * Tipos de Dominio para el Panel de Administración (Backoffice).
 * (RF-05, RF-10, RF-12, D-06, D-07, D-14)
 *
 * Todos los identificadores son generados y mantenidos como UUIDv4 estándar.
 */

export type ProductCondition = "Nuevo" | "Reacondicionado" | "Usado";

/**
 * Categoría o Subcategoría jerárquica (máximo 1 nivel de anidamiento).
 * - parentId === null: Categoría Padre (raíz)
 * - parentId === string (UUID): Subcategoría Hija vinculada a una categoría raíz
 */
export interface AdminCategory {
  id: string;
  name: string;
  parentId: string | null;
}

/**
 * Marca o fabricante de repuestos (alcance mínimo: solo nombre).
 */
export interface AdminBrand {
  id: string;
  name: string;
}

/**
 * Producto con persistencia relacional por IDs y compatibilidad multimedia.
 */
export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  categoryIds: string[];
  brandId: string;
  vehicleCompatibility: string;
  condition: ProductCondition;
  price: number | null;
  showPrice: boolean;
  visible: boolean;
  oem: string;
}

/**
 * Usuario y estado de sesión de administración Zero-Trust en memoria.
 */
export interface AdminUser {
  id: string;
  email: string;
  role: "admin";
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
}

/**
 * Resultado estructurado para operaciones de mutación con validación de integridad referencial.
 */
export interface IntegrityCheckResult {
  allowed: boolean;
  blocked?: boolean | undefined;
  reason?: string | undefined;
  affectedProducts?: string[] | undefined;
}
