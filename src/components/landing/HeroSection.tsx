import { Link } from "@tanstack/react-router";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, CheckCircle2, Wrench } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/config/site-config";
import injectorImage from "@/assets/diesel-injector.jpg";

interface HeroSectionProps {
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export function HeroSection({ className = "" }: HeroSectionProps) {
  return (
    <section
      id="inicio"
      className={`scroll-mt-20 relative flex min-h-[100dvh] flex-col justify-center overflow-hidden bg-slate-900 text-slate-50 ${className}`}
    >
      {/* Imagen de fondo con efecto de zoom superlento */}
      <motion.img
        src={injectorImage}
        alt="Inyector Common Rail de alta precisión en banco de pruebas"
        width={1920}
        height={1080}
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 h-full w-full object-cover object-center opacity-25"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/85 to-slate-900/70" />

      {/* Contenido principal del Hero */}
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
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/60 px-4 py-1.5 text-xs font-semibold tracking-wide text-blue-300 backdrop-blur-sm"
          >
            <Wrench className="size-3.5 text-blue-400" />
            <span>{SITE_CONFIG.name}</span>
            <span className="text-blue-500">·</span>
            <span>{SITE_CONFIG.tagline}</span>
          </motion.div>

          {/* Título principal con propuesta de valor */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Precisión y tecnología en{" "}
            <span className="bg-gradient-to-r from-blue-400 via-blue-200 to-white bg-clip-text text-transparent">
              inyección diésel
            </span>
          </motion.h1>

          {/* Propuestas de valor del cliente (RF-02) */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col gap-3 text-slate-300 sm:text-lg"
          >
            {SITE_CONFIG.valueProps.map((prop) => (
              <div key={prop} className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 size-5 shrink-0 text-blue-400" />
                <span className="font-medium text-slate-200">{prop}</span>
              </div>
            ))}
          </motion.div>

          {/* Llamados a la acción (CTAs) */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            {/* CTA Principal -> Catálogo con Shimmer continuo y latido/respiración intensa */}
            <motion.div
              animate={{
                scale: [1, 1.04, 1, 1.06, 1],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative group"
            >
              {/* Halo sutil y elegante de expansión */}
              <div
                className="absolute -inset-0.5 rounded-xl bg-blue-500/30 blur-sm animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20"
                aria-hidden="true"
              />
              <div
                className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-400 to-blue-500 opacity-30 blur-xs animate-[pulse_1.8s_cubic-bezier(0.4,0,0.6,1)_infinite]"
                aria-hidden="true"
              />
              <Button
                variant="industrial"
                asChild
                className="group relative overflow-hidden h-13 px-8 text-base font-bold shadow-xl shadow-blue-950/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-blue-500/30 ring-1 ring-blue-500/20"
              >
                <Link to="/catalogo" className="relative overflow-hidden">
                  <div
                    className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    aria-hidden="true"
                  />
                  <span className="relative z-10 flex items-center">
                    Ver Catálogo de Inyectores
                    <ArrowRight className="ml-2 size-5 transition-transform duration-200 group-hover:translate-x-1.5 animate-[bounce_1.5s_infinite]" />
                  </span>
                </Link>
              </Button>
            </motion.div>

            {/* CTA Secundario -> Contacto con WhatsApp oficial y animación continua */}
            <Button
              variant="outline"
              asChild
              className="group h-13 border-emerald-500/40 bg-slate-800/80 px-8 text-base font-semibold text-slate-200 hover:border-emerald-400 hover:bg-slate-750 hover:text-white transition-all shadow-md hover:shadow-emerald-950/40"
            >
              <a href="#contacto" className="flex items-center">
                <FaWhatsapp className="mr-2.5 size-5 text-[#25D366] transition-transform animate-[bounce_2s_infinite] group-hover:scale-125" />
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
