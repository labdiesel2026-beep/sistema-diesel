import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSiteSettings } from "@/context/site-settings-context";
import { api, ApiError } from "@/lib/api";
import {
  Sliders,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export interface AdminSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminSettingsModal({ open, onOpenChange }: AdminSettingsModalProps) {
  const { whatsappNumber, updateWhatsApp } = useSiteSettings();

  // Tab activo: 'whatsapp' | 'password'
  const [activeTab, setActiveTab] = useState<"whatsapp" | "password">("whatsapp");

  // Estado WhatsApp
  const [phoneInput, setPhoneInput] = useState<string>(whatsappNumber);
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [phoneSuccess, setPhoneSuccess] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Estado Contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sincronizar input al abrir o cambiar whatsappNumber
  useEffect(() => {
    if (open) {
      setPhoneInput(whatsappNumber);
      setPhoneSuccess(null);
      setPhoneError(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(null);
      setPasswordError(null);
    }
  }, [open, whatsappNumber]);

  // Guardar WhatsApp
  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneSuccess(null);
    setPhoneError(null);

    const clean = phoneInput.replace(/\D/g, "");
    if (clean.length < 8 || clean.length > 20) {
      setPhoneError("El número de WhatsApp debe tener entre 8 y 20 dígitos numéricos.");
      return;
    }

    try {
      setIsSavingPhone(true);
      await updateWhatsApp(clean);
      setPhoneSuccess("¡Número de WhatsApp actualizado correctamente en toda la tienda!");
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || "Error al actualizar el número de WhatsApp.";
      setPhoneError(msg);
    } finally {
      setIsSavingPhone(false);
    }
  };

  // Cambiar Contraseña
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError("Debes ingresar tu contraseña actual.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("La nueva contraseña debe tener un mínimo de 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    try {
      setIsChangingPassword(true);
      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setPasswordSuccess("¡Contraseña actualizada exitosamente! Úsala en tu próximo inicio de sesión.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || "No se pudo actualizar la contraseña.";
      setPasswordError(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const cleanPhonePreview = phoneInput.replace(/\D/g, "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92vh] overflow-y-auto sm:max-w-lg bg-white border border-[#e5e7eb] text-[#111827] shadow-2xl sm:rounded-xl p-0"
        data-testid="admin-settings-modal"
      >
        <div className="p-6 border-b border-[#e5e7eb] bg-[#f9fafb]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-industrial mb-1">
              <Sliders className="size-5 text-industrial" />
              <span className="text-xs font-bold uppercase tracking-wider text-industrial">
                Configuración del Sistema
              </span>
            </div>
            <DialogTitle className="text-xl font-bold font-display text-gray-900">
              Ajustes de Tienda y Seguridad
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Modifica el canal de WhatsApp comercial y las credenciales de acceso de administración.
            </DialogDescription>
          </DialogHeader>

          {/* Navegación por Pestañas */}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab("whatsapp")}
              data-testid="tab-whatsapp"
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "whatsapp"
                  ? "bg-white text-emerald-700 shadow-xs border border-emerald-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
              }`}
            >
              <FaWhatsapp className="size-4 text-emerald-600" />
              <span>WhatsApp de Contacto</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("password")}
              data-testid="tab-password"
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "password"
                  ? "bg-white text-industrial shadow-xs border border-orange-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
              }`}
            >
              <KeyRound className="size-4 text-industrial" />
              <span>Cambiar Contraseña</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* TAB 1: WHATSAPP */}
          {activeTab === "whatsapp" && (
            <form onSubmit={handleSaveWhatsApp} className="space-y-4" data-testid="form-whatsapp">
              <div>
                <Label htmlFor="whatsapp-number" className="text-xs font-bold text-gray-700">
                  Número Telefónico de WhatsApp (con código de país)
                </Label>
                <p className="text-[11px] text-gray-500 mb-2">
                  Ejemplo para Argentina: <code className="font-mono text-gray-800">5492657659108</code> (54 + 9 + código de área sin 0 + número sin 15).
                </p>
                <div className="relative">
                  <Input
                    id="whatsapp-number"
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="5492657659108"
                    className="h-10 border-gray-300 bg-white text-gray-900 focus:border-emerald-500 focus:ring-emerald-500 font-mono text-sm"
                    required
                    data-testid="whatsapp-input"
                  />
                </div>
              </div>

              {/* Vista previa en vivo */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg text-xs text-emerald-900 space-y-1">
                <span className="font-semibold block text-[11px] text-emerald-800 uppercase tracking-wide">
                  Enlace de WhatsApp en Vivo:
                </span>
                <div className="flex items-center gap-2 font-mono text-[11px] truncate">
                  <span className="text-emerald-700">https://wa.me/{cleanPhonePreview || "..."}</span>
                  {cleanPhonePreview.length >= 8 && (
                    <a
                      href={`https://wa.me/${cleanPhonePreview}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-emerald-600 hover:underline"
                      title="Probar enlace en nueva ventana"
                    >
                      <ExternalLink className="size-3 ml-1" />
                    </a>
                  )}
                </div>
                <p className="text-[10px] text-emerald-600">
                  Este número se usará de inmediato en el Carrito, Fichas de Producto, Botón Flotante y Footer.
                </p>
              </div>

              {phoneSuccess && (
                <div
                  role="alert"
                  className="p-3 bg-emerald-100/80 border border-emerald-300 text-emerald-800 rounded-lg text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  <span>{phoneSuccess}</span>
                </div>
              )}

              {phoneError && (
                <div
                  role="alert"
                  className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2"
                >
                  <AlertCircle className="size-4 shrink-0 text-red-500" />
                  <span>{phoneError}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSavingPhone}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer"
                  data-testid="save-whatsapp-btn"
                >
                  {isSavingPhone ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar WhatsApp</span>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: CONTRASEÑA */}
          {activeTab === "password" && (
            <form onSubmit={handleChangePassword} className="space-y-4" data-testid="form-password">
              <div>
                <Label htmlFor="current-password" className="text-xs font-bold text-gray-700">
                  Contraseña Actual
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="current-password"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-10 pr-10 border-gray-300 bg-white text-gray-900 focus:border-industrial focus:ring-industrial text-sm"
                    data-testid="current-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    title={showCurrent ? "Ocultar" : "Mostrar"}
                  >
                    {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="new-password" className="text-xs font-bold text-gray-700">
                  Nueva Contraseña (mínimo 8 caracteres)
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="new-password"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="h-10 pr-10 border-gray-300 bg-white text-gray-900 focus:border-industrial focus:ring-industrial text-sm"
                    data-testid="new-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    title={showNew ? "Ocultar" : "Mostrar"}
                  >
                    {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-password" className="text-xs font-bold text-gray-700">
                  Confirmar Nueva Contraseña
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="h-10 pr-10 border-gray-300 bg-white text-gray-900 focus:border-industrial focus:ring-industrial text-sm"
                    data-testid="confirm-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    title={showConfirm ? "Ocultar" : "Mostrar"}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {passwordSuccess && (
                <div
                  role="alert"
                  className="p-3 bg-emerald-100/80 border border-emerald-300 text-emerald-800 rounded-lg text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div
                  role="alert"
                  className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2"
                >
                  <AlertCircle className="size-4 shrink-0 text-red-500" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-industrial hover:bg-industrial-dark text-white font-medium cursor-pointer"
                  data-testid="change-password-btn"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <span>Actualizar Contraseña</span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

