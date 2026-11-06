import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { updateProduct, deleteProduct } from "../src/controllers/product.controller.js";
import { productService } from "../src/services/product.service.js";
import * as fileStorage from "../src/services/file-storage.service.js";

describe("Controlador de Productos y Manejo Resiliente de Imágenes Cloudinary (Fase 11)", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let statusMock: any;
  let jsonMock: any;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    mockRes = {
      status: statusMock,
      json: jsonMock,
    };
    mockNext = vi.fn();
  });

  describe("updateProduct con Cloudinary URLs", () => {
    it("invoca deleteFile con la URL de Cloudinary anterior si la imagen fue reemplazada", async () => {
      const oldCloudinaryUrl =
        "https://res.cloudinary.com/test-cloud/image/upload/v1234/products/old-injector.webp";
      const newCloudinaryUrl =
        "https://res.cloudinary.com/test-cloud/image/upload/v5678/products/new-injector.webp";

      const updatedDto = {
        id: "prod-1",
        name: "Inyector Bosch",
        description: "Desc",
        imageUrl: newCloudinaryUrl,
        brandId: "brand-1",
        categoryIds: ["cat-1"],
        condition: "Nuevo",
        price: 50000,
        showPrice: true,
        visible: true,
        oem: null,
        isFeatured: false,
        featuredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(productService, "updateProduct").mockResolvedValue({
        product: updatedDto as any,
        previousImageUrl: oldCloudinaryUrl,
      });

      const deleteFileSpy = vi
        .spyOn(fileStorage, "deleteFile")
        .mockResolvedValue(undefined);

      mockReq = {
        params: { id: "prod-1" },
        body: {
          name: "Inyector Bosch",
          imageUrl: newCloudinaryUrl,
        },
      };

      await updateProduct(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(updatedDto);
      expect(deleteFileSpy).toHaveBeenCalledWith(oldCloudinaryUrl);
    });

    it("no interrumpe la respuesta 200 si la purga en Cloudinary rechaza la promesa", async () => {
      const oldCloudinaryUrl =
        "https://res.cloudinary.com/test-cloud/image/upload/v1234/products/fail-item.webp";
      const newCloudinaryUrl =
        "https://res.cloudinary.com/test-cloud/image/upload/v5678/products/success.webp";

      vi.spyOn(productService, "updateProduct").mockResolvedValue({
        product: { id: "prod-2", imageUrl: newCloudinaryUrl } as any,
        previousImageUrl: oldCloudinaryUrl,
      });

      // Simular fallo de red en deleteFile
      vi.spyOn(fileStorage, "deleteFile").mockRejectedValue(
        new Error("Cloudinary API unreachable"),
      );
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      mockReq = {
        params: { id: "prod-2" },
        body: { imageUrl: newCloudinaryUrl },
      };

      await updateProduct(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(mockNext).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe("deleteProduct con Cloudinary URLs", () => {
    it("elimina el producto y purga la imagen de Cloudinary de forma asíncrona", async () => {
      const cloudinaryUrl =
        "https://res.cloudinary.com/test-cloud/image/upload/v1234/products/to-delete.webp";

      vi.spyOn(productService, "deleteProduct").mockResolvedValue({
        id: "prod-to-delete",
        imageUrl: cloudinaryUrl,
      } as any);

      const deleteFileSpy = vi
        .spyOn(fileStorage, "deleteFile")
        .mockResolvedValue(undefined);

      mockReq = {
        params: { id: "prod-to-delete" },
      };

      await deleteProduct(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "Producto eliminado correctamente",
      });
      expect(deleteFileSpy).toHaveBeenCalledWith(cloudinaryUrl);
    });

    it("no interrumpe la respuesta de éxito si deleteFile de Cloudinary falla", async () => {
      const cloudinaryUrl =
        "https://res.cloudinary.com/test-cloud/image/upload/v1234/products/err-del.webp";

      vi.spyOn(productService, "deleteProduct").mockResolvedValue({
        id: "prod-err",
        imageUrl: cloudinaryUrl,
      } as any);

      vi.spyOn(fileStorage, "deleteFile").mockRejectedValue(
        new Error("Timeout en Cloudinary"),
      );
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      mockReq = {
        params: { id: "prod-err" },
      };

      await deleteProduct(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "Producto eliminado correctamente",
      });
      warnSpy.mockRestore();
    });
  });
});

