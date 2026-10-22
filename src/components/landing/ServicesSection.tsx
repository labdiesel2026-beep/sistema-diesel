import { motion } from "framer-motion";
import { Wrench, Gauge, Activity, Package, CheckCircle, ShieldCheck, type LucideIcon } from "lucide-react";
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
  "banco-pruebas": "lg:col-span-7 md:col-span-2 min-h-[300px] lg:min-h-[420px]",
  "bombas-inyectoras": "lg:col-span-5 md:col-span-1 min-h-[300px] lg:min-h-[420px]",
  "inyectores-common-rail": "lg:col-span-6 md:col-span-1 min-h-[300px] lg:min-h-[340px]",
  "diagnostico-repuestos": "lg:col-span-6 md:col-span-2 min-h-[300px] lg:min-h-[340px]",
};

export function ServicesSection({ className = "" }: ServicesSectionProps) {
  return (
    <section
      id="servicios"
      className={`scroll-mt-20 bg-slate-50/70 py-20 dark:bg-slate-900/50 sm:py-24 ${className}`}
      aria-labelledby="servicios-heading"
    >
      <div className="site-container">
        {/* Encabezado de la sección */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
            <CheckCircle className="size-3.5 text-blue-600 dark:text-blue-400" />
            Servicios Especializados
          </div>
          <h2
            id="servicios-heading"
            className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl"
          >
            Soluciones para Sistemas de Inyección Diésel
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            Diagnóstico avanzado y calibración milimétrica con equipamiento computarizado de precisión
            para motores diésel livianos, medianos, pesados y agrícolas.
          </p>
        </motion.div>

        {/* Bento Grid industrial de 12 columnas (RF-02.1, RF-02.2) */}
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-12">
          {SITE_CONFIG.services.map((service, index) => {
            const IconComponent = ICON_MAP[service.icon] ?? Wrench;
            const bentoClass = BENTO_GRID_CLASSES[service.id] ?? "lg:col-span-6 md:col-span-1 min-h-[300px]";

            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-950 text-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:ring-1 hover:ring-blue-500/40 hover:shadow-xl hover:shadow-blue-950/20 dark:border-slate-800 ${bentoClass}`}
              >
                {/* Fotografía real del taller y equipamiento */}
                <img
                  src={service.image}
                  alt={service.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Overlays de contraste para legibilidad asegurada (> 7:1) */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/60 transition-opacity duration-300 group-hover:via-slate-950/75"
                  aria-hidden="true"
                />

                {/* Contenido interactivo */}
                <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8">
                  {/* Badges técnicos y contenedor de ícono */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex size-10 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-950/80 text-blue-300 backdrop-blur-md">
                      <IconComponent className="size-5 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    {service.badges?.map((badge) => (
                      <span
                        key={badge}
                        className="inline-flex items-center rounded-full border border-blue-500/20 bg-slate-950/70 px-2.5 py-1 text-xs font-medium text-blue-300 backdrop-blur-md"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Título y descripción técnica */}
                  <div className="mt-8">
                    <h3 className="font-display text-xl font-bold tracking-tight text-white transition-colors group-hover:text-blue-300 sm:text-2xl">
                      {service.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-300 sm:text-base">
                      {service.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Cláusula formal de transparencia sobre repuestos originales y alternativos (RF-02.3) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="mt-10 sm:mt-12 flex flex-col items-center justify-center gap-3 rounded-xl border border-blue-200/80 bg-blue-50/60 p-4 text-center sm:flex-row sm:p-5 dark:border-blue-900/40 dark:bg-blue-950/30"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            <ShieldCheck className="size-4" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 sm:text-base">
            {SITE_CONFIG.servicesTransparencyClause}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default ServicesSection;
