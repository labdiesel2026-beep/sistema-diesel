import type { AdminCategory, AdminBrand, AdminProduct } from "@/types/admin";

/**
 * Fixtures de prueba para tests unitarios aislados en Vitest.
 * (RF-15, CA-15.1, D-14)
 */

export const INITIAL_CATEGORIES: AdminCategory[] = [
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
    id: "e4b6d812-7a2b-4f51-b8f3-0a567c891006",
    name: "Bombas e Inyección Mecánica",
    parentId: null,
  },
];

export const INITIAL_BRANDS: AdminBrand[] = [
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

export const INITIAL_PRODUCTS: AdminProduct[] = [
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
  },
];

export interface AdminSeedData {
  categories: AdminCategory[];
  brands: AdminBrand[];
  products: AdminProduct[];
}

export function getInitialAdminData(): AdminSeedData {
  return {
    categories: INITIAL_CATEGORIES.map((c) => ({ ...c })),
    brands: INITIAL_BRANDS.map((b) => ({ ...b })),
    products: INITIAL_PRODUCTS.map((p) => ({
      ...p,
      categoryIds: [...p.categoryIds],
    })),
  };
}
