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

export function ServicesSection({ className = "" }: ServicesSectionProps) {
  return (
    <section
      id="servicios"
      className={`scroll-mt-20 border-b border-border/80 bg-background py-20 sm:py-28 ${className}`}
      aria-labelledby="servicios-heading"
    >
      <div className="site-container">
        {/* Encabezado Técnico de Sección */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-3.5 inline-flex items-center gap-2 rounded border border-border/80 bg-card px-3 py-1 text-micro text-muted-foreground shadow-xs">
            <span className="size-1.5 rounded-full bg-whatsapp" />
            Capacidad Operativa y Calibración
          </div>
          <h2
            id="servicios-heading"
            className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl"
          >
            Soluciones para Sistemas de Inyección Diésel
          </h2>
          <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Diagnóstico avanzado y calibración milimétrica con equipamiento computarizado de precisión
            para motores diésel livianos, medianos, pesados y agrícolas.
          </p>
        </motion.div>

        {/* Bento Grid Industrial de 12 Columnas en Desktop y 1 Columna en Móvil (RF-04) */}
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-12 lg:gap-6">
          {SITE_CONFIG.services.map((service, index) => {
            const IconComponent = ICON_MAP[service.icon] ?? Wrench;
            const bentoClass =
              BENTO_GRID_CLASSES[service.id] ?? "lg:col-span-6 md:col-span-1 min-h-[300px]";

            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-lg border border-border/80 bg-card text-foreground shadow-xs transition-all duration-300 hover:border-border-hover hover:shadow-xl ${bentoClass}`}
              >
                {/* Fotografía Auténtica de Instalaciones con Micro-Zoom */}
                <img
                  src={service.image}
                  alt={service.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Viñeta Gradiente Localizada para Contraste Accessible WCAG (> 7:1) */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/35 transition-opacity duration-300 group-hover:via-black/70"
                  aria-hidden="true"
                />

                {/* Contenido Técnico Estructurado */}
                <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-7">
                  {/* Badges Técnicos Monoespaciados e Ícono */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex size-9 items-center justify-center rounded border border-border/80 bg-black/60 text-white backdrop-blur-md">
                      <IconComponent className="size-4.5 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    {service.badges?.map((badge) => (
                      <span
                        key={badge}
                        className="inline-flex items-center rounded border border-border/80 bg-black/60 px-2.5 py-1 text-micro text-white/90 backdrop-blur-md"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Título y Datos Duros */}
                  <div className="mt-8">
                    <h3 className="font-display text-xl font-bold tracking-tight text-white transition-colors group-hover:text-white sm:text-2xl">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/80 sm:text-sm">
                      {service.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Cláusula Formal de Transparencia sobre Repuestos Originales y Alternativos */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
          className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-3 rounded-lg border border-border/80 bg-card/60 p-4 text-center sm:flex-row sm:p-5"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded border border-border/80 bg-card text-whatsapp">
            <ShieldCheck className="size-4" />
          </div>
          <p className="font-mono text-xs text-muted-foreground sm:text-sm">
            {SITE_CONFIG.servicesTransparencyClause}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default ServicesSection;
