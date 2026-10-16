import { describe, expect, it } from "vitest";
import { catalogProducts, filterProducts, formatPrice } from "@/lib/catalog-data";

describe("Mock injector catalog", () => {
  it("shows four products with both quoted and fixed prices", () => {
    expect(catalogProducts).toHaveLength(4);
    expect(catalogProducts.filter((p) => p.price === null)).toHaveLength(2);
    expect(formatPrice(320000)).toBe("$320.000 ARS");
  });
  it("searches brands and normalized OEM codes", () => {
    expect(filterProducts("bosch", [], [])).toHaveLength(2);
    expect(filterProducts("23670 0L050", [], [])[0]?.id).toBe("hilux");
  });
  it("combines checkbox groups and search", () => {
    expect(filterProducts("", ["Bosch"], ["Inyectores piezoeléctricos"])[0]?.id).toBe("sprinter");
    expect(filterProducts("Delphi", ["Bosch"], [])).toHaveLength(0);
  });
});
