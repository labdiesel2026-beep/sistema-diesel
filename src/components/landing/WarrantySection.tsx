import { ShieldCheck, CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/config/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp-utils";

interface WarrantySectionProps {
  className?: string;
}

export function WarrantySection({ className = "" }: WarrantySectionProps) {
  const warrantyUrl = buildWhatsAppUrl(SITE_CONFIG.phone, SITE_CONFIG.whatsappMessages.warranty);

  return (
    <section
      id="garantias"
      className={`scroll-mt-20 border-y border-slate-200/80 bg-white py-20 dark:border-slate-800 dark:bg-slate-950 sm:py-24 ${className}`}
      aria-labelledby="garantias-heading"
    >
      <div className="site-container">
        <div className="mx-auto max-w-4xl rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 via-white to-slate-50 p-8 shadow-sm dark:border-blue-900/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 sm:p-12">
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              {/* Badge superior de garantía */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100/70 px-3.5 py-1 text-xs font-semibold text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                <ShieldCheck className="size-4 text-blue-600 dark:text-blue-400" />
                <span>Respaldo y Posventa</span>
              </div>

              {/* Título de la sección */}
              <h2
                id="garantias-heading"
                className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"
              >
                {SITE_CONFIG.warrantyTerms.title}
              </h2>

              {/* Resumen institucional */}
              <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {SITE_CONFIG.warrantyTerms.summary}
              </p>

              {/* Lista de condiciones y detalles de garantía */}
              <div className="mt-6 flex flex-col gap-3">
                {SITE_CONFIG.warrantyTerms.details.map((detail) => (
                  <div key={detail} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acción de posventa WhatsApp */}
            <div className="flex w-full shrink-0 flex-col items-center gap-3 sm:w-auto">
              <Button
                variant="whatsapp"
                size="lg"
                asChild
                className="h-13 w-full px-6 text-sm font-bold shadow-md sm:w-auto"
              >
                <a href={warrantyUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 size-5" />
                  Solicitar Garantía / Soporte
                </a>
              </Button>
              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                Atención técnica directa de Lun a Vie
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
