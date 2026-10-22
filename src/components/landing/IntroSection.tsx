import { motion } from "framer-motion";
import { SITE_CONFIG } from "@/config/site-config";
import { useScrollReveal } from "@/components/landing/scroll-reveal";

interface IntroSectionProps {
  className?: string;
}

export function IntroSection({ className = "" }: IntroSectionProps) {
  const {
    ref,
    isInstant,
    singleVariants,
    viewportConfig,
    handleAnimationComplete,
  } = useScrollReveal("intro");

  return (
    <section
      ref={ref}
      aria-label="Introducción institucional"
      className={`relative bg-zinc-950 py-32 border-b border-white/10 ${className}`}
    >
      <div className="site-container">
        <motion.div
          variants={singleVariants}
          initial={isInstant ? "visible" : "hidden"}
          whileInView="visible"
          viewport={viewportConfig}
          onAnimationComplete={handleAnimationComplete}
          className="max-w-4xl mx-auto text-center"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-600 block mb-6">
            Ingeniería & Calibración
          </span>
          <p className="text-3xl md:text-5xl text-zinc-300 max-w-4xl mx-auto text-center font-light leading-snug">
            Más de dos décadas de precisión absoluta en inyección diésel Common Rail, bancos de prueba computarizados y diagnósticos de vanguardia.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-white/20" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
              {SITE_CONFIG.name} · San Luis
            </span>
            <span className="h-px w-12 bg-white/20" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default IntroSection;
