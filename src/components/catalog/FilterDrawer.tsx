import type { ReactNode } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeFiltersCount: number;
  onResetFilters: () => void;
  children: ReactNode;
}

export function FilterDrawer({
  open,
  onOpenChange,
  activeFiltersCount,
  onResetFilters,
  children,
}: FilterDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="z-40 w-[300px] max-w-[340px] border-r border-border bg-card p-6 overflow-y-auto technical-scrollbar sm:w-[340px]"
        data-testid="filter-drawer-content"
      >
        <SheetHeader className="mb-4 text-left">
          <SheetTitle className="flex items-center justify-between font-display text-lg text-foreground">
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-primary" />
              <span className="font-mono text-xs uppercase tracking-wider font-bold">
                Filtros Técnicos
              </span>
            </span>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onResetFilters();
                  onOpenChange(false);
                }}
                className="h-8 gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                data-testid="reset-filters-mobile-button"
              >
                <RotateCcw className="size-3" />
                Limpiar
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}

export interface MobileFilterTriggerProps {
  onClick: () => void;
  activeFiltersCount: number;
  className?: string;
}

export function MobileFilterTrigger({
  onClick,
  activeFiltersCount,
  className = "",
}: MobileFilterTriggerProps) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-35 lg:hidden ${className}`}
      data-testid="mobile-filter-trigger-container"
    >
      <Button
        variant="industrial"
        className="h-12 gap-2.5 rounded-full border border-border/80 bg-card/95 px-5 font-mono text-xs font-bold uppercase tracking-wider text-foreground shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95"
        onClick={onClick}
        aria-label="Abrir filtros técnicos de productos"
        data-testid="mobile-filter-trigger"
      >
        <SlidersHorizontal className="size-4 text-primary" />
        <span>FILTROS TÉCNICOS</span>
        {activeFiltersCount > 0 && (
          <span
            className="flex size-5 items-center justify-center rounded-full bg-primary font-mono text-[10px] font-bold text-primary-foreground animate-in zoom-in"
            data-testid="mobile-filter-badge"
          >
            {activeFiltersCount}
          </span>
        )}
      </Button>
    </div>
  );
}
