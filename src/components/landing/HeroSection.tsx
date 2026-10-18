import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, MessageSquare, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/config/site-config";
import injectorImage from "@/assets/diesel-injector.jpg";

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className = "" }: HeroSectionProps) {
  return (
    <section
      id="inicio"
      className={`scroll-mt-20 relative flex min-h-[100dvh] flex-col justify-center overflow-hidden bg-slate-900 text-slate-50 ${className}`}
    >
      {/* Imagen de fondo con overlay técnico industrial */}
      <img
        src={injectorImage}
        alt="Inyector Common Rail de alta precisión en banco de pruebas"
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover object-center opacity-25"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/85 to-slate-900/70" />

      {/* Contenido principal del Hero */}
      <div className="site-container relative z-10 py-20 lg:py-28">
        <div className="max-w-3xl">
          {/* Eyebrow con denominación y eslogan */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/60 px-4 py-1.5 text-xs font-semibold tracking-wide text-blue-300 backdrop-blur-sm">
            <Wrench className="size-3.5 text-blue-400" />
            <span>{SITE_CONFIG.name}</span>
            <span className="text-blue-500">·</span>
            <span>{SITE_CONFIG.tagline}</span>
          </div>

          {/* Título principal con propuesta de valor */}
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Precisión y tecnología en{" "}
            <span className="bg-gradient-to-r from-blue-400 via-blue-200 to-white bg-clip-text text-transparent">
              inyección diésel
            </span>
          </h1>

          {/* Propuestas de valor del cliente (RF-02) */}
          <div className="mt-8 flex flex-col gap-3 text-slate-300 sm:text-lg">
            {SITE_CONFIG.valueProps.map((prop) => (
              <div key={prop} className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 size-5 shrink-0 text-blue-400" />
                <span className="font-medium text-slate-200">{prop}</span>
              </div>
            ))}
          </div>

          {/* Llamados a la acción (CTAs) */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* CTA Principal -> Catálogo */}
            <Button
              variant="industrial"
              asChild
              className="h-13 px-8 text-base font-bold shadow-lg shadow-blue-950/50"
            >
              <Link to="/catalogo">
                Ver Catálogo de Inyectores
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>

            {/* CTA Secundario -> Contacto (scroll suave a #contacto) */}
            <Button
              variant="outline"
              asChild
              className="h-13 border-slate-700 bg-slate-800/80 px-8 text-base font-semibold text-slate-200 hover:bg-slate-750 hover:text-white"
            >
              <a href="#contacto">
                <MessageSquare className="mr-2 size-5 text-blue-400" />
                Contactar al Taller
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
