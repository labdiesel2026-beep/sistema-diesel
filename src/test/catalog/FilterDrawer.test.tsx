import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterDrawer, MobileFilterTrigger } from "@/components/catalog/FilterDrawer";

describe("FilterDrawer y MobileFilterTrigger", () => {
  it("MobileFilterTrigger se renderiza con nivel z-35, label técnico y badge condicional", () => {
    const handleClick = vi.fn();

    const { rerender } = render(
      <MobileFilterTrigger onClick={handleClick} activeFiltersCount={0} />,
    );

    const triggerContainer = screen.getByTestId("mobile-filter-trigger-container");
    expect(triggerContainer).toBeInTheDocument();
    expect(triggerContainer.className).toContain("z-35");

    const button = screen.getByTestId("mobile-filter-trigger");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/FILTROS TÉCNICOS/i);
    expect(screen.queryByTestId("mobile-filter-badge")).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Rerender con filtros activos
    rerender(<MobileFilterTrigger onClick={handleClick} activeFiltersCount={3} />);
    const badge = screen.getByTestId("mobile-filter-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("3");
  });

  it("FilterDrawer renderiza en z-40 con max-w-[340px] y permite resetear filtros", () => {
    const handleOpenChange = vi.fn();
    const handleResetFilters = vi.fn();

    render(
      <FilterDrawer
        open={true}
        onOpenChange={handleOpenChange}
        activeFiltersCount={2}
        onResetFilters={handleResetFilters}
      >
        <div data-testid="test-filter-children">Contenido de Filtros</div>
      </FilterDrawer>,
    );

    const content = screen.getByTestId("filter-drawer-content");
    expect(content).toBeInTheDocument();
    expect(content.className).toContain("z-40");
    expect(content.className).toContain("max-w-[340px]");
    expect(screen.getByTestId("test-filter-children")).toBeInTheDocument();

    expect(screen.getByText(/Filtros Técnicos/i)).toBeInTheDocument();

    const resetBtn = screen.getByTestId("reset-filters-mobile-button");
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(handleResetFilters).toHaveBeenCalledTimes(1);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
