import { prisma } from "../../src/config/prisma.js";
import { authService } from "../../src/services/auth.service.js";

export const TEST_ADMIN_EMAIL = "admin@laboratoriodiesel.com";
export const TEST_ADMIN_PASSWORD = "admin123";

/**
 * Trunca todas las tablas relacionales de la base de datos en cascada.
 * (Plan Técnico §6.1)
 */
export async function truncateDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "product_categories", "products", "categories", "brands", "admin_users" CASCADE;
  `);
}

/**
 * Siembra de forma idempotente al usuario administrador semilla para tests.
 */
export async function seedTestAdmin() {
  const passwordHash = await authService.hashPassword(TEST_ADMIN_PASSWORD);
  return prisma.adminUser.upsert({
    where: { email: TEST_ADMIN_EMAIL },
    update: { passwordHash, role: "admin" },
    create: {
      email: TEST_ADMIN_EMAIL,
      passwordHash,
      role: "admin",
    },
  });
}

/**
 * Resetea completamente el estado de la base de datos y reinyecta al administrador de test.
 */
export async function resetDatabase(): Promise<void> {
  await truncateDatabase();
  await seedTestAdmin();
}
