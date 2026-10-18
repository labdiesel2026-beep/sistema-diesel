import { MapPin, Clock, ExternalLink, Navigation } from "lucide-react";
import { SITE_CONFIG } from "@/config/site-config";
import { Button } from "@/components/ui/button";

interface LocationSectionProps {
  className?: string;
}

export function LocationSection({ className = "" }: LocationSectionProps) {
  return (
    <section
      id="ubicacion"
      className={`scroll-mt-20 bg-slate-50/70 py-20 dark:bg-slate-900/50 sm:py-24 ${className}`}
      aria-labelledby="ubicacion-heading"
    >
      <div className="site-container">
        {/* Encabezado de la sección */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
            <Navigation className="size-3.5 text-blue-600 dark:text-blue-400" />
            Visítanos en el Taller
          </div>
          <h2
            id="ubicacion-heading"
            className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl"
          >
            Ubicación y Horarios de Atención
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            Estamos ubicados estratégicamente para recibir tu vehículo, maquinaria
            o coordinar envíos de repuestos e inyectores.
          </p>
        </div>

        {/* Contenido dividido: Tarjeta de información técnica + Iframe Mapa */}
        <div className="mt-12 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          {/* Columna de datos físicos y horarios (5 columnas) */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-card p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
            <div className="space-y-8">
              {/* Dirección Física */}
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-400">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                    Dirección del Taller
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {SITE_CONFIG.address}
                  </p>
                </div>
              </div>

              {/* Horarios de Atención */}
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-400">
                  <Clock className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                    Horarios de Atención
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {SITE_CONFIG.businessHours}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Sábados, domingos y feriados cerrado
                  </p>
                </div>
              </div>
            </div>

            {/* Fallback accesible con enlace directo a Google Maps (CL-01) */}
            <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
              <Button
                variant="outline"
                asChild
                className="w-full justify-center h-11 border-slate-200 text-sm font-semibold hover:border-blue-500 hover:text-blue-600 dark:border-slate-800"
              >
                <a
                  href={SITE_CONFIG.googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cómo llegar en Google Maps
                  <ExternalLink className="ml-2 size-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Columna Iframe Google Maps (7 columnas) */}
          <div className="relative min-h-[380px] overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
            <iframe
              title="Mapa de ubicación del taller Laboratorio Diésel"
              src={SITE_CONFIG.googleMapsEmbedUrl}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
