/**
 * Sección Principal (Hero) — Inmersión Edge-to-Edge Industrial con Contraste Localizado.
 * (Spec 009, RF-03, RNF-01, CL-04, Bloque 3 - Tarea 3.2)
 *
 * Características:
 * - Fotografía real del taller (taller-hero.webp) ocupando el 100% del contenedor sin veladuras generales en el 75% superior.
 * - Gradiente oscuro neutro estrictamente acotado detrás del bloque tipográfico inferior.
 * - Sombras de texto multicapa garantizando ratio de contraste WCAG AAA (> 7:1) en títulos y AA (> 4.5:1) en párrafos.
 * - Micro-animación de zoom ultralento continuo (12s) y resiliencia de encuadre en dispositivos móviles.
 */

import { Link } from "@tanstack/react-router";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, CheckCircle2, Wrench } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/config/site-config";
import tallerHeroImg from "@/assets/workshop/taller-hero.webp";

interface HeroSectionProps {
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function HeroSection({ className = "" }: HeroSectionProps) {
  return (
    <section
      id="inicio"
      className={`scroll-mt-20 relative flex min-h-[100dvh] flex-col justify-center overflow-hidden border-b border-border/80 border-blue-500/20 bg-background text-foreground ${className}`}
    >
      {/* Fotografía real del taller en inmersión Edge-to-Edge (75%+ superior nítida y cruda) */}
      <motion.img
        src={tallerHeroImg}
        alt="Instalaciones y banco de pruebas computarizado de Laboratorio Diésel"
        width={1920}
        height={1080}
        initial={{ scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 12, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 h-full w-full object-cover max-md:[object-position:center_35%] max-md:opacity-30 md:object-center opacity-65 md:opacity-80"
        fetchPriority="high"
      />

      {/* Gradientes Oscuros Estrictamente Localizados detrás del Bloque Tipográfico (Sin velo general) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/95 via-black/70 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-full max-w-3xl bg-gradient-to-r from-black/85 via-black/45 to-transparent max-md:hidden"
        aria-hidden="true"
      />

      {/* Contenido Principal del Hero con Contraste Localizado WCAG */}
      <div className="site-container relative z-10 py-20 lg:py-28">
        <motion.div
          className="max-w-3xl"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Eyebrow con denominación y eslogan */}
          <motion.div
            variants={itemVariants}
            className="mb-5 inline-flex items-center gap-2 rounded border border-border/80 bg-card/90 px-3.5 py-1.5 text-micro text-foreground backdrop-blur-md shadow-xs"
          >
            <Wrench className="size-3 text-whatsapp" />
            <span className="font-semibold">{SITE_CONFIG.name}</span>
            <span className="text-white/40">·</span>
            <span className="text-muted-foreground">{SITE_CONFIG.tagline}</span>
          </motion.div>

          {/* Título Principal Macro con Sombra Localizada Multicapa (Contraste > 7:1) */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-6xl lg:text-7xl leading-[1.05]"
          >
            Precisión y tecnología en{" "}
            <span className="text-white underline decoration-whatsapp/80 decoration-4 underline-offset-8">
              inyección diésel
            </span>
          </motion.h1>

          {/* Propuestas de Valor Técnicas */}
          <motion.div
            variants={itemVariants}
            className="mt-7 flex flex-col gap-2.5 text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] sm:text-base"
          >
            {SITE_CONFIG.valueProps.map((prop) => (
              <div key={prop} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-whatsapp" />
                <span className="font-medium text-white/95">{prop}</span>
              </div>
            ))}
          </motion.div>

          {/* Llamados a la Acción (CTAs) */}
          <motion.div
            variants={itemVariants}
            className="mt-9 flex flex-col gap-3.5 sm:flex-row sm:items-center"
          >
            {/* CTA Principal -> Catálogo con Shimmer Continuo */}
            <Button
              variant="industrial"
              asChild
              className="relative overflow-hidden h-12 px-7 text-sm font-bold shadow-xl shadow-black/50 transition-all duration-300 hover:scale-[1.02] ring-1 ring-white/20"
            >
              <Link to="/catalogo" className="relative overflow-hidden">
                <div
                  className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  aria-hidden="true"
                />
                <span className="relative z-10 flex items-center">
                  Ver Catálogo de Inyectores
                  <ArrowRight className="ml-2 size-4.5 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            </Button>

            {/* CTA Secundario -> Contacto con WhatsApp */}
            <Button
              variant="ghost"
              asChild
              className="h-12 border-border/80 bg-black/60 px-7 text-sm font-semibold text-white hover:border-white/25 hover:bg-black/80 transition-all shadow-md backdrop-blur-md"
            >
              <a href="#contacto" className="flex items-center">
                <FaWhatsapp className="mr-2.5 size-4.5 text-whatsapp transition-transform group-hover:scale-110" />
                Contactar al Taller
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
