export type CatalogProduct = {
  id: string;
  name: string;
  brand: string;
  condition: 'Nuevo' | 'Recambio';
  category: string;
  oem: string;
  price: number | null;
  detail: string;
};

export const catalogProducts: CatalogProduct[] = [
  { id: 'amarok', name: 'Inyector Amarok 2.0 TDI', brand: 'Bosch', condition: 'Nuevo', category: 'Inyectores Common Rail', oem: '0445110369', price: 320000, detail: 'Volkswagen · 2.0 TDI' },
  { id: 'ranger', name: 'Inyector Ranger 3.2 TDCi', brand: 'Delphi', condition: 'Recambio', category: 'Inyectores Common Rail', oem: '28236381', price: null, detail: 'Ford · 3.2 TDCi' },
  { id: 'hilux', name: 'Inyector Hilux 3.0 D-4D', brand: 'Denso', condition: 'Nuevo', category: 'Inyectores Common Rail', oem: '23670-0L050', price: 320000, detail: 'Toyota · 3.0 D-4D' },
  { id: 'sprinter', name: 'Inyector Sprinter 2.2 CDI', brand: 'Bosch', condition: 'Recambio', category: 'Inyectores piezoeléctricos', oem: '0445115007', price: null, detail: 'Mercedes-Benz · 2.2 CDI' },
];

export const formatPrice = (value: number) => `$${value.toLocaleString('es-AR')} ARS`;
export function filterProducts(search: string, brands: string[], categories: string[]) {
  const query = search.toLocaleLowerCase().replace(/[\s.-]/g, '');
  return catalogProducts.filter(product =>
    (!brands.length || brands.includes(product.brand)) &&
    (!categories.length || categories.includes(product.category)) &&
    `${product.oem} ${product.brand} ${product.name}`.toLocaleLowerCase().replace(/[\s.-]/g, '').includes(query),
  );
}