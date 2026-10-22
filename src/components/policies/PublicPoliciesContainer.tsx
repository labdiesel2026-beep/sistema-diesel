import { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { PoliciesBanner } from "./PoliciesBanner";
import { PoliciesModal } from "./PoliciesModal";

/**
 * Contenedor global de políticas comerciales y de garantía.
 * Protege todas las rutas públicas del sitio (/ , /catalogo, /catalogo/$productId)
 * y se auto-excluye formalmente en rutas privadas del panel administrativo /admin/* (RF-04.2, CL-06).
 */
export function PublicPoliciesContainer() {
  const [modalOpen, setModalOpen] = useState(false);

  // Leer la ruta actual de TanStack Router con fallback seguro
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  // Excluir formalmente rutas del panel de administración (/admin/*)
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <PoliciesBanner onOpenModal={() => setModalOpen(true)} />
      <PoliciesModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}

export default PublicPoliciesContainer;
