import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface PrivacyPolicyModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function PrivacyPolicyModal({ open, onOpenChange }: PrivacyPolicyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-white/10 bg-zinc-950 p-6 shadow-2xl backdrop-blur-md text-white"
        aria-describedby="privacy-modal-description"
        data-testid="privacy-policy-modal"
      >
        <DialogHeader className="space-y-1.5 pb-2 text-left border-b border-white/10">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-industrial">
            <Lock className="size-4" />
            Marco de Privacidad y Datos Personales
          </div>
          <DialogTitle className="font-display text-2xl font-bold tracking-tight text-white">
            Política de Privacidad
          </DialogTitle>
          <DialogDescription id="privacy-modal-description" className="text-xs text-zinc-400">
            Conforme a la Ley 25.326 de Protección de Datos Personales (Argentina).
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 max-h-[60vh] overflow-y-auto pr-2 technical-scrollbar space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#111111] p-5">
            <p className="text-sm leading-relaxed text-zinc-300" data-testid="privacy-modal-text">
              En Laboratorio Diésel (Pres. Juan Domingo Perón 1215, Villa Mercedes, San Luis)
              respetamos su privacidad conforme a la Ley 25.326 de Protección de Datos Personales
              (Argentina). Los datos recopilados mediante WhatsApp o formularios de contacto
              (nombre, teléfono, consultas) se utilizan exclusivamente para brindar presupuestos,
              soporte técnico y coordinación de entregas. No compartimos, vendemos ni cedemos su
              información a terceros. Usted tiene derecho a solicitar el acceso, rectificación o
              eliminación de sus datos en cualquier momento comunicándose a nuestros canales
              oficiales de atención.
            </p>
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

export default PrivacyPolicyModal;

