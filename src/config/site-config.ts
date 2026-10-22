/**
 * Configuración estática inmutable del sitio web de Laboratorio Diésel.
 * Única fuente de verdad para datos de contacto, horarios, dirección,
 * textos institucionales, servicios técnicos, marcas autorizadas,
 * políticas comerciales y mensajes pre-formateados de WhatsApp (RNF-06, RF-02.2, RF-03.2, RF-04.1).
 */

import tallerHeroImg from "@/assets/workshop/taller-hero.webp";
import bancoPruebasImg from "@/assets/workshop/banco-pruebas.webp";
import diagnosticoElectronicoImg from "@/assets/workshop/diagnostico-electronico.webp";
import inyectoresDetalleImg from "@/assets/workshop/inyectores-detalle.webp";
import fachadaLocalImg from "@/assets/workshop/fachada-local.webp";

export interface ServiceItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly image: string;
  readonly badges: readonly string[];
  readonly colSpanDesktop?: string;
}

export interface NavLinkItem {
  readonly label: string;
  readonly href: string;
}

export interface WorkshopBrandItem {
  readonly id: string;
  readonly name: string;
  readonly subtitle?: string;
}

export interface PolicyAxis {
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly shortTitle: string;
  readonly content: string;
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

  // Número de WhatsApp oficial (Placeholder configurado en DA-01)
  phone: "5492657659108",

  // URL del iframe de Google Maps Embed centrado en la dirección física (RF-05, CL-01)
  googleMapsEmbedUrl:
    "https://www.google.com/maps?q=Pres.+Juan+Domingo+Per%C3%B3n+1215,+Villa+Mercedes,+San+Luis&output=embed",

  // URL externa para navegación directa a Google Maps (Fallback accesible)
  googleMapsDirectionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=Pres.+Juan+Domingo+Per%C3%B3n+1215,+Villa+Mercedes,+San+Luis",

  // Activos multimedia fotográficos reales del taller (RF-01.1, RF-01.2, RF-01.3, RF-02.1)
  workshopImages: {
    hero: tallerHeroImg,
    bancoPruebas: bancoPruebasImg,
    diagnosticoElectronico: diagnosticoElectronicoImg,
    inyectoresDetalle: inyectoresDetalleImg,
    fachadaLocal: fachadaLocalImg,
  } as const,

