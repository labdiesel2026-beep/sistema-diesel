import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/config/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp-utils";

interface FloatingWhatsAppProps {
  className?: string;
  // Permite inyectar selectores para pruebas o configuraciones especiales
  targetSectionIds?: string[];
}

export function FloatingWhatsApp({
  className = "",
  targetSectionIds = ["garantias", "contacto"],
}: FloatingWhatsAppProps) {
  const [isOverlapping, setIsOverlapping] = useState(false);

  const generalUrl = buildWhatsAppUrl(
    SITE_CONFIG.phone,
    SITE_CONFIG.whatsappMessages.general,
  );

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const intersectingMap = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        // En pantallas grandes (>= 768px), no hay riesgo de tapar CTAs
        const isMobile = window.innerWidth < 768;

        entries.forEach((entry) => {
          intersectingMap.set(entry.target.id, entry.isIntersecting);
        });

        const anyIntersecting = Array.from(intersectingMap.values()).some(Boolean);
        setIsOverlapping(isMobile && anyIntersecting);
      },
      {
        threshold: 0.15, // Se activa cuando al menos el 15% de la sección es visible
      },
    );

    targetSectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOverlapping(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [targetSectionIds]);

  return (
    <aside
      aria-label="Acceso directo a WhatsApp"
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isOverlapping
          ? "pointer-events-none translate-y-6 opacity-0"
          : "translate-y-0 opacity-100"
      } ${className}`}
    >
      <a
        href={generalUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp para consulta general o turnos"
        className="group flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-emerald-950/25 transition-transform hover:scale-110 hover:bg-[#20BA5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-95"
      >
        <MessageCircle className="size-7" />
        <span className="sr-only">Contactar por WhatsApp</span>
      </a>
    </aside>
  );
}
