/**
 * Sección de Servicios Especializados — Bento Grid Industrial Premium.
 * (Spec 009, RF-04, RNF-01, RNF-02, Bloque 3 - Tarea 3.1)
 *
 * Características:
 * - Matriz Bento Grid industrial de 12 columnas en desktop (gap-6) y apilamiento vertical continuo en móvil (gap-4).
 * - Superficie mineral inerte con hairlines de 1px (border-border/80) y realce sutil ante interacción.
 * - Priorización de datos duros (presiones en bar, tolerancias y protocolos IMA) sobre prosa comercial.
 * - Fotografía real del taller integrada con viñeta periférica de contraste localizada.
 * - Cláusula formal técnica sobre repuestos originales y alternativos homologados.
 */

import { motion } from "framer-motion";
import { Wrench, Gauge, Activity, Package, ShieldCheck, type LucideIcon } from "lucide-react";
import { SITE_CONFIG } from "@/config/site-config";

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
  "banco-pruebas": "lg:col-span-7 md:col-span-2 min-h-[320px] lg:min-h-[440px]",
  "bombas-inyectoras": "lg:col-span-5 md:col-span-1 min-h-[320px] lg:min-h-[440px]",
  "inyectores-common-rail": "lg:col-span-6 md:col-span-1 min-h-[300px] lg:min-h-[360px]",
  "diagnostico-repuestos": "lg:col-span-6 md:col-span-2 min-h-[300px] lg:min-h-[360px]",
};

const ROMAN_NUMERALS = ["I", "II", "III", "IV"];

export function ServicesSection({ className = "" }: ServicesSectionProps) {
  return (
    <section
      id="servicios"
      className={`scroll-mt-20 border-b border-white/10 bg-zinc-950 py-24 md:py-32 ${className}`}
      aria-labelledby="servicios-heading"
    >
      <div className="site-container">
        {/* Encabezado Editorial Estilo Longbow */}
        <div className="mb-20 max-w-4xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600 mb-4">
            Pilares Técnicos y Capacidad Operativa
          </p>
          <h2
            id="servicios-heading"
            className="text-4xl md:text-7xl font-light tracking-tighter text-white uppercase leading-none"
          >
            Soluciones para Sistemas de Inyección Diésel
          </h2>
          <p className="mt-8 text-base md:text-xl font-light leading-relaxed text-zinc-400 max-w-3xl">
            Diagnóstico avanzado y calibración milimétrica con equipamiento computarizado de precisión
            para motores diésel livianos, medianos, pesados y agrícolas.
          </p>
        </div>

        {/* Sección de Pilares: Lista de servicios con líneas horizontales finas (border-t border-white/10) */}
        <div className="border-b border-white/10">
          {/* Grilla contenedora compatible con arquitectura de 12 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-16 gap-x-12">
            {SITE_CONFIG.services.map((service, index) => {
              const bentoColSpan = BENTO_GRID_CLASSES[service.id] ?? "lg:col-span-6";
              const roman = ROMAN_NUMERALS[index] ?? `0${index + 1}`;

              return (
                <article
                  key={service.id}
                  className={`border-t border-white/10 pt-12 pb-16 flex flex-col justify-between group transition-colors ${bentoColSpan}`}
                >
                  <div>
                    {/* Encabezado del Pilar: Número Romano en Gris y Badges Técnicos */}
                    <div className="flex items-center justify-between gap-4 mb-8">
                      <span className="font-mono text-2xl md:text-3xl font-light text-zinc-500">
                        {roman}
                      </span>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {service.badges?.map((badge) => (
                          <span
                            key={badge}
                            className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 border border-white/10 px-2.5 py-1"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Título Enorme en Blanco */}
                    <h3 className="text-3xl md:text-5xl font-light tracking-tight text-white mb-6 leading-tight">
                      {service.title}
                    </h3>

                    {/* Breve Descripción en Gris */}
                    <p className="text-sm md:text-base font-light text-zinc-400 leading-relaxed mb-8 max-w-xl">
                      {service.description}
                    </p>
                  </div>

                  {/* Fotografía de Instalaciones sin Filtro, Ortogonal de Borde a Borde */}
                  <div className="relative overflow-hidden border border-white/10 h-52 md:h-64 w-full mt-auto">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 ease-out"
                      loading="lazy"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-80"
                      aria-hidden="true"
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Cláusula Formal de Transparencia sobre Repuestos Originales y Alternativos */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.25em]">
            <ShieldCheck className="size-4 text-zinc-400 shrink-0" />
            <span>Especificaciones de Repuesto</span>
          </div>
          <p className="font-mono text-xs text-zinc-400 max-w-2xl text-left sm:text-right">
            {SITE_CONFIG.servicesTransparencyClause}
          </p>
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
