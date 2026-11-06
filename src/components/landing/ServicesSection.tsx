/**
 * Sección de Servicios Especializados — Bento Grid Industrial Premium.
 * (Spec 009 & Fase 12: Mobile-First Responsive Optimization)
 *
 * Características Responsive:
 * - Matriz Bento Grid: colapso fluido a 1 columna en móvil (< 768px), 2 columnas en tablet y 12 columnas en desktop.
 * - Tipografía fluida y protegida contra desbordes en 320px/375px con break-words.
 * - Badges y numeración romana con reorganización flex-col / flex-row.
 * - Fotografía real del taller con aspect-video en móvil para encuadre completo de maquinaria sin recorte ciego.
 * - Cláusula formal técnica sobre repuestos originales y alternativos homologados.
 */

import { motion } from "framer-motion";
import { Wrench, Gauge, Activity, Package, ShieldCheck, type LucideIcon } from "lucide-react";
import { SITE_CONFIG } from "@/config/site-config";
import { useScrollReveal } from "@/components/landing/scroll-reveal";

interface ServicesSectionProps {
  className?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Wrench,
  Gauge,
  Activity,
  Package,
};

const BENTO_GRID_CLASSES: Record<string, string> = {
  "banco-pruebas": "col-span-1 md:col-span-2 lg:col-span-7",
  "bombas-inyectoras": "col-span-1 md:col-span-1 lg:col-span-5",
  "inyectores-common-rail": "col-span-1 md:col-span-1 lg:col-span-6",
  "diagnostico-repuestos": "col-span-1 md:col-span-2 lg:col-span-6",
};

const ROMAN_NUMERALS = ["I", "II", "III", "IV"];

export function ServicesSection({ className = "" }: ServicesSectionProps) {
  const {
    ref,
    isInstant,
    containerVariants,
    itemVariants,
    singleVariants,
    viewportConfig,
    handleAnimationComplete,
  } = useScrollReveal("servicios");

  return (
    <section
      id="servicios"
      ref={ref}
      className={`scroll-mt-20 border-b border-white/10 bg-zinc-950 py-16 sm:py-24 md:py-32 ${className}`}
      aria-labelledby="servicios-heading"
    >
      <div className="site-container">
        {/* Encabezado Editorial Estilo Longbow */}
        <motion.div
          variants={singleVariants}
          initial={isInstant ? "visible" : "hidden"}
          whileInView="visible"
          viewport={viewportConfig}
          className="mb-12 sm:mb-16 md:mb-20 max-w-4xl"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3 sm:mb-4">
            Pilares Técnicos y Capacidad Operativa
          </p>
          <h2
            id="servicios-heading"
            className="text-3xl sm:text-5xl md:text-7xl font-light tracking-tighter text-white uppercase leading-tight sm:leading-none"
          >
            Soluciones para Sistemas de Inyección Diésel
          </h2>
          <p className="mt-4 sm:mt-8 text-sm sm:text-base md:text-xl font-light leading-relaxed text-zinc-400 max-w-3xl">
            Diagnóstico avanzado y calibración milimétrica con equipamiento computarizado de
            precisión para motores diésel livianos, medianos, pesados y agrícolas.
          </p>
        </motion.div>

        {/* Sección de Pilares: Bento Grid con líneas divisorias */}
        <div className="border-b border-white/10">
          <motion.div
            variants={containerVariants}
            initial={isInstant ? "visible" : "hidden"}
            whileInView="visible"
            viewport={viewportConfig}
            onAnimationComplete={handleAnimationComplete}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-12 sm:gap-y-16 gap-x-8 lg:gap-x-12"
          >
            {SITE_CONFIG.services.map((service, index) => {
              const bentoColSpan = BENTO_GRID_CLASSES[service.id] ?? "col-span-1 lg:col-span-6";
              const roman = ROMAN_NUMERALS[index] ?? `0${index + 1}`;

              return (
                <motion.article
                  key={service.id}
                  variants={itemVariants}
                  className={`border-t border-white/10 pt-8 sm:pt-12 pb-10 sm:pb-16 flex flex-col justify-between group transition-colors ${bentoColSpan}`}
                >
                  <div>
                    {/* Encabezado del Pilar: Número Romano y Badges Técnicos */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                      <span className="font-mono text-2xl md:text-3xl font-light text-zinc-500">
                        {roman}
                      </span>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {service.badges?.map((badge) => (
                          <span
                            key={badge}
                            className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-[0.25em] text-zinc-400 border border-white/10 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-zinc-900/40"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Título Adaptable */}
                    <h3 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-tight text-white mb-4 sm:mb-6 leading-tight break-words">
                      {service.title}
                    </h3>

                    {/* Breve Descripción en Gris */}
                    <p className="text-sm md:text-base font-light text-zinc-400 leading-relaxed mb-6 sm:mb-8 max-w-xl">
                      {service.description}
                    </p>
                  </div>

                  {/* Fotografía del Taller con aspect ratio adaptativo para encuadre completo de maquinaria */}
                  <div className="relative overflow-hidden border border-white/10 aspect-video sm:aspect-[21/9] md:h-64 w-full mt-auto">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-80"
                      aria-hidden="true"
                    />
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>

        {/* Cláusula Formal de Transparencia sobre Repuestos Originales y Alternativos */}
        <motion.div
          variants={singleVariants}
          initial={isInstant ? "visible" : "hidden"}
          whileInView="visible"
          viewport={viewportConfig}
          className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6"
        >
          <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.25em]">
            <ShieldCheck className="size-4 text-zinc-400 shrink-0" />
            <span>Especificaciones de Repuesto</span>
          </div>
          <p className="font-mono text-xs text-zinc-400 max-w-2xl text-left sm:text-right leading-relaxed">
            {SITE_CONFIG.servicesTransparencyClause}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default ServicesSection;
