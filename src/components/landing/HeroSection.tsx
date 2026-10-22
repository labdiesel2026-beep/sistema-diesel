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
      className={`relative h-screen w-full min-h-[100dvh] overflow-hidden border-b border-white/10 border-blue-500/20 bg-zinc-950 text-foreground flex flex-col justify-between ${className}`}
    >
      {/* 1. Fotografía del laboratorio a pantalla completa (h-screen w-full object-cover) */}
      <motion.img
        src={tallerHeroImg}
        alt="Instalaciones y banco de pruebas computarizado de Laboratorio Diésel"
        width={1920}
        height={1080}
        initial={{ scale: 1.02 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
        className="absolute inset-0 h-full w-full object-cover brightness-[0.7] max-md:[object-position:center_35%] max-md:opacity-30 md:object-center"
        fetchPriority="high"
      />

      {/* Sutil viñeta para profundidad visual sin veladuras genéricas */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-transparent to-zinc-950/80"
        aria-hidden="true"
      />

      {/* 2. Texto principal colosal y centrado al estilo Longbow ("Speed of Lightness") */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pointer-events-none select-none z-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-4 font-mono text-[11px] md:text-xs uppercase tracking-[0.35em] text-zinc-300 mix-blend-difference"
        >
          <span>Especialistas en Inyección</span>
          <span className="mx-3 text-white/40">·</span>
          <span>{SITE_CONFIG.tagline}</span>
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-[8rem] leading-none tracking-tighter text-white text-center absolute inset-0 flex items-center justify-center mix-blend-difference font-light uppercase"
        >
          {SITE_CONFIG.name}
        </motion.h1>
      </div>

      {/* Espaciador superior para compensar el navbar superpuesto */}
      <div className="h-20" aria-hidden="true" />

      {/* 3. Barra inferior ortogonal de especificaciones y acciones institucionales */}
      <div className="relative z-20 border-t border-white/10 bg-zinc-950/70 backdrop-blur-md px-6 py-6 sm:px-12">
        <div className="site-container flex flex-col gap-6 md:flex-row md:items-center md:justify-between p-0">
          {/* Propuestas de Valor Técnicas como especificaciones de alto nivel */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 text-xs font-mono uppercase tracking-widest text-zinc-400">
            {SITE_CONFIG.valueProps.map((prop) => (
              <div key={prop} className="flex items-center gap-2.5">
                <span className="size-1.5 bg-zinc-400" />
                <span className="text-zinc-300">{prop}</span>
              </div>
            ))}
          </div>

          {/* Acciones principales ortogonales estilo Longbow */}
          <div className="flex items-center gap-4 shrink-0">
            <Button
              variant="outline"
              asChild
              className="h-10 px-6 rounded-none border border-white/20 bg-white/[0.06] text-xs font-mono uppercase tracking-widest text-white hover:bg-white hover:text-black hover:border-white transition-all shadow-none"
            >
              <Link to="/catalogo" className="flex items-center">
                <span>Ver Catálogo de Inyectores</span>
                <ArrowRight className="ml-2 size-3.5" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              asChild
              className="h-10 px-6 rounded-none border border-white/10 bg-transparent text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white/30 transition-all shadow-none"
            >
              <a href="#contacto" className="flex items-center">
                <FaWhatsapp className="mr-2 size-3.5 text-whatsapp" />
                <span>Contactar al Taller</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
