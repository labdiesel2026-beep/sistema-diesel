import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { SITE_CONFIG } from "@/config/site-config";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/components/landing/scroll-reveal";
import fachadaImg from "@/assets/workshop/fachada-local.webp";

interface LocationSectionProps {
  className?: string;
}

export function LocationSection({ className = "" }: LocationSectionProps) {
  const {
    ref,
    isInstant,
    containerVariants,
    itemVariants,
    singleVariants,
    viewportConfig,
    handleAnimationComplete,
  } = useScrollReveal("ubicacion");

  return (
    <section
      id="ubicacion"
      ref={ref}
      className={`scroll-mt-20 border-b border-white/10 bg-zinc-950 py-16 sm:py-24 md:py-32 text-foreground ${className}`}
      aria-labelledby="ubicacion-heading"
    >
      <div className="site-container">
        {/* Encabezado Editorial */}
        <motion.div
          variants={singleVariants}
          initial={isInstant ? "visible" : "hidden"}
          whileInView="visible"
          viewport={viewportConfig}
          className="mb-10 sm:mb-16 max-w-3xl"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 block mb-3">
            Ubicación & Logística
          </span>
          <h2
            id="ubicacion-heading"
            className="text-2xl sm:text-3xl md:text-5xl font-light tracking-tight text-white uppercase leading-tight"
          >
            Ubicación y Horarios de Atención
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base font-light text-zinc-400 leading-relaxed">
            Estamos ubicados estratégicamente para recibir tu vehículo, maquinaria o coordinar
            envíos de repuestos e inyectores.
          </p>
        </motion.div>

        {/* Contenido dividido ortogonal: 12 columnas (5/7) con animación escalonada */}
        <motion.div
          variants={containerVariants}
          initial={isInstant ? "visible" : "hidden"}
          whileInView="visible"
          viewport={viewportConfig}
          onAnimationComplete={handleAnimationComplete}
          className="grid grid-cols-1 items-stretch gap-8 sm:gap-12 lg:grid-cols-12 border-t border-white/10 pt-8 sm:pt-12 md:pt-16"
        >
          {/* Columna de datos físicos, fotografía y horarios (5 columnas) */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col justify-between border border-white/10 bg-zinc-950 p-5 sm:p-8 lg:col-span-5"
          >
            <div>
              {/* Fotografía real de la fachada */}
              <div className="relative mb-8 aspect-video w-full overflow-hidden border border-white/10 bg-black">
                <img
                  src={fachadaImg}
                  alt="Fachada oficial del taller Laboratorio Diésel en Av. Pres. Perón 1215"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                  width={800}
                  height={450}
                />
                {/* Insignia técnica */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 border border-white/10 bg-zinc-950/80 px-3 py-1 font-mono text-[10px] tracking-widest uppercase text-white/80">
                  <span className="size-1.5 bg-zinc-400" />
                  <span>Local a la Calle · Pres. Perón 1215</span>
                </div>
              </div>

              {/* Datos estructurados en lista ortogonal */}
              <div className="space-y-6 border-t border-white/10 pt-6">
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 mb-2">
                    Dirección del Taller
                  </h3>
                  <p className="text-sm font-light text-zinc-300 leading-relaxed">
                    {SITE_CONFIG.address}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 mb-2">
                    Horarios de Atención
                  </h3>
                  <p className="text-sm font-light text-zinc-300 leading-relaxed">
                    {SITE_CONFIG.businessHours}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-zinc-500">
                    Sábados, domingos y feriados cerrado
                  </p>
                </div>
              </div>
            </div>

            {/* Enlace directo a Google Maps */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <Button
                variant="outline"
                asChild
                className="h-11 w-full justify-center rounded-none border border-white/20 bg-white/[0.04] text-xs font-mono uppercase tracking-widest text-white hover:bg-white hover:text-black hover:border-white transition-all shadow-none"
              >
                <a
                  href={SITE_CONFIG.googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cómo llegar en Google Maps
                  <ExternalLink className="ml-2 size-3.5" />
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Columna Iframe Google Maps (7 columnas, min-h-[420px]) */}
          <motion.div
            variants={itemVariants}
            className="relative min-h-[420px] overflow-hidden border border-white/10 bg-zinc-950 lg:col-span-7"
          >
            <iframe
              title="Mapa de ubicación del taller Laboratorio Diésel"
              src={SITE_CONFIG.googleMapsEmbedUrl}
              className="absolute inset-0 h-full w-full border-0 opacity-90 hover:opacity-100 transition-opacity duration-500"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              tabIndex={-1}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default LocationSection;
