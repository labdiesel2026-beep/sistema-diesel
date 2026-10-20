import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { ProductImageUpload } from "@/components/admin/products/ProductImageUpload";

// Simulación fiel y determinista de FileReader para jsdom
class MockFileReader {
  result: string | null = null;
  onload: (() => void) | null = null;

  readAsDataURL(file: File) {
    this.result = `data:${file.type};base64,mock-data-url-${file.name}`;
    setTimeout(() => {
      this.onload?.();
    }, 0);
  }
}

describe("Componente de Carga y Validación Client-Side de Fotos (ProductImageUpload) — Tarea 8.2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("FileReader", MockFileReader);
  });

  // Helper para generar archivos simulados con tamaño y tipo MIME específicos
  const createMockFile = (name: string, size: number, type: string): File => {
    const file = new File(["a".repeat(10)], name, { type });
    Object.defineProperty(file, "size", { value: size });
    return file;
  };

  it("debe aceptar un archivo válido de exactamente 5.00 MB (5242880 bytes) y renderizar preview (CA-08.2, CL-01)", async () => {
    const handleChange = vi.fn();
    render(<ProductImageUpload onChange={handleChange} />);

    const fileInput = screen.getByTestId("image-file-input");
    const valid5MbFile = createMockFile(
      "inyector-bosch-5mb.jpg",
      5 * 1024 * 1024, // 5242880 bytes exactos
      "image/jpeg",
    );

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [valid5MbFile] } });
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // Sin errores de validación
    expect(screen.queryByTestId("image-upload-error")).toBeNull();

    // Callback invocado con la Data URL
    expect(handleChange).toHaveBeenCalledWith(
      `data:image/jpeg;base64,mock-data-url-inyector-bosch-5mb.jpg`,
    );

    // Previsualización renderizada en el DOM
    const previewImg = screen.getByTestId("image-upload-preview");
    expect(previewImg).toBeDefined();
    expect(previewImg.getAttribute("src")).toContain("inyector-bosch-5mb.jpg");
  });

  it("debe rechazar un archivo de 5.01 MB (5253360 bytes) con mensaje de error explicativo (CA-08.2, CL-02)", async () => {
    const handleChange = vi.fn();
    render(<ProductImageUpload onChange={handleChange} />);

    const fileInput = screen.getByTestId("image-file-input");
    const oversizedFile = createMockFile(
      "inyector-pesado.png",
      5253360, // 5.01 MB
      "image/png",
    );

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [oversizedFile] } });
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // Mensaje de error exacto de la especificación
    const errorEl = screen.getByTestId("image-upload-error");
    expect(errorEl).toBeDefined();
    expect(errorEl.textContent).toContain("El archivo excede el tamaño máximo permitido de 5 MB");

    // No debe emitir cambio ni mostrar preview
    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.queryByTestId("image-upload-preview")).toBeNull();
  });

  it("debe rechazar formatos no permitidos como .svg o .gif (RF-08, CA-08.1)", async () => {
    const handleChange = vi.fn();
    render(<ProductImageUpload onChange={handleChange} />);

    const fileInput = screen.getByTestId("image-file-input");
    const gifFile = createMockFile("animacion.gif", 1024 * 100, "image/gif");

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [gifFile] } });
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const errorEl = screen.getByTestId("image-upload-error");
    expect(errorEl).toBeDefined();
    expect(errorEl.textContent).toContain(
      "Solo se permiten imágenes en formato .jpg, .png o .webp",
    );
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("debe renderizar la previsualización Data URL generada para formatos admitidos (CA-08.4)", async () => {
    const handleChange = vi.fn();
    render(<ProductImageUpload onChange={handleChange} />);

    const fileInput = screen.getByTestId("image-file-input");
    const webpFile = createMockFile(
      "tobera.webp",
      1024 * 500, // 500 KB
      "image/webp",
    );

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [webpFile] } });
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(screen.queryByTestId("image-upload-error")).toBeNull();
    const previewImg = screen.getByTestId("image-upload-preview");
    expect(previewImg.getAttribute("src")).toBe("data:image/webp;base64,mock-data-url-tobera.webp");
  });

  it("debe sobrescribir limpiamente la selección previa ante un nuevo archivo (CA-08.4, CL-03)", async () => {
    const handleChange = vi.fn();
    render(<ProductImageUpload onChange={handleChange} />);

    const fileInput = screen.getByTestId("image-file-input");

    // 1. Primera selección
    const file1 = createMockFile("primera-foto.jpg", 1024 * 300, "image/jpeg");
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file1] } });
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    let previewImg = screen.getByTestId("image-upload-preview");
    expect(previewImg.getAttribute("src")).toContain("primera-foto.jpg");
    expect(handleChange).toHaveBeenCalledWith(expect.stringContaining("primera-foto.jpg"));

    // 2. Segunda selección (reemplazo)
    const file2 = createMockFile("segunda-foto.png", 1024 * 400, "image/png");
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file2] } });
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    previewImg = screen.getByTestId("image-upload-preview");
    expect(previewImg.getAttribute("src")).toContain("segunda-foto.png");
    expect(previewImg.getAttribute("src")).not.toContain("primera-foto.jpg");
    expect(handleChange).toHaveBeenLastCalledWith(expect.stringContaining("segunda-foto.png"));
  });

  it("debe permitir quitar la imagen seleccionada y volver al estado inicial", async () => {
    const handleChange = vi.fn();
    render(<ProductImageUpload value="/uploads/existente.webp" onChange={handleChange} />);

    expect(screen.getByTestId("image-upload-preview")).toBeDefined();

    const removeBtn = screen.getByTestId("remove-image-btn");
    await act(async () => {
      removeBtn.click();
    });

    expect(handleChange).toHaveBeenCalledWith("");
    expect(screen.getByTestId("upload-dropzone")).toBeDefined();
    expect(screen.queryByTestId("image-upload-preview")).toBeNull();
  });
});
