import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Check,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/config/site-config";
import { usePoliciesConsent } from "./use-policies-consent";

export interface PoliciesModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

const AXIS_ICON_MAP: Record<string, LucideIcon> = {
  "cotizaciones-precios": FileText,
  "garantia-laboratorio": ShieldCheck,
  "repuestos-originales-alternativos": CheckCircle2,
  "recepcion-envios-comisionistas": Truck,
};

export function PoliciesModal({ open, onOpenChange }: PoliciesModalProps) {
  const { hasAccepted, acceptPolicies } = usePoliciesConsent();

  const handleAcceptAndClose = () => {
    acceptPolicies();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border-slate-200/90 bg-white/95 p-6 shadow-2xl backdrop-blur-md ring-1 ring-blue-500/20 dark:border-blue-900/50 dark:bg-slate-900/95 dark:ring-blue-400/20"
        aria-describedby="policies-modal-description"
      >
        <DialogHeader className="space-y-1.5 pb-2 text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <ShieldCheck className="size-4" />
            Marco Regulatorio y Comercial
          </div>
          <DialogTitle className="font-display text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Políticas Comerciales y de Garantía
          </DialogTitle>
          <DialogDescription
            id="policies-modal-description"
            className="text-xs text-slate-500 dark:text-slate-400"
          >
            Términos técnicos, condiciones de garantía y protocolos operativos de Laboratorio Diésel.
          </DialogDescription>
        </DialogHeader>

        {/* Contenedor con scroll interno accesible (RF-04.4, max-h-[60vh]) */}
        <div className="my-2 max-h-[60vh] overflow-y-auto pr-2 space-y-3.5 scrollbar-thin">
          {SITE_CONFIG.commercialPolicies.axes.map((policy) => {
            const Icon = AXIS_ICON_MAP[policy.id] ?? ShieldCheck;

            return (
              <article
                key={policy.id}
                className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-100/60 text-blue-700 dark:border-blue-800 dark:bg-blue-950/70 dark:text-blue-300">
                    <Icon className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
                      <span className="text-blue-600 dark:text-blue-400 mr-1.5">
                        Eje {policy.number}:
                      </span>
                      {policy.shortTitle}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {policy.content}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Pie del diálogo interactivo con sincronización reactiva */}
        <DialogFooter className="mt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          {hasAccepted ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="flex size-4.5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/80">
                <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
              </span>
              <span>Políticas comerciales aceptadas previamente</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Al continuar, confirma haber leído los 4 ejes normativos.
            </span>
          )}

          <div className="flex items-center gap-2 justify-end">
            {hasAccepted ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-9 px-4 text-xs font-semibold"
              >
                Cerrar políticas
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleAcceptAndClose}
                className="h-9 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                Aceptar y Continuar
                <ArrowRight className="ml-1.5 size-3.5" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PoliciesModal;
