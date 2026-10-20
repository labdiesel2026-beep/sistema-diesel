import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { authService } from "../src/services/auth.service.js";
import { resetDatabase } from "./helpers/reset-db.js";

describe("Pruebas de Integración y Concurrencia de Productos Destacados (Tarea 8.2)", () => {
  let adminCookie: string;
  let brandId: string;
  let categoryId: string;

  const adminPayload = {
    id: "00000000-0000-4000-a000-000000000001",
    email: "admin@laboratoriodiesel.com",
    role: "admin",
  };

  beforeEach(async () => {
    await resetDatabase();
    adminCookie = `session=${authService.generateToken(adminPayload)}`;

    const brand = await prisma.brand.create({ data: { name: "Bosch" } });
    brandId = brand.id;

    const category = await prisma.category.create({ data: { name: "Inyectores Common Rail" } });
    categoryId = category.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function createTestProduct(name: string, isFeatured = false, visible = true) {
    return prisma.product.create({
      data: {
        name,
        description: `Descripción técnica para ${name}`,
        imageUrl: `/uploads/${name.toLowerCase().replace(/\s+/g, "-")}.webp`,
        brandId,
        condition: "Nuevo",
        price: 350000,
        showPrice: true,
        visible,
        isFeatured,
        featuredAt: isFeatured ? new Date() : null,
        productCategories: {
          create: [{ categoryId }],
        },
      },
    });
  }

  describe("1. Inserción hasta 10 elementos y rechazo con HTTP 409 ante el 11.º (RF-01, RF-03)", () => {
    it("permite destacar hasta 10 productos y rechaza el 11.º con 409 Conflict", async () => {
      // 1. Crear 11 productos no destacados
      const products = [];
      for (let i = 1; i <= 11; i++) {
        products.push(await createTestProduct(`Inyector Prueba ${i}`, false, true));
      }

      // 2. Destacar los primeros 10 productos vía PATCH /api/products/:id/featured
      for (let i = 0; i < 10; i++) {
        const res = await request(app)
          .patch(`/api/products/${products[i].id}/featured`)
          .set("Cookie", [adminCookie])
          .set("X-Requested-With", "XMLHttpRequest")
          .send({ isFeatured: true });

        expect(res.status).toBe(200);
        expect(res.body.isFeatured).toBe(true);
        expect(res.body.featuredAt).not.toBeNull();
      }

      // 3. El 11.º debe ser rechazado con 409 Conflict
      const rejectRes = await request(app)
        .patch(`/api/products/${products[10].id}/featured`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ isFeatured: true });

      expect(rejectRes.status).toBe(409);
      expect(rejectRes.body.error).toBe("Límite alcanzado. Desmarca un producto primero");

      // 4. Verificar que la base de datos conserva exactamente 10 destacados
      const count = await prisma.product.count({ where: { isFeatured: true } });
      expect(count).toBe(10);
    });

    it("rechaza destacar un producto oculto con 400 Bad Request", async () => {
      const hiddenProduct = await createTestProduct("Inyector Oculto", false, false);

      const res = await request(app)
        .patch(`/api/products/${hiddenProduct.id}/featured`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ isFeatured: true });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("No se puede destacar un producto con visibilidad oculta");
    });
  });

  describe("2. Concurrencia real con cupo en 9/10 (RF-03, RNF-01, CL-04)", () => {
    it("solo permite que 1 petición triunfe ante múltiples intentos concurrentes que saturarían el cupo", async () => {
      // Crear 9 destacados
      for (let i = 1; i <= 9; i++) {
        await createTestProduct(`Destacado Inicial ${i}`, true, true);
      }

      // Crear 3 productos candidatos no destacados
      const candidate1 = await createTestProduct("Candidato 1", false, true);
      const candidate2 = await createTestProduct("Candidato 2", false, true);
      const candidate3 = await createTestProduct("Candidato 3", false, true);

      // Disparar las 3 peticiones concurrentemente mediante Promise.all
      const requests = [candidate1, candidate2, candidate3].map((candidate) =>
        request(app)
          .patch(`/api/products/${candidate.id}/featured`)
          .set("Cookie", [adminCookie])
          .set("X-Requested-With", "XMLHttpRequest")
          .send({ isFeatured: true }),
      );

      const responses = await Promise.all(requests);
      const successful = responses.filter((r) => r.status === 200);
      const conflicts = responses.filter((r) => r.status === 409);

      // Exactamente una debe ganar el cupo restante y las otras dos deben recibir 409
      expect(successful.length).toBe(1);
      expect(conflicts.length).toBe(2);

      // Verificar en base de datos que jamás se superó el límite de 10
      const totalFeatured = await prisma.product.count({ where: { isFeatured: true } });
      expect(totalFeatured).toBe(10);
    });
  });

  describe("3. Ordenamiento LIFO estricto en GET /api/products/featured (RF-06, RF-07)", () => {
    it("retorna los productos ordenados de forma descendente por featuredAt (el último destacado primero)", async () => {
      const p1 = await createTestProduct("Producto Alpha", false, true);
      await request(app)
        .patch(`/api/products/${p1.id}/featured`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ isFeatured: true });

      await new Promise((r) => setTimeout(r, 20));

      const p2 = await createTestProduct("Producto Beta", false, true);
      await request(app)
        .patch(`/api/products/${p2.id}/featured`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ isFeatured: true });

      await new Promise((r) => setTimeout(r, 20));

      const p3 = await createTestProduct("Producto Gamma", false, true);
      await request(app)
        .patch(`/api/products/${p3.id}/featured`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ isFeatured: true });

      const res = await request(app).get("/api/products/featured");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);

      // Secuencia LIFO: Gamma (último en ser marcado) -> Beta -> Alpha
      expect(res.body[0].name).toBe("Producto Gamma");
      expect(res.body[1].name).toBe("Producto Beta");
      expect(res.body[2].name).toBe("Producto Alpha");

      // Si desmarcamos y volvemos a marcar Alpha, debe pasar al primer lugar (LIFO)
      await request(app)
        .patch(`/api/products/${p1.id}/featured`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ isFeatured: false });

      await new Promise((r) => setTimeout(r, 20));

      await request(app)
        .patch(`/api/products/${p1.id}/featured`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ isFeatured: true });

      const reorderedRes = await request(app).get("/api/products/featured");
      expect(reorderedRes.body[0].name).toBe("Producto Alpha");
      expect(reorderedRes.body[1].name).toBe("Producto Gamma");
      expect(reorderedRes.body[2].name).toBe("Producto Beta");
    });
  });

  describe("4. Exclusión de la consulta pública ante visibilidad oculta (RF-05, CL-06, CL-07)", () => {
    it("excluye productos ocultos de la vitrina pública pero preserva su estado de destacado en la base de datos", async () => {
      const product = await createTestProduct("Inyector Destaque Temporal", true, true);

      // Inicialmente figura en el endpoint público
      const initialRes = await request(app).get("/api/products/featured");
      expect(initialRes.body.some((p: any) => p.id === product.id)).toBe(true);

      // Pausar visibilidad del producto
      const hideRes = await request(app)
        .patch(`/api/products/${product.id}/visibility`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ visible: false });
      expect(hideRes.status).toBe(200);

      // Verificar que ya no figura en el endpoint público del carrusel
      const afterHideRes = await request(app).get("/api/products/featured");
      expect(afterHideRes.body.some((p: any) => p.id === product.id)).toBe(false);

      // Verificar que en PostgreSQL continúa almacenado con isFeatured = true
      const inDb = await prisma.product.findUnique({ where: { id: product.id } });
      expect(inDb?.isFeatured).toBe(true);
      expect(inDb?.visible).toBe(false);

      // Al restaurar visibilidad a true, debe reaparecer automáticamente
      await request(app)
        .patch(`/api/products/${product.id}/visibility`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ visible: true });

      const restoredRes = await request(app).get("/api/products/featured");
      expect(restoredRes.body.some((p: any) => p.id === product.id)).toBe(true);
    });
  });
});
