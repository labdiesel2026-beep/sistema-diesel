/**
 * Formateadores y Optimizadores Multimedia del Sistema Diésel.
 */

const rawBaseUrl = (
  (import.meta.env?.["VITE_API_URL"] as string | undefined) || "http://localhost:3001"
)
  .trim()
  .replace(/\/+$/, "");

export const API_ORIGIN: string = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl.slice(0, -4)
  : rawBaseUrl;

export interface ImageOptimizationOptions {
  width?: number;
}

/**
 * Resuelve y optimiza URLs de imágenes locales y remotas (Cloudinary).
 * Inyecta parámetros f_auto,q_auto,w_${width} en imágenes de Cloudinary.
 */
export function resolveImageUrl(
  imagePath?: string | null,
  options?: ImageOptimizationOptions,
): string {
  if (!imagePath) return "";
  let url = imagePath;

  if (
    !imagePath.startsWith("data:") &&
    !imagePath.startsWith("http://") &&
    !imagePath.startsWith("https://")
  ) {
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    url = `${API_ORIGIN}${cleanPath}`;
  }

  // Optimización dinámica de Cloudinary
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    const targetWidth = options?.width || 600;
    const widthParam = `w_${targetWidth}`;

    if (!url.includes("/upload/f_auto") && !url.includes(`/upload/${widthParam}`)) {
      url = url.replace(
        /\/upload\/(?:f_auto,q_auto,w_\d+\/)?/,
        `/upload/f_auto,q_auto,${widthParam}/`,
      );
    }
  }

  return url;
}

/**
 * Formatea valores numéricos a Pesos Argentinos (ARS)
 */
export function formatARS(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "$0";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

