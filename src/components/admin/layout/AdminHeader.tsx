import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PanelLeftClose, PanelLeftOpen, LogOut, ShieldCheck, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminAuth } from "@/context/admin-auth-context";
import { AdminSettingsModal } from "@/components/admin/settings/AdminSettingsModal";

export interface AdminHeaderProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

export function AdminHeader({ collapsed, onToggleSidebar }: AdminHeaderProps) {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/admin/login", replace: true });
  };

  return (
    <>
      <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-[#e5e7eb] bg-white text-[#111827] px-4 py-3 md:px-8 shadow-xs">
        {/* Botón de toggle y título de sección */}
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            title={collapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
            aria-label={collapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
            onClick={onToggleSidebar}
            className="text-gray-600 hover:bg-gray-100"
          >
            {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </Button>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm font-semibold text-gray-900 sm:inline">
              Panel de administración
            </span>
            <Badge variant="outline" className="gap-1 text-[11px] font-bold border-orange-200 bg-orange-50 text-industrial">
              <ShieldCheck className="size-3 text-industrial" />
              ADMIN
            </Badge>
          </div>
        </div>

        {/* Identidad del usuario, Configuración y Cierre de Sesión */}
        <div className="flex items-center gap-3">
          {user?.email && (
            <span
              className="hidden text-xs text-gray-500 lg:inline font-mono"
              title={`Sesión activa: ${user.email}`}
            >
              {user.email}
            </span>
          )}

          {/* Botón de Configuración Dinámica (WhatsApp y Contraseña) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
            className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
            title="Ajustes de tienda y cambio de contraseña"
            data-testid="admin-settings-btn"
          >
            <Sliders className="size-4 text-industrial" />
            <span className="hidden sm:inline">Configuración</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2 border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
            title="Cerrar sesión y volver al login"
          >
            <LogOut className="size-4" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>
      </header>

      {/* Modal de Configuración y Cambio de Contraseña */}
      <AdminSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
