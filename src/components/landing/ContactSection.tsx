import { MessageSquare, Phone, Mail, MapPin } from "lucide-react";
import { SITE_CONFIG } from "@/config/site-config";
import { ContactForm } from "./ContactForm";

interface ContactSectionProps {
  className?: string;
}

export function ContactSection({ className = "" }: ContactSectionProps) {
  return (
    <section
      id="contacto"
      className={`scroll-mt-20 border-t border-slate-200/80 bg-white py-20 dark:border-slate-800 dark:bg-slate-950 sm:py-24 ${className}`}
      aria-labelledby="contacto-heading"
    >
      <div className="site-container">
        {/* Encabezado */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-industrial/30 bg-industrial/10 px-3.5 py-1 text-xs font-semibold text-industrial">
            <MessageSquare className="size-3.5 text-industrial" />
            Canal Directo
          </div>
          <h2
            id="contacto-heading"
            className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            Comunícate con Nosotros
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Envía tu consulta o solicita turno. Al enviar el formulario se abrirá automáticamente
            una conversación de WhatsApp con tus datos cargados.
          </p>
        </div>

        {/* Grilla: Info lateral de contacto + Formulario interactivo */}
        <div className="mt-14 grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          {/* Tarjeta de información directa (5 columnas) */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8">
              <h3 className="font-display text-xl font-bold text-foreground">Atención Inmediata</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Respondemos consultas técnicas y presupuestos en el día durante nuestro horario
                comercial.
              </p>

              <div className="mt-8 space-y-5">
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-industrial/10 text-industrial">
                    <Phone className="size-4" />
                  </div>
                  <span>WhatsApp oficial: +{SITE_CONFIG.phone}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-industrial/10 text-industrial">
                    <MapPin className="size-4" />
                  </div>
                  <span>{SITE_CONFIG.address}</span>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-white/10 bg-zinc-900/80 p-4 text-xs text-zinc-400">
                💡 <strong>Nota:</strong> No almacenamos tus datos en servidores externos. El
                formulario solo compone el mensaje directo hacia tu app de WhatsApp.
              </div>
            </div>
          </div>

          {/* Formulario (7 columnas) */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
