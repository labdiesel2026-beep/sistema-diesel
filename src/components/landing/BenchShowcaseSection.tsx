import { motion } from "framer-motion";
import { useScrollReveal } from "@/components/landing/scroll-reveal";
import bancoPruebasImg from "@/assets/workshop/banco-pruebas.webp";
import inyectoresDetalleImg from "@/assets/workshop/inyectores-detalle.webp";
import banco2Img from "@/assets/workshop/Banco2.webp";
import bancoEnVivoVideo from "@/assets/workshop/banco-en-vivo.mp4";

interface BenchShowcaseSectionProps {
  className?: string;
}

export function BenchShowcaseSection({ className = "" }: BenchShowcaseSectionProps) {
  const {
    ref,
    isInstant,
    containerVariants,
    itemVariants,
    singleVariants,
    viewportConfig,
    handleAnimationComplete,
  } = useScrollReveal("equipamiento");

  return (
    <section
      ref={ref}
      aria-label="Exhibición técnica de bancos de prueba y equipamiento"
      className={`relative overflow-hidden bg-zinc-950 py-16 sm:py-24 md:py-32 border-b border-white/10 ${className}`}
    >
      <div className="site-container">
        {/* Cabecera de la exhibición */}
        <motion.div
          variants={singleVariants}
          initial={isInstant ? "visible" : "hidden"}
          whileInView="visible"
          viewport={viewportConfig}
          className="mb-12 sm:mb-16 md:mb-20"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3">
            Infraestructura y Bancos Computarizados
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tighter text-white uppercase">
            Equipamiento de Calibración
          </h2>
        </motion.div>

        <div className="space-y-16 sm:space-y-24 md:space-y-32">
          {/* Ficha 1: Banco Computarizado Principal */}
          <motion.div
            variants={singleVariants}
            initial={isInstant ? "visible" : "hidden"}
            whileInView="visible"
            viewport={viewportConfig}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center"
          >
            {/* Columna 1: Foto del Banco Principal con aspect-video en móvil para encuadre panorámico */}
            <div className="lg:col-span-7 relative overflow-hidden border border-white/10 group aspect-video sm:aspect-[4/3] md:h-[550px] w-full">
              <img
                src={bancoPruebasImg}
                alt="Banco de pruebas computarizado de alta presión en Laboratorio Diésel"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 font-mono text-[10px] tracking-widest uppercase text-white/80 bg-zinc-950/85 px-2.5 py-1 sm:px-3 sm:py-1.5 border border-white/10">
                Puesto 1 · Ensayos Dinámicos
              </div>
            </div>

            {/* Columna 2: Datos técnicos */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6 sm:space-y-8">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500 block mb-2">
                  01 / CAPACIDAD TÉCNICA
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-tight text-white uppercase leading-tight">
                  Banco de Pruebas Common Rail
                </h3>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base font-light text-zinc-400 leading-relaxed">
                  Generación de curvas de caudal, control de estanqueidad milimétrica y simulación
                  de carga en tiempo real bajo protocolos rigurosos de inyección diésel moderna.
                </p>
              </div>

              {/* Fichas de datos duros con stagger */}
              <motion.div
                variants={containerVariants}
                initial={isInstant ? "visible" : "hidden"}
                whileInView="visible"
                viewport={viewportConfig}
                className="grid grid-cols-2 gap-4 sm:gap-8 border-t border-white/10 pt-6 sm:pt-8"
              >
                <motion.div variants={itemVariants}>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
                    2.500
                  </div>
                  <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    Bar Presión Max
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
                    4
                  </div>
                  <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    Canales Simultáneos
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
                    0.01
                  </div>
                  <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    mm Tolerancia
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
                    OEM
                  </div>
                  <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    Calibración
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Ficha 2: Segundo Banco Computarizado (Video 2doBanco.mp4 + Poster Banco2.webp) */}
          <motion.div
            variants={singleVariants}
            initial={isInstant ? "visible" : "hidden"}
            whileInView="visible"
            viewport={viewportConfig}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center"
          >
            {/* Columna Texto (en desktop a la izquierda) */}
            <div className="lg:col-span-5 lg:order-1 order-2 flex flex-col justify-center space-y-6 sm:space-y-8">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500 block mb-2">
                  02 / DOBLE LÍNEA DE ENSAYO
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-tight text-white uppercase leading-tight">
                  Segundo Banco Computarizado
                </h3>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base font-light text-zinc-400 leading-relaxed">
                  Incorporación de una segunda línea computarizada de alta presión para duplicar la
                  capacidad operativa del taller. Ensayos en paralelo sin demoras para flotas de
                  transporte, utilitarios y maquinaria pesada.
                </p>
              </div>

              {/* Fichas técnicas del segundo banco */}
              <motion.div
                variants={containerVariants}
                initial={isInstant ? "visible" : "hidden"}
                whileInView="visible"
                viewport={viewportConfig}
                className="grid grid-cols-2 gap-4 sm:gap-8 border-t border-white/10 pt-6 sm:pt-8"
              >
                <motion.div variants={itemVariants}>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
                    2 Puestos
                  </div>
                  <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    Ensayos en Paralelo
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
                    0 Espera
                  </div>
                  <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    Flujo Continuo
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
                    Dinámico
                  </div>
                  <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    Curvas de Retorno
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
                    Heavy Duty
                  </div>
                  <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    Línea Agrícola / Vial
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Columna Multimedia: Reproductor de video banco-en-vivo.mp4 con poster Banco2.webp */}
            <div className="lg:col-span-7 lg:order-2 order-1 relative overflow-hidden border border-white/10 group aspect-video sm:aspect-[4/3] md:h-[550px] w-full bg-black transform-gpu will-change-transform [contain:layout_paint]">
              <video
                ref={(el) => {
                  if (el) {
                    el.muted = true;
                    el.defaultMuted = true;
                    el.playsInline = true;
                    el.play().catch(() => {});
                  }
                }}
                src={bancoEnVivoVideo}
                poster={banco2Img}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="w-full h-full object-cover transform-gpu will-change-transform [contain:layout_paint]"
                aria-label="Video del banco de pruebas computarizado en funcionamiento"
              />

              {/* Badge técnico contextual */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2 border border-white/10 bg-zinc-950/85 px-2.5 py-1 sm:px-3 sm:py-1.5 font-mono text-[10px] tracking-widest uppercase text-white/80">
                <span className="size-1.5 bg-emerald-400 animate-pulse" />
                <span>Puesto 2 · Ensayo en Tiempo Real</span>
              </div>
            </div>
          </motion.div>

          {/* Ficha 3: Ajuste Micrométrico e Inyectores */}
          <motion.div
            variants={singleVariants}
            initial={isInstant ? "visible" : "hidden"}
            whileInView="visible"
            viewport={viewportConfig}
            onAnimationComplete={handleAnimationComplete}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center"
          >
            {/* Columna 1: Foto del detalle de inyectores */}
            <div className="lg:col-span-7 relative overflow-hidden border border-white/10 group aspect-video sm:aspect-[4/3] md:h-[550px] w-full">
              <img
                src={inyectoresDetalleImg}
                alt="Detalle de inyectores Common Rail en calibración de precisión"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 font-mono text-[10px] tracking-widest uppercase text-white/80 bg-zinc-950/85 px-2.5 py-1 sm:px-3 sm:py-1.5 border border-white/10">
                Inyectores Inductivos y Piezoeléctricos
              </div>
            </div>

            {/* Columna 2: Título y métricas */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6 sm:space-y-8">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500 block mb-2">
                  03 / PRECISIÓN
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-tight text-white uppercase leading-tight">
                  Ajuste Micrométrico
                </h3>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base font-light text-zinc-400 leading-relaxed">
                  Diagnóstico electrónico de actuadores inductivos y piezoeléctricos con calibración
                  de preinyección, inyección principal y caudal de retorno.
                </p>
              </div>

              {/* Fichas de datos con stagger */}
              <motion.div
                variants={containerVariants}
                initial={isInstant ? "visible" : "hidden"}
                whileInView="visible"
                viewport={viewportConfig}
                className="grid grid-cols-2 gap-4 sm:gap-8 border-t border-white/10 pt-6 sm:pt-8"
              >
                <motion.div variants={itemVariants}>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
                    100%
                  </div>
                  <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    Trazabilidad
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
                    30 D
                  </div>
                  <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    Garantía Escrita
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default BenchShowcaseSection;
