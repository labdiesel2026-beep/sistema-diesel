import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ShieldCheck, Truck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Header,
  Footer,
  Services,
  Warranty,
  WhatsAppButton,
  pageHead,
} from "@/components/diesel-site";
import injector from "@/assets/diesel-injector.jpg";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Laboratorio Diésel — Precisión en inyección Common Rail",
      "Diagnóstico, banco de pruebas, recambios y repuestos Common Rail. Especialistas en inyección diésel con 30 días de garantía.",
    ),
  component: Index,
});

function Index() {
  return (
    <>
      <Header />
      <main>
        <section className="hero-section text-hero-foreground">
          <img
            src={injector}
            alt="Inyector Common Rail de acero de alta precisión"
            width={1920}
            height={1024}
            className="hero-photo"
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <div className="site-container">
            <div className="hero-copy">
              <div className="eyebrow mb-6 flex items-center gap-2 text-hero-muted">
                <span className="size-1.5 rounded-full bg-primary" /> Laboratorio Diésel ·
                Especialistas en inyección
              </div>
              <h1 className="hero-title">
                Precisión que mueve
                <br />
                tu motor.
                <br />
                <span className="text-primary">Confianza que dura.</span>
              </h1>
              <p className="mt-6 max-w-md text-[15px] leading-7 text-hero-muted">
                Diagnóstico, reparación y venta de inyectores Common Rail. Tecnología de precisión
                para que tu motor vuelva a dar lo mejor.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button variant="industrial" asChild className="h-12 px-6 font-bold">
                  <Link to="/catalogo">
                    Ver Catálogo <ArrowRight />
                  </Link>
                </Button>
                <WhatsAppButton />
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[11px] text-hero-muted">
                <span className="flex items-center gap-2">
                  <Check className="size-3.5 text-primary" /> Calidad comprobada
                </span>
                <span className="flex items-center gap-2">
                  <Check className="size-3.5 text-primary" /> Asesoramiento experto
                </span>
              </div>
            </div>
          </div>
        </section>
        <div className="border-b border-hero-border bg-hero text-hero-foreground">
          <div className="site-container grid grid-cols-1 gap-5 py-5 text-xs font-medium sm:grid-cols-3">
            <span className="flex items-center justify-center gap-3 sm:justify-start">
              <Wrench className="size-4 text-primary" /> Especialistas en sistemas Common Rail
            </span>
            <span className="flex items-center justify-center gap-3 sm:border-x sm:border-hero-border">
              <ShieldCheck className="size-4 text-primary" /> 30 días de garantía
            </span>
            <span className="flex items-center justify-center gap-3 sm:justify-end">
              <Truck className="size-4 text-primary" /> Repuestos para tu próximo kilómetro
            </span>
          </div>
        </div>
        <Services />
        <Warranty />
      </main>
      <Footer />
    </>
  );
}
