/**
 * Sección Principal (Hero) — Inmersión Edge-to-Edge Industrial con Contraste Localizado.
 * (Spec 010, RF-03, Módulo C, RF-04, RNF-01, RNF-02)
 *
 * Jerarquía visual y cinemática:
 * 1. Título principal: "LABORATORIO DIÉSEL" con animación fade-in slide-up en 0.8s (Y: 20px a 0).
 * 2. Subtítulo: "Especialistas en inyección diésel" con mecanografía técnica a 50ms/char tras 800ms de retardo,
 *    con cursor parpadeante permanente en barra vertical (|) coloreado en Naranja Técnico (#ea580c).
 * 3. Acciones primarias integrando CatalogCTAButton con micro-interacción shimmer y compresión física activa.
 * 4. Erradicación absoluta de tonos azules residuales.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { CatalogCTAButton } from "@/components/ui/CatalogCTAButton";
import { SITE_CONFIG } from "@/config/site-config";
import tallerHeroImg from "@/assets/workshop/taller-hero.webp";

interface HeroSectionProps {
  className?: string;
}

const FULL_SUBTITLE = "Especialistas en inyección diésel";

export function HeroSection({ className = "" }: HeroSectionProps) {
  const [displayedSubtitle, setDisplayedSubtitle] = useState("");

  // Mecanografía técnica (40-60ms/carácter) tras retardo inicial de 800ms (RF-03)
  useEffect(() => {
    // Si el usuario tiene activa la preferencia de reducción de movimiento, renderizar de inmediato
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplayedSubtitle(FULL_SUBTITLE);
      return;
    }

    const delayTimer = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        currentIndex++;
        setDisplayedSubtitle(FULL_SUBTITLE.slice(0, currentIndex));
        if (currentIndex >= FULL_SUBTITLE.length) {
          clearInterval(interval);
        }
      }, 35);

      return () => clearInterval(interval);
    }, 300);

    return () => clearTimeout(delayTimer);
  }, []);

  return (
    <section
      id="inicio"
      className={`relative min-h-[100dvh] w-full overflow-hidden border-b border-white/10 bg-zinc-950 text-foreground flex flex-col justify-between ${className}`}
    >
      {/* 1. Fotografía real del taller a pantalla completa a todo color sin desaturación */}
      <img
        src={tallerHeroImg}
        alt="Instalaciones y banco de pruebas computarizado de Laboratorio Diésel"
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover brightness-[0.7] max-md:[object-position:center_35%] max-md:opacity-35 md:object-center animate-slow-zoom"
        fetchPriority="high"
      />

      {/* Sutil viñeta degradada neutra para contraste y protección WCAG AA */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-transparent to-zinc-950/90"
        aria-hidden="true"
      />

      {/* Espaciador superior para compensar el navbar fijo superpuesto */}
      <div className="h-24 sm:h-28" aria-hidden="true" />

      {/* 2. Bloque Central: Jerarquía Vertical Estricta (RF-03) */}
      <div className="relative z-10 mx-auto my-auto max-w-5xl px-4 py-8 flex flex-col items-center justify-center text-center w-full">
        <motion.h1
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-4xl sm:text-6xl md:text-8xl lg:text-[7rem] font-bold uppercase tracking-tight text-white leading-none text-center drop-shadow-lg break-words"
        >
          {SITE_CONFIG.name}
        </motion.h1>

        {/* Paso 2: Subtítulo inmediatamente inferior con mecanografía técnica y cursor naranja */}
        <div className="mt-4 sm:mt-6 font-mono text-xs sm:text-sm md:text-base uppercase tracking-wider sm:tracking-[0.25em] text-zinc-300 text-center flex items-center justify-center min-h-[2rem]">
          <span className="sr-only">Especialistas en inyección diésel</span>
          <span aria-hidden="true">{displayedSubtitle}</span>
          <span
            aria-hidden="true"
            className="inline-block ml-1 font-bold select-none animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite]"
            style={{ color: "#ea580c" }}
          >
            |
          </span>
        </div>

        {/* Paso 3: Acciones Primarias de Acceso al Catálogo y Contacto */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-2 sm:px-0"
        >
          <CatalogCTAButton
            size="lg"
            className="w-full sm:w-auto justify-center rounded-none border-white/20"
          >
            Ver Catálogo de Inyectores
          </CatalogCTAButton>

          <Button
            variant="ghost"
            asChild
            className="h-12 w-full sm:w-auto justify-center px-7 rounded-none border border-white/10 bg-zinc-950/60 backdrop-blur-md text-xs font-mono uppercase tracking-widest text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all shadow-none"
          >
            <a href="#contacto" className="flex items-center justify-center gap-2">
              <FaWhatsapp className="size-4 text-channel-support" />
              <span>Contactar al Taller</span>
            </a>
          </Button>
        </motion.div>
      </div>

      {/* 3. Barra inferior ortogonal de especificaciones técnicas institucionales */}
      <div className="relative z-20 border-t border-white/10 bg-zinc-950/80 backdrop-blur-md px-6 py-5 sm:px-12">
        <div className="site-container flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-0">
          {/* Propuestas de Valor Técnicas */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-xs font-mono uppercase tracking-widest text-zinc-400">
            {SITE_CONFIG.valueProps.map((prop) => (
              <div key={prop} className="flex items-center gap-2.5">
                <span className="size-1.5 bg-industrial" />
                <span className="text-zinc-300">{prop}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
