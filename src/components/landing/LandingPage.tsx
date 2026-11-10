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
import { MobileStickyBar } from "@/components/landing/MobileStickyBar";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { WarrantySection } from "@/components/landing/WarrantySection";
import { useHashNavigation } from "@/components/landing/use-hash-navigation";
import { prefetchCatalogData } from "@/hooks/useCatalogData";

export function LandingPage() {
  useHashNavigation();

  // Asegurar que la Landing Page siempre inicie en el encabezado (top: 0) a menos que haya un hash explícito
  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.hash) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }

    // Precarga pasiva del catálogo en segundo plano para navegación instantánea
    const timer = setTimeout(() => {
      prefetchCatalogData().catch(() => {});
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-zinc-950 text-zinc-100 selection:bg-white selection:text-black">
      <LandingNavbar />
      <main className="w-full overflow-x-hidden">
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
      <FloatingWhatsApp className="max-md:hidden" />
      <MobileStickyBar />
    </div>
  );
}

export default LandingPage;