  // Enlaces de navegación áncora para Header y Footer (RF-01, RF-08)
  navLinks: [
    { label: "Inicio", href: "#inicio" },
    { label: "Servicios", href: "#servicios" },
    { label: "Garantías", href: "#garantias" },
    { label: "Ubicación", href: "#ubicacion" },
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

  // Textos y condiciones de garantía comercial básica en sección (RF-04)
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

  // 4 Bloques técnicos definitivos para el Bento Grid industrial (RF-02.1, RF-02.2)
  services: [
    {
      id: "banco-pruebas",
      title: "Banco de Pruebas y Calibración Computarizada",
      description:
        "Ensayo dinámico y calibración milimétrica de caudal, retorno y curvas de presión bajo especificaciones estrictas de fabricante para bombas e inyectores diésel.",
      icon: "Gauge",
      image: bancoPruebasImg,
      badges: [
        "Banco de Pruebas Computarizado",
        "Calibración Milimétrica",
        "Tolerancia OEM",
      ],
      colSpanDesktop: "lg:col-span-7",
    },
    {
      id: "bombas-inyectoras",
      title: "Servicio Integral de Bombas Inyectoras",
      description:
        "Diagnóstico, desarme y ajuste de bombas electrónicas, bombas lineales y bombas rotativas multimarca para utilitarios, transporte pesado y maquinaria agrícola.",
      icon: "Wrench",
      image: tallerHeroImg,
      badges: ["Bombas Lineales y Rotativas", "Línea Pesada y Agrícola"],
      colSpanDesktop: "lg:col-span-5",
    },
    {
      id: "inyectores-common-rail",
      title: "Inyectores Electrónicos Common Rail",
      description:
        "Equipamiento y fuentes electrónicas de precisión para testear, reparar y calibrar inyectores inductivos, piezoeléctricos, bombeantes (UPS/PLD) e inyectores bomba (UIS).",
      icon: "Activity",
      image: inyectoresDetalleImg,
      badges: [
        "Inductivos & Piezoeléctricos",
        "Sistemas UPS / PLD",
        "Sistemas UIS",
      ],
      colSpanDesktop: "lg:col-span-6",
    },
    {
      id: "diagnostico-repuestos",
      title: "Diagnóstico Electrónico y Provisión de Repuestos",
      description:
        "Escaneo en tiempo real de circuitos de combustible diésel y disponibilidad permanente de toberas, válvulas y conjuntos de recambio originales y alternativos seleccionados.",
      icon: "Package",
      image: diagnosticoElectronicoImg,
      badges: ["Diagnóstico en Tiempo Real", "Originales & Alternativos"],
      colSpanDesktop: "lg:col-span-6",
    },
  ] as const satisfies readonly ServiceItem[],

  // Cláusula de transparencia sobre repuestos originales y alternativos (RF-02.3)
  servicesTransparencyClause:
    "Trabajamos con repuestos legítimos de primer equipo (OEM) y líneas alternativas homologadas de máxima durabilidad, adecuándonos a la exigencia operativa de su vehículo o flota",

  // Nómina oficial inmutable de las 10 marcas atendidas para el carrusel continuo (RF-03.2)
  workshopBrands: [
    { id: "bosch", name: "Bosch", subtitle: "Diesel Service" },
    { id: "zexel", name: "Zexel" },
    { id: "denso", name: "Denso" },
    { id: "siemens-vdo", name: "Siemens VDO" },
    { id: "delphi", name: "Delphi" },
    { id: "caterpillar", name: "Caterpillar", subtitle: "CAT" },
    { id: "cummins", name: "Cummins" },
    { id: "stanadyne", name: "Stanadyne" },
    { id: "diesel-kiki", name: "Diesel Kiki" },
    { id: "perkins", name: "Perkins" },
  ] as const satisfies readonly WorkshopBrandItem[],

  // Los 4 ejes normativos de políticas comerciales y de garantía (RF-04.1)
  commercialPolicies: {
    title: "Políticas Comerciales y de Garantía",
    subtitle:
      "Términos operativos, validez de cotizaciones y respaldo técnico de Laboratorio Diésel",
    footerLinkText: "Políticas de Garantía y Cotización",
    axes: [
      {
        id: "cotizaciones-precios",
        number: 1,
        title: "Eje 1: Alcance de Cotizaciones y Precios Publicados",
        shortTitle: "Alcance de Cotizaciones y Precios",
        content:
          "Los precios exhibidos en el catálogo revisten carácter orientativo y referencial sujeto a variación cambiaria o de reposición de insumos. Toda consulta iniciada por WhatsApp o agregada al carrito representa una solicitud formal de presupuesto y asesoramiento técnico personalizado, no constituyendo en ningún caso una compra confirmada, reserva automática de stock físico ni obligación contractual exigible hasta tanto sea validada expresamente por el taller.",
      },
      {
        id: "garantia-calibracion",
        number: 2,
        title: "Eje 2: Garantía de Calibración y Laboratorio",
        shortTitle: "Garantía de Calibración y Laboratorio",
        content:
          "Las reparaciones, calibraciones de caudal en banco computarizado e inyectores de recambio cuentan con garantía técnica de 30 días corridos sobre mano de obra y piezas reemplazadas. La validez de la garantía queda estrictamente sujeta a que el montaje en el vehículo sea ejecutado por personal idóneo, habiendo realizado la limpieza química completa del depósito y cañerías de combustible, drenaje del filtro de gasoil y sustitución de elementos filtrantes por nuevos bajo especificación original.",
      },
      {
        id: "repuestos-originales-alternativos",
        number: 3,
        title: "Eje 3: Repuestos Originales y Alternativos",
        shortTitle: "Repuestos Originales y Alternativos",
        content:
          "Laboratorio Diésel mantiene una política de absoluta transparencia técnica. Se comercializan tanto repuestos legítimos de equipo original (OEM) de las principales marcas mundiales como líneas alternativas seleccionadas de probada confiabilidad. La procedencia, condición (nuevo o reacondicionado a nuevo) y garantía específica de cada pieza son notificadas de forma previa e inequívoca al cliente al emitir el presupuesto.",
      },
      {
        id: "recepcion-envios-comisionistas",
        number: 4,
        title: "Eje 4: Recepción, Envíos y Comisionistas",
        shortTitle: "Recepción, Envíos y Comisionistas",
        content:
          "Para clientes, transportistas y talleres mecánicos del interior de San Luis y provincias vecinas, se ofrece recepción y despacho diario de bombas e inyectores mediante comisionistas de confianza y empresas de encomienda habilitadas. Todo envío debe ser previamente coordinado por WhatsApp indicando datos de remitente y síntomas de falla.",
      },
    ] as const satisfies readonly PolicyAxis[],
  } as const,
} as const;

/**
 * Mapa de elevación estricta Z-Index Maestro (Spec 009, RF-10, Bloque 1 - Tarea 1.4)
 * Erradica colisiones de apilamiento entre barras fijas, modales y widgets interactivos.
 */
export const Z_INDEX = {
  NAVBAR: 50,          // Barra de Navegación Maestra (LandingNavbar)
  MODAL_DRAWER: 40,    // CartDrawer, CommercialPoliciesModal, FilterDrawer
  MOBILE_FILTER: 35,   // Botón flotante MobileFilterTrigger en catálogo móvil
  FLOATING_WIDGET: 30, // FloatingWhatsApp y CommercialPoliciesBanner
  STICKY_CONSOLE: 20,  // Consola fija de filtros en escritorio (CatalogFilters)
  INTERACTIVE_CARD: 10,// Tarjetas técnicas, Bento modules, menús locales
  BASE: 0,             // Superficie mineral base y fotografía cruda
} as const;

export type ZIndexLevel = (typeof Z_INDEX)[keyof typeof Z_INDEX];

