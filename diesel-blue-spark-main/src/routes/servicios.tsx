import { createFileRoute } from '@tanstack/react-router';
import { Header, Footer, Services, Warranty, pageHead } from '@/components/diesel-site';

export const Route = createFileRoute('/servicios')({
  head: () => pageHead('Servicios de inyección — Laboratorio Diésel', 'Diagnóstico especializado, calibración en banco de pruebas, recambios y repuestos para inyección diésel.'),
  component: ServicesPage,
});

function ServicesPage() {
  return <><Header /><main><Services standalone /><Warranty /></main><Footer /></>;
}