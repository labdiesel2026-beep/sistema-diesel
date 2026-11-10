import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Laboratorio Diésel — Precisión en inyección Common Rail" },
      {
        name: "description",
        content:
          "Diagnóstico, banco de pruebas, recambios y repuestos Common Rail. Especialistas en inyección diésel con 30 días de garantía.",
      },
      {
        property: "og:title",
        content: "Laboratorio Diésel — Precisión en inyección Common Rail",
      },
      {
        property: "og:description",
        content:
          "Diagnóstico, banco de pruebas, recambios y repuestos Common Rail. Especialistas en inyección diésel con 30 días de garantía.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});
