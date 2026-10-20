import argon2 from "argon2";
import { ENV } from "../src/config/env.js";
import { prisma } from "../src/config/prisma.js";

const SEED_BRANDS = [
  {
    id: "b1a2c3d4-0001-4000-8000-000000000001",
    name: "Bosch",
  },
  {
    id: "b1a2c3d4-0002-4000-8000-000000000002",
    name: "Delphi",
  },
  {
    id: "b1a2c3d4-0003-4000-8000-000000000003",
    name: "Denso",
  },
];

const SEED_CATEGORIES = [
  {
    id: "e4b6d812-7a2b-4f51-b8f3-0a567c891001",
    name: "Inyección Common Rail",
    parentId: null,
  },
  {
    id: "e4b6d812-7a2b-4f51-b8f3-0a567c891002",
    name: "Inyectores Common Rail",
    parentId: "e4b6d812-7a2b-4f51-b8f3-0a567c891001",
  },
  {
    id: "e4b6d812-7a2b-4f51-b8f3-0a567c891003",
    name: "Bombas de Alta Presión",
    parentId: "e4b6d812-7a2b-4f51-b8f3-0a567c891001",
  },
  {
    id: "e4b6d812-7a2b-4f51-b8f3-0a567c891004",
    name: "Inyección Piezoeléctrica",
    parentId: null,
  },
  {
    id: "e4b6d812-7a2b-4f51-b8f3-0a567c891005",
    name: "Inyectores Piezoeléctricos",
    parentId: "e4b6d812-7a2b-4f51-b8f3-0a567c891004",
  },
  {
    id: "e4b6d812-7a2b-4f51-b8f3-0a567c891006",
    name: "Bombas e Inyección Mecánica",
    parentId: null,
  },
];

const SEED_PRODUCTS = [
  {
    id: "a0f1e2d3-1111-4000-8000-111111111111",
    name: "Inyector Amarok 2.0 TDI",
    description:
      "Inyector de alta precisión para motorización 2.0 TDI. Calibrado en banco de pruebas.",
    imageUrl: "/uploads/amarok-20-tdi.webp",
    categoryIds: ["e4b6d812-7a2b-4f51-b8f3-0a567c891001", "e4b6d812-7a2b-4f51-b8f3-0a567c891002"],
    brandId: "b1a2c3d4-0001-4000-8000-000000000001",
    vehicleCompatibility: "Volkswagen Amarok 2.0 TDI (2010-2021)",
    condition: "Nuevo",
    price: 320000,
    showPrice: true,
    visible: true,
    oem: "0445110369",
    isFeatured: true,
    featuredAt: new Date(Date.now() - 3600 * 1000), // Hace 1 hora (LIFO primero)
  },
  {
    id: "a0f1e2d3-2222-4000-8000-222222222222",
    name: "Inyector Ranger 3.2 TDCi",
    description:
      "Unidad de inyección common rail Delphi reparada a nuevo con tobera y válvula original.",
    imageUrl: "/uploads/ranger-32-tdci.webp",
    categoryIds: ["e4b6d812-7a2b-4f51-b8f3-0a567c891002"],
    brandId: "b1a2c3d4-0002-4000-8000-000000000002",
    vehicleCompatibility: "Ford Ranger 3.2 TDCi Puma (2012-2022)",
    condition: "Reacondicionado",
    price: null,
    showPrice: false,
    visible: true,
    oem: "28236381",
    isFeatured: true,
    featuredAt: new Date(Date.now() - 7200 * 1000), // Hace 2 horas
  },
  {
    id: "a0f1e2d3-3333-4000-8000-333333333333",
    name: "Inyector Hilux 3.0 D-4D",
    description: "Inyector Denso original para línea Toyota Hilux 1KD-FTV. Envasado de fábrica.",
    imageUrl: "/uploads/hilux-30-d4d.webp",
    categoryIds: ["e4b6d812-7a2b-4f51-b8f3-0a567c891002"],
    brandId: "b1a2c3d4-0003-4000-8000-000000000003",
    vehicleCompatibility: "Toyota Hilux / SW4 3.0 D-4D (2005-2015)",
    condition: "Nuevo",
    price: 320000,
    showPrice: true,
    visible: false,
    oem: "23670-0L050",
    isFeatured: false,
    featuredAt: null,
  },
  {
    id: "a0f1e2d3-4444-4000-8000-444444444444",
    name: "Inyector Sprinter 2.2 CDI",
    description:
      "Inyector piezoeléctrico Bosch probado en banco EPS 205. Parámetros de preinyección certificados.",
    imageUrl: "/uploads/sprinter-22-cdi.webp",
    categoryIds: ["e4b6d812-7a2b-4f51-b8f3-0a567c891004"],
    brandId: "b1a2c3d4-0001-4000-8000-000000000001",
    vehicleCompatibility: "Mercedes-Benz Sprinter 311 / 415 / 515 CDI (OM651)",
    condition: "Usado",
    price: 0,
    showPrice: true,
    visible: true,
    oem: "0445115007",
    isFeatured: false,
    featuredAt: null,
  },
];

