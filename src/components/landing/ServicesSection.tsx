import {
  Wrench,
  Gauge,
  Activity,
  Package,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
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

export function ServicesSection({ className = "" }: ServicesSectionProps) {
  return (
    <section
      id="servicios"
      className={`scroll-mt-20 bg-slate-50/70 py-20 dark:bg-slate-900/50 sm:py-24 ${className}`}
      aria-labelledby="servicios-heading"
    >
      <div className="site-container">
        {/* Encabezado de la sección */}
        <div className="mx-auto max-w-2xl text-center">
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
            Diagnóstico avanzado y reparación integral con instrumental de última
            generación para motores diésel livianos, medianos y pesados.
          </p>
        </div>

        {/* Grilla responsiva de servicios (1 col móvil, 2 tablet, 4 desktop) */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SITE_CONFIG.services.map((service) => {
            const IconComponent = ICON_MAP[service.icon] ?? Wrench;

            return (
              <article
                key={service.id}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200/80 bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-950/5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  {/* Contenedor del ícono técnico */}
                  <div className="mb-5 inline-flex size-12 items-center justify-center rounded-lg border border-blue-100 bg-blue-50/80 text-blue-600 shadow-2xs transition-colors group-hover:border-blue-200 group-hover:bg-blue-600 group-hover:text-white dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                    <IconComponent className="size-6 transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  {/* Título del servicio */}
                  <h3 className="font-display text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
                    {service.title}
                  </h3>

                  {/* Descripción técnica breve */}
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {service.description}
                  </p>
                </div>

                {/* Detalle visual sutil de pie de tarjeta */}
                <div className="mt-6 border-t border-slate-100 pt-4 text-xs font-semibold text-blue-600 dark:border-slate-800 dark:text-blue-400">
                  Calidad garantizada
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
