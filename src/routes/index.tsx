import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { BenchShowcaseSection } from "@/components/landing/BenchShowcaseSection";
import { BrandsMarquee } from "@/components/landing/BrandsMarquee";
import { FeaturedProductsCarousel } from "@/components/landing/FeaturedProductsCarousel";
import { FloatingWhatsApp } from "@/components/landing/FloatingWhatsApp";
import { HeroSection } from "@/components/landing/HeroSection";
import { IntroSection } from "@/components/landing/IntroSection";
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

  // Asegurar que la Landing Page siempre inicie en el encabezado (top: 0) a menos que haya un hash explícito
  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.hash) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-white selection:text-black">
      <LandingNavbar />
      <main>
        <HeroSection />
        <IntroSection />
        <FeaturedProductsCarousel />
        <BrandsMarquee />
        <ServicesSection />
        <BenchShowcaseSection />
        <WarrantySection />
        <LocationSection />
      </main>
      <LandingFooter />
      <FloatingWhatsApp />
    </div>
  );
}
