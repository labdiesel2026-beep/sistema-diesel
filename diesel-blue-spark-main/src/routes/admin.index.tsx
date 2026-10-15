import { createFileRoute } from '@tanstack/react-router';
import { AdminProducts } from '@/components/admin-products';
import { pageHead } from '@/components/diesel-site';

export const Route = createFileRoute('/admin/')({ head: () => pageHead('Administrar productos — Laboratorio Diésel', 'Panel de muestra para gestionar productos, códigos OEM, precios y visibilidad del catálogo de Laboratorio Diésel.'), component: AdminProducts });