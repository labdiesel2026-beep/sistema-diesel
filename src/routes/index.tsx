import { createFileRoute } from "@tanstack/react-router";
import { ContactSection } from "@/components/landing/ContactSection";
import { FloatingWhatsApp } from "@/components/landing/FloatingWhatsApp";
import { HeroSection } from "@/components/landing/HeroSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LocationSection } from "@/components/landing/LocationSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { WarrantySection } from "@/components/landing/WarrantySection";
import { useHashNavigation } from "@/components/landing/use-hash-navigation";

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

export function LandingPage() {
  useHashNavigation();

  return (
    <>
      <LandingNavbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <WarrantySection />
        <LocationSection />
        <ContactSection />
      </main>
      <LandingFooter />
      <FloatingWhatsApp />
    </>
  );
}
