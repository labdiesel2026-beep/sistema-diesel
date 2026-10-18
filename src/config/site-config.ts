/**
 * Configuración estática inmutable del sitio web de Laboratorio Diésel.
 * Única fuente de verdad para datos de contacto, horarios, dirección,
 * textos institucionales y mensajes pre-formateados de WhatsApp (RNF-06).
 */

export interface ServiceItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
}

export interface NavLinkItem {
  readonly label: string;
  readonly href: string;
}

export const SITE_CONFIG = {
  // Denominación tipográfica (sin logo gráfico, DA-03)
  name: "Laboratorio Diésel",

  // Eslogan estático (RF-02)
  tagline: "Especialistas en inyección diésel",

  // Propuestas de valor (RF-02)
  valueProps: [
    "Más de 20 años en el rubro",
    "Equipamiento de última generación para la reparación y calibración de bombas e inyectores",
  ] as const,

  // Datos de contacto y ubicación física (RF-05, DA-02)
  address: "Pres. Juan Domingo Perón 1215, Villa Mercedes, San Luis",
  businessHours: "Lunes a Viernes de 9:00 a 18:00 h",

  // Número de WhatsApp oficial (Placeholder configurado en DA-01 pendiente de confirmación cliente)
  phone: "5492657659108",

  // URL del iframe de Google Maps Embed centrado en la dirección física (RF-05, CL-01)
  googleMapsEmbedUrl:
    "https://www.google.com/maps?q=Pres.+Juan+Domingo+Per%C3%B3n+1215,+Villa+Mercedes,+San+Luis&output=embed",

  // URL externa para navegación directa a Google Maps (Fallback accesible)
  googleMapsDirectionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=Pres.+Juan+Domingo+Per%C3%B3n+1215,+Villa+Mercedes,+San+Luis",

  // Enlaces de navegación áncora para Header y Footer (RF-01, RF-08)
  navLinks: [
    { label: "Inicio", href: "#inicio" },
    { label: "Servicios", href: "#servicios" },
    { label: "Garantías", href: "#garantias" },
    { label: "Ubicación", href: "#ubicacion" },
    { label: "Contacto", href: "#contacto" },
  ] as const satisfies readonly NavLinkItem[],

  // Mensajes pre-formateados de WhatsApp (RF-04, RF-06, RF-07)
  whatsappMessages: {
    // RF-04: Consulta por garantía
    warranty:
      "Hola, me contacto desde la web de Laboratorio Diésel.\nMotivo: Consulta por garantía / soporte post-venta.",
    // RF-07: Consulta general / turnos (botón flotante)
    general:
      "Hola, me contacto desde la web de Laboratorio Diésel.\nMotivo: Consulta general / solicitar turno.",
  } as const,

  // Textos y condiciones de garantía comercial (RF-04)
  warrantyTerms: {
    title: "Garantía de Calidad y Confianza Técnica",
    summary:
      "Todos nuestros trabajos de reparación, calibración y recambio de inyectores cuentan con respaldo técnico garantizado.",
    details: [
      "Garantía técnica de 30 días corridos sobre mano de obra y componentes reemplazados.",
      "Pruebas de estanqueidad, entrega y retorno bajo parámetros estrictos de fabricante en banco computarizado.",
      "Atención y soporte de posventa directo a través de nuestro canal de WhatsApp para agilizar cualquier consulta técnica.",
    ] as const,
  } as const,

  // Servicios representativos del taller (RF-03)
  services: [
    {
      id: "reparacion-inyectores",
      title: "Reparación de Inyectores",
      description:
        "Desarme, limpieza por ultrasonido y reemplazo de componentes de alta precisión en inyectores Common Rail multimarca.",
      icon: "Wrench",
    },
    {
      id: "calibracion-banco",
      title: "Calibración en Banco de Pruebas",
      description:
        "Ajuste milimétrico y validación de caudales de inyección bajo especificaciones originales del fabricante.",
      icon: "Gauge",
    },
    {
      id: "diagnostico-electronico",
      title: "Diagnóstico Computarizado",
      description:
        "Detección precisa de fallas en el circuito de combustible diésel y lectura de parámetros de funcionamiento en tiempo real.",
      icon: "Activity",
    },
    {
      id: "repuestos-recambios",
      title: "Repuestos y Recambios",
      description:
        "Disponibilidad de toberas, válvulas, arandelas de suplemento e inyectores reacondicionados listos para instalación.",
      icon: "Package",
    },
  ] as const satisfies readonly ServiceItem[],
} as const;
