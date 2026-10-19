import { useNavigate } from "@tanstack/react-router";
import { PanelLeftClose, PanelLeftOpen, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminAuth } from "@/context/admin-auth-context";

export interface AdminHeaderProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

export function AdminHeader({ collapsed, onToggleSidebar }: AdminHeaderProps) {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/admin/login", replace: true });
  };

  return (
    <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 md:px-8">
      {/* Botón de toggle y título de sección */}
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant="ghost"
          title={collapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
          aria-label={collapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
          onClick={onToggleSidebar}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-5" />
          ) : (
            <PanelLeftClose className="size-5" />
          )}
        </Button>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm font-semibold text-foreground sm:inline">
            Panel de administración
          </span>
          <Badge variant="secondary" className="gap-1 text-[11px] font-bold">
            <ShieldCheck className="size-3 text-primary" />
            ADMIN
          </Badge>
        </div>
      </div>

      {/* Identidad del usuario y Cierre de Sesión */}
      <div className="flex items-center gap-3">
        {user?.email && (
          <span
            className="hidden text-xs text-muted-foreground lg:inline font-mono"
            title={`Sesión activa: ${user.email}`}
          >
            {user.email}
          </span>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-2 border-border text-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
          title="Cerrar sesión y volver al login"
        >
          <LogOut className="size-4" />
          <span>Cerrar Sesión</span>
        </Button>
      </div>
    </header>
  );
}
