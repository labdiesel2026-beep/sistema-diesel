import { motion } from "framer-motion";
import { MapPin, Clock, ExternalLink, Navigation } from "lucide-react";
import { SITE_CONFIG } from "@/config/site-config";
import { Button } from "@/components/ui/button";
import fachadaImg from "@/assets/workshop/fachada-local.webp";

interface LocationSectionProps {
  className?: string;
}

export function LocationSection({ className = "" }: LocationSectionProps) {
  return (
    <section
      id="ubicacion"
      className={`scroll-mt-20 border-t border-border/80 bg-background py-20 text-foreground sm:py-24 ${className}`}
      aria-labelledby="ubicacion-heading"
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
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-3.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            <Navigation className="size-3 text-primary" />
            Visítanos en el Taller
          </div>
          <h2
            id="ubicacion-heading"
            className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            Ubicación y Horarios de Atención
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Estamos ubicados estratégicamente para recibir tu vehículo, maquinaria o coordinar
            envíos de repuestos e inyectores.
          </p>
        </motion.div>

        {/* Contenido dividido: Tarjeta de información técnica + Iframe Mapa (RF-01.3) */}
        <div className="mt-12 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          {/* Columna de datos físicos, fotografía y horarios (5 columnas) */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs transition-all duration-300 lg:col-span-5"
          >
            <div>
              {/* Fotografía real de la fachada con numeración visible (RF-01.3) */}
              <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-xl border border-border/80 bg-black shadow-md">
                <img
                  src={fachadaImg}
                  alt="Fachada oficial del taller Laboratorio Diésel en Av. Pres. Perón 1215"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                  width={800}
                  height={450}
                />
                {/* Insignia técnica flotante */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-border/80 bg-background/90 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground backdrop-blur-md">
                  <span className="size-2 rounded-full bg-primary" />
                  <span>Local a la Calle · Pres. Perón 1215</span>
                </div>
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                  aria-hidden="true"
                />
              </div>

              {/* Datos estructurados de dirección física y horarios */}
              <div className="space-y-4">
                {/* Dirección Física */}
                <div className="group/item flex items-start gap-4 rounded-xl border border-border/40 bg-background/40 p-3.5 transition-all duration-200 hover:border-border">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50 text-primary">
                    <MapPin className="size-5 transition-transform duration-200 group-hover/item:scale-110" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      Dirección del Taller
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {SITE_CONFIG.address}
                    </p>
                  </div>
                </div>

                {/* Horarios de Atención */}
                <div className="group/item flex items-start gap-4 rounded-xl border border-border/40 bg-background/40 p-3.5 transition-all duration-200 hover:border-border">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50 text-primary">
                    <Clock className="size-5 transition-transform duration-200 group-hover/item:scale-110" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      Horarios de Atención
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {SITE_CONFIG.businessHours}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground/80">
                      Sábados, domingos y feriados cerrado
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enlace directo a Google Maps (CL-01) */}
            <div className="mt-8 border-t border-border/60 pt-6">
              <Button
                variant="outline"
                asChild
                className="h-11 w-full justify-center border-border/80 bg-background text-sm font-semibold text-foreground transition-all duration-200 hover:bg-muted hover:border-border"
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
          </motion.div>

          {/* Columna Iframe Google Maps (7 columnas, altura adaptada min-h-[420px]) */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="group relative min-h-[420px] overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-300 lg:col-span-7"
          >
            <iframe
              title="Mapa de ubicación del taller Laboratorio Diésel"
              src={SITE_CONFIG.googleMapsEmbedUrl}
              className="absolute inset-0 h-full w-full border-0 grayscale contrast-125 opacity-85 hover:opacity-100 hover:grayscale-0 transition-all duration-500 ease-out"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              tabIndex={-1}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default LocationSection;