async function main() {
  console.log("🌱 Iniciando aprovisionamiento inicial (Seed)...");

  // 1. Lectura obligatoria de credenciales desde .env (CA-11.1)
  const adminEmail = ENV.ADMIN_INITIAL_EMAIL;
  const rawPassword = ENV.ADMIN_INITIAL_PASSWORD;

  if (!adminEmail || !rawPassword) {
    throw new Error(
      "❌ [Seed Error] Variables obligatorias ADMIN_INITIAL_EMAIL y ADMIN_INITIAL_PASSWORD no definidas en el archivo .env raíz (CA-11.1)",
    );
  }

  // 2. Hasheo exclusivo con Argon2id y Upsert de AdminUser (CA-11.2)
  console.log(`🔐 Hasheando credenciales de admin (${adminEmail}) con Argon2id...`);
  const passwordHash = await argon2.hash(rawPassword, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 1,
  });

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "admin" },
    create: {
      email: adminEmail,
      passwordHash,
      role: "admin",
    },
  });
  console.log(
    `✅ AdminUser listo: ${admin.email} (Hash: ${admin.passwordHash.substring(0, 20)}...)`,
  );

  // 3. Aprovisionamiento idempotente de Marcas (RF-09, CA-11.3)
  console.log("🏷️  Aprovisionando marcas...");
  const brandMap = new Map<string, string>();

  for (const brand of SEED_BRANDS) {
    const existing = await prisma.brand.findUnique({
      where: { name: brand.name },
    });

    if (existing) {
      brandMap.set(brand.name, existing.id);
    } else {
      const created = await prisma.brand.create({
        data: {
          id: brand.id,
          name: brand.name,
        },
      });
      brandMap.set(brand.name, created.id);
    }
  }
  console.log(`✅ ${SEED_BRANDS.length} marcas aprovisionadas.`);

  // 4. Aprovisionamiento idempotente de Categorías (RF-08, D-04, CA-11.3)
  console.log("📂 Aprovisionando categorías (1 nivel de jerarquía)...");
  const rootCategories = SEED_CATEGORIES.filter((c) => c.parentId === null);
  const childCategories = SEED_CATEGORIES.filter((c) => c.parentId !== null);
  const categoryMap = new Map<string, string>();

  for (const cat of rootCategories) {
    const existing = await prisma.category.findUnique({
      where: { name: cat.name },
    });

    if (existing) {
      categoryMap.set(cat.id, existing.id);
      categoryMap.set(cat.name, existing.id);
    } else {
      const created = await prisma.category.create({
        data: {
          id: cat.id,
          name: cat.name,
          parentId: null,
        },
      });
      categoryMap.set(cat.id, created.id);
      categoryMap.set(cat.name, created.id);
    }
  }

  for (const cat of childCategories) {
    const parentRealId = cat.parentId ? categoryMap.get(cat.parentId) || cat.parentId : null;
    const existing = await prisma.category.findUnique({
      where: { name: cat.name },
    });

    if (existing) {
      if (existing.parentId !== parentRealId) {
        await prisma.category.update({
          where: { id: existing.id },
          data: { parentId: parentRealId },
        });
      }
      categoryMap.set(cat.id, existing.id);
      categoryMap.set(cat.name, existing.id);
    } else {
      const created = await prisma.category.create({
        data: {
          id: cat.id,
          name: cat.name,
          parentId: parentRealId,
        },
      });
      categoryMap.set(cat.id, created.id);
      categoryMap.set(cat.name, created.id);
    }
  }
  console.log(`✅ ${SEED_CATEGORIES.length} categorías aprovisionadas.`);

  // 5. Aprovisionamiento idempotente de Productos y ProductCategory (RF-07, D-03, CA-11.3)
  console.log("📦 Aprovisionando catálogo de productos y relaciones...");
  for (const product of SEED_PRODUCTS) {
    const seedBrand = SEED_BRANDS.find((b) => b.id === product.brandId);
    const realBrandId = seedBrand
      ? brandMap.get(seedBrand.name) || product.brandId
      : product.brandId;
    const realCategoryIds = product.categoryIds.map((cid) => categoryMap.get(cid) || cid);

    const existingProduct = await prisma.product.findFirst({
      where: { name: product.name },
    });

    let targetProductId: string;

    if (existingProduct) {
      targetProductId = existingProduct.id;
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          brandId: realBrandId,
          vehicleCompatibility: product.vehicleCompatibility,
          condition: product.condition,
          price: product.price,
          showPrice: product.showPrice,
          visible: product.visible,
          oem: product.oem,
          isFeatured: product.isFeatured ?? false,
          featuredAt: product.featuredAt ?? null,
        },
      });
    } else {
      const created = await prisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          brandId: realBrandId,
          vehicleCompatibility: product.vehicleCompatibility,
          condition: product.condition,
          price: product.price,
          showPrice: product.showPrice,
          visible: product.visible,
          oem: product.oem,
          isFeatured: product.isFeatured ?? false,
          featuredAt: product.featuredAt ?? null,
        },
      });
      targetProductId = created.id;
    }

    // Sincronizar tabla pivote ProductCategory
    for (const categoryId of realCategoryIds) {
      await prisma.productCategory.upsert({
        where: {
          productId_categoryId: {
            productId: targetProductId,
            categoryId,
          },
        },
        update: {},
        create: {
          productId: targetProductId,
          categoryId,
        },
      });
    }
  }
  console.log(`✅ ${SEED_PRODUCTS.length} productos y sus vínculos a categorías aprovisionados.`);

  console.log("🎉 Seed completado exitosamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error en el proceso de seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
