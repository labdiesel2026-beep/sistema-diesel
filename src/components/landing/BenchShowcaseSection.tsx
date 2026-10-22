import { SITE_CONFIG } from "@/config/site-config";
import bancoPruebasImg from "@/assets/workshop/banco-pruebas.webp";
import inyectoresDetalleImg from "@/assets/workshop/inyectores-detalle.webp";

interface BenchShowcaseSectionProps {
  className?: string;
}

export function BenchShowcaseSection({ className = "" }: BenchShowcaseSectionProps) {
  return (
    <section
      aria-label="Exhibición técnica de bancos de prueba"
      className={`relative overflow-hidden bg-zinc-950 py-24 md:py-32 border-b border-white/10 ${className}`}
    >
      <div className="site-container">
        {/* Cabecera de la exhibición */}
        <div className="mb-20">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600 mb-3">
            Infraestructura y Banco Computarizado
          </p>
          <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-white uppercase">
            Equipamiento de Calibración
          </h2>
        </div>

        <div className="space-y-32">
          {/* Ficha 1: Banco Computarizado Goliath V2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Columna 1: Foto edge-to-edge asimétrica */}
            <div className="lg:col-span-7 relative overflow-hidden border border-white/10 group">
              <img
                src={bancoPruebasImg}
                alt="Banco de pruebas computarizado de alta presión"
                className="w-full h-[400px] md:h-[550px] object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 font-mono text-[10px] tracking-widest uppercase text-white/70 bg-zinc-950/80 px-3 py-1.5 border border-white/10">
                Línea de Ensayos Dinámicos
              </div>
            </div>

            {/* Columna 2: Título enorme y datos duros como fichas */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-10">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 block mb-2">
                  01 / CAPACIDAD TÉCNICA
                </span>
                <h3 className="text-4xl md:text-5xl font-light tracking-tight text-white uppercase leading-tight">
                  Banco de Pruebas Common Rail
                </h3>
                <p className="mt-4 text-sm md:text-base font-light text-zinc-400 leading-relaxed">
                  Generación de curvas de caudal, control de estanqueidad milimétrica y simulación de carga en tiempo real bajo protocolos rigurosos de inyección diésel moderna.
                </p>
              </div>

              {/* Fichas de datos duros estilo Longbow */}
              <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                <div>
                  <div className="text-5xl font-light text-white tracking-tight">2.500</div>
                  <div className="mt-2 text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    Bar Presión Max
                  </div>
                </div>
                <div>
                  <div className="text-5xl font-light text-white tracking-tight">4</div>
                  <div className="mt-2 text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    Canales Simultáneos
                  </div>
                </div>
                <div>
                  <div className="text-5xl font-light text-white tracking-tight">0.01</div>
                  <div className="mt-2 text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    mm Tolerancia
                  </div>
                </div>
                <div>
                  <div className="text-5xl font-light text-white tracking-tight">OEM</div>
                  <div className="mt-2 text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    Calibración
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ficha 2: Fuentes Electrónicas y Ajuste Micrométrico */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Columna 1 (en desktop a la derecha): Título y fichas */}
            <div className="lg:col-span-5 lg:order-1 order-2 flex flex-col justify-center space-y-10">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 block mb-2">
                  02 / PRECISIÓN
                </span>
                <h3 className="text-4xl md:text-5xl font-light tracking-tight text-white uppercase leading-tight">
                  Ajuste Micrométrico
                </h3>
                <p className="mt-4 text-sm md:text-base font-light text-zinc-400 leading-relaxed">
                  Diagnóstico electrónico de actuadores inductivos y piezoeléctricos con calibración de preinyección, inyección principal y retorno.
                </p>
              </div>

              {/* Fichas de datos duros */}
              <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                <div>
                  <div className="text-5xl font-light text-white tracking-tight">100%</div>
                  <div className="mt-2 text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    Trazabilidad
                  </div>
                </div>
                <div>
                  <div className="text-5xl font-light text-white tracking-tight">30 D</div>
                  <div className="mt-2 text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    Garantía Escrita
                  </div>
                </div>
              </div>
            </div>

            {/* Columna 2: Foto asimétrica */}
            <div className="lg:col-span-7 lg:order-2 order-1 relative overflow-hidden border border-white/10 group">
              <img
                src={inyectoresDetalleImg}
                alt="Detalle de inyectores Common Rail en calibración de precisión"
                className="w-full h-[400px] md:h-[550px] object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 font-mono text-[10px] tracking-widest uppercase text-white/70 bg-zinc-950/80 px-3 py-1.5 border border-white/10">
                Inyectores Inductivos y Piezoeléctricos
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BenchShowcaseSection;
