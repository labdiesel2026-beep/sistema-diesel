import { Scale, AlertCircle, Wrench, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface LegalNoticeModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function LegalNoticeModal({ open, onOpenChange }: LegalNoticeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-white/10 bg-zinc-950 p-6 shadow-2xl backdrop-blur-md text-white"
        aria-describedby="legal-modal-description"
        data-testid="legal-notice-modal"
      >
        <DialogHeader className="space-y-1.5 pb-2 text-left border-b border-white/10">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-industrial">
            <Scale className="size-4" />
            Condiciones Legales y Comerciales
          </div>
          <DialogTitle className="font-display text-2xl font-bold tracking-tight text-white">
            Aviso Legal y Términos
          </DialogTitle>
          <DialogDescription id="legal-modal-description" className="text-xs text-zinc-400">
            Marco operativo de Laboratorio Diésel (Villa Mercedes, San Luis, Argentina).
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 max-h-[60vh] overflow-y-auto pr-2 technical-scrollbar space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            El presente sitio web pertenece a Laboratorio Diésel, ubicado en Pres. Juan Domingo
            Perón 1215, Villa Mercedes, San Luis, Argentina.
          </p>

          <div className="space-y-3">
            {/* Cláusula 1: Precios y Stock */}
            <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-industrial rounded-md">
                  <AlertCircle className="size-4" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold text-zinc-100">
                    1. Precios y Stock
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-300">
                    Dado el dinamismo del mercado de autopartes, los precios y la disponibilidad de
                    stock mostrados en este catálogo son de carácter orientativo y están sujetos a
                    confirmación técnica y comercial definitiva vía WhatsApp al momento de armar el
                    pedido.
                  </p>
                </div>
              </div>
            </article>

            {/* Cláusula 2: Referencias OEM */}
            <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-industrial rounded-md">
                  <Wrench className="size-4" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold text-zinc-100">
                    2. Referencias OEM
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-300">
                    Las imágenes, marcas comerciales y números de pieza originales (OEM) se exhiben
                    con fines estrictamente comparativos y de referencia para la correcta
                    identificación del repuesto, no implicando necesariamente origen de fábrica a
                    menos que se indique explícitamente.
                  </p>
                </div>
              </div>
            </article>

            {/* Cláusula 3: Garantía */}
            <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-industrial rounded-md">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold text-zinc-100">3. Garantía</h4>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-300">
                    Todos nuestros trabajos de calibración y reparación de inyectores cuentan con
                    una garantía escrita de 30 días, sujeta a la correcta instalación y estado del
                    sistema de combustible del vehículo.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>

        <DialogFooter className="mt-2 border-t border-white/10 pt-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 text-xs font-semibold rounded-md border-white/20 bg-white/[0.03] text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LegalNoticeModal;
