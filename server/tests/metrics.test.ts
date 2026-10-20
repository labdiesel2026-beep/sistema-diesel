import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { authService } from "../src/services/auth.service.js";
import { resetDatabase } from "./helpers/reset-db.js";

describe("Servicio y Endpoint de Métricas del Dashboard (GET /api/admin/metrics) — Tarea 6.5 (RF-10, CA-10.1)", () => {
  let adminCookie: string;
  const adminPayload = {
    id: "00000000-0000-4000-a000-000000000001",
    email: "admin@laboratoriodiesel.com",
    role: "admin",
  };

  beforeEach(async () => {
    await resetDatabase();
    adminCookie = `session=${authService.generateToken(adminPayload)}`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("rechaza peticiones sin autenticación con 401 Unauthorized", async () => {
    const res = await request(app).get("/api/admin/metrics");

    expect(res.status).toBe(401);
    expect(res.body.error).toContain("Sesión no válida o expirada");
  });

  it("retorna contadores en 0 cuando la base de datos está vacía", async () => {
    const res = await request(app).get("/api/admin/metrics").set("Cookie", [adminCookie]);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      totalProducts: 0,
      visibleProducts: 0,
      hiddenProducts: 0,
      featuredProducts: 0,
      totalCategories: 0,
      totalBrands: 0,
    });
  });

  it("calcula y retorna contadores agregados exactos calculados desde PostgreSQL (CA-10.1)", async () => {
    // 1. Crear 3 marcas
    const brand1 = await prisma.brand.create({ data: { name: "Bosch" } });
    const brand2 = await prisma.brand.create({ data: { name: "Delphi" } });
    await prisma.brand.create({ data: { name: "Denso" } });

    // 2. Crear 4 categorías
    const cat1 = await prisma.category.create({ data: { name: "Inyectores" } });
    const cat2 = await prisma.category.create({ data: { name: "Bombas" } });
    const subCat1 = await prisma.category.create({
      data: { name: "Toberas", parentId: cat1.id },
    });
    await prisma.category.create({
      data: { name: "Válvulas SCV", parentId: cat2.id },
    });

    // 3. Crear 4 productos: 3 visibles y 1 oculto
    await prisma.product.create({
      data: {
        name: "Inyector Common Rail 1",
        description: "Inyector visible",
        imageUrl: "/uploads/prod1.webp",
        brandId: brand1.id,
        condition: "Nuevo",
        visible: true,
        productCategories: {
          create: [{ categoryId: cat1.id }, { categoryId: subCat1.id }],
        },
      },
    });

    await prisma.product.create({
      data: {
        name: "Inyector Common Rail 2",
        description: "Inyector visible",
        imageUrl: "/uploads/prod2.webp",
        brandId: brand1.id,
        condition: "Reacondicionado",
        visible: true,
        productCategories: {
          create: [{ categoryId: cat1.id }],
        },
      },
    });

    await prisma.product.create({
      data: {
        name: "Bomba de Alta Presión",
        description: "Bomba visible",
        imageUrl: "/uploads/prod3.webp",
        brandId: brand2.id,
        condition: "Nuevo",
        visible: true,
        productCategories: {
          create: [{ categoryId: cat2.id }],
        },
      },
    });

    await prisma.product.create({
      data: {
        name: "Producto Oculto / Sin Stock",
        description: "Producto oculto de prueba",
        imageUrl: "/uploads/prod4.webp",
        brandId: brand2.id,
        condition: "Usado",
        visible: false, // Oculto
        productCategories: {
          create: [{ categoryId: cat2.id }],
        },
      },
    });

    // 4. Solicitar métricas
    const res = await request(app).get("/api/admin/metrics").set("Cookie", [adminCookie]);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      totalProducts: 4,
      visibleProducts: 3,
      hiddenProducts: 1,
      featuredProducts: 0,
      totalCategories: 4,
      totalBrands: 3,
    });
  });
});
