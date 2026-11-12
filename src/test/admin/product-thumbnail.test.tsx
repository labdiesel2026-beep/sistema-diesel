import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ProductThumbnail,
  getOptimizedThumbnailUrl,
  CLOUDINARY_THUMBNAIL_TRANSFORM,
} from "@/components/admin/products/ProductThumbnail";

describe("Fase 14 T-03: Optimización de Miniaturas Cloudinary y Decodificación Asíncrona", () => {
  it("getOptimizedThumbnailUrl inyecta c_fill,w_96,h_96,q_auto,f_auto en URLs de Cloudinary con versión", () => {
    const original =
      "https://res.cloudinary.com/demo-diesel/image/upload/v1700000000/products/inyector-bosch.webp";
    const optimized = getOptimizedThumbnailUrl(original);

    expect(optimized).toBe(
      `https://res.cloudinary.com/demo-diesel/image/upload/${CLOUDINARY_THUMBNAIL_TRANSFORM}/v1700000000/products/inyector-bosch.webp`,
    );
  });

  it("getOptimizedThumbnailUrl no duplica la transformación si la URL ya la contiene", () => {
    const alreadyOptimized = `https://res.cloudinary.com/demo-diesel/image/upload/${CLOUDINARY_THUMBNAIL_TRANSFORM}/v1700000000/products/inyector-bosch.webp`;
    expect(getOptimizedThumbnailUrl(alreadyOptimized)).toBe(alreadyOptimized);
  });

  it("getOptimizedThumbnailUrl preserva intactas rutas locales (/uploads/...) y Data URLs (data:image/...)", () => {
    const localUrl = "/uploads/f47ac10b-58cc-4372-a567-0e02b2c3d479.webp";
    const dataUrl = "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=";

    expect(getOptimizedThumbnailUrl(localUrl)).toBe(localUrl);
    expect(getOptimizedThumbnailUrl(dataUrl)).toBe(dataUrl);
  });

  it("renderiza <img> con src transformado de Cloudinary, loading='lazy' y decoding='async'", () => {
    const rawUrl =
      "https://res.cloudinary.com/demo-diesel/image/upload/v12345/products/bomba-common-rail.webp";

    render(<ProductThumbnail src={rawUrl} alt="Bomba Common Rail" />);

    const img = screen.getByTestId("product-thumbnail-img");
    expect(img).toHaveAttribute(
      "src",
      `https://res.cloudinary.com/demo-diesel/image/upload/${CLOUDINARY_THUMBNAIL_TRANSFORM}/v12345/products/bomba-common-rail.webp`,
    );
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
    expect(img).toHaveAttribute("alt", "Bomba Common Rail");
  });

  it("conmuta al placeholder accesible si la imagen dispara onError o si src está vacío", () => {
    const { rerender } = render(<ProductThumbnail src="" />);
    expect(screen.getByTestId("product-thumbnail-fallback")).toBeInTheDocument();

    rerender(
      <ProductThumbnail src="https://res.cloudinary.com/demo/image/upload/v1/products/broken.webp" />,
    );
    const img = screen.getByTestId("product-thumbnail-img");
    fireEvent.error(img);

    expect(screen.getByTestId("product-thumbnail-fallback")).toBeInTheDocument();
  });
});

