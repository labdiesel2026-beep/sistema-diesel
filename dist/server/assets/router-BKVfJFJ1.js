import { _ as usePoliciesConsent, c as buildWhatsAppUrl, d as PoliciesModal, f as SITE_CONFIG, g as taller_hero_default, h as banco_pruebas_default, i as formatPrice, l as ProductImageWithFallback, m as inyectores_detalle_default, n as LandingNavbar, p as fachada_local_default, r as LandingFooter, t as pageHead, u as CatalogCTAButton, v as CatalogCartProvider } from "./diesel-site-DP12_HDl.js";
import { a as cn, i as Button, n as api } from "./api-Db5K75is.js";
import { t as Route$8 } from "./catalogo-DOhKj-cT.js";
import { t as Route$9 } from "./catalogo._productId-BYQCybBj.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HeadContent, Link, Outlet, Scripts, createFileRoute, createRootRouteWithContext, createRouter, lazyRouteComponent, useLocation, useRouter, useRouterState } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
//#region src/styles.css?url
var styles_default = "/assets/styles-D4UGDjy_.css";
//#endregion
//#region src/components/policies/PoliciesBanner.tsx
function PoliciesBanner({ onOpenModal, className = "" }) {
	const { shouldShowBanner, acceptPolicies } = usePoliciesConsent();
	const [hasDelayElapsed, setHasDelayElapsed] = useState(false);
	useEffect(() => {
		if (!shouldShowBanner) {
			setHasDelayElapsed(false);
			return;
		}
		const timer = setTimeout(() => {
			setHasDelayElapsed(true);
		}, 1e3);
		return () => clearTimeout(timer);
	}, [shouldShowBanner]);
	if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) return null;
	return /* @__PURE__ */ jsx(AnimatePresence, { children: shouldShowBanner && hasDelayElapsed && /* @__PURE__ */ jsx(motion.aside, {
		role: "region",
		"aria-label": "Aviso de políticas comerciales y de garantía",
		initial: {
			opacity: 0,
			y: 40,
			scale: .96
		},
		animate: {
			opacity: 1,
			y: 0,
			scale: 1
		},
		exit: {
			opacity: 0,
			y: 30,
			scale: .96,
			transition: { duration: .3 }
		},
		transition: {
			duration: .4,
			ease: [
				.16,
				1,
				.3,
				1
			]
		},
		className: `fixed bottom-3 inset-x-3 z-30 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md w-auto rounded-none border border-white/10 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur-md text-zinc-100 ${className}`,
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex items-start gap-3.5",
			children: [/* @__PURE__ */ jsx("div", {
				className: "flex size-10 shrink-0 items-center justify-center border border-orange-500/30 bg-orange-500/10 text-industrial",
				children: /* @__PURE__ */ jsx(ShieldCheck, { className: "size-5" })
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex-1",
				children: [
					/* @__PURE__ */ jsx("h3", {
						className: "font-display text-sm font-semibold tracking-tight text-white uppercase",
						children: "Políticas Comerciales y Garantía"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-xs leading-relaxed text-zinc-400",
						children: "Precios orientativos sujetos a cotización técnica. Trabajos y componentes con garantía de 30 días bajo protocolo de montaje idóneo."
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-4 flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ jsxs(Button, {
							type: "button",
							size: "sm",
							onClick: acceptPolicies,
							className: "h-8.5 rounded-none bg-industrial px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-industrial-hover active:scale-[0.98] transition-all cursor-pointer",
							children: ["Aceptar y Continuar", /* @__PURE__ */ jsx(ArrowRight, { className: "ml-1.5 size-3.5" })]
						}), onOpenModal && /* @__PURE__ */ jsxs(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							onClick: onOpenModal,
							className: "h-8.5 rounded-none px-2.5 text-xs font-medium text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer",
							children: ["Ver Políticas Completas", /* @__PURE__ */ jsx(ExternalLink, { className: "ml-1 size-3" })]
						})]
					})
				]
			})]
		})
	}) });
}
//#endregion
//#region src/components/policies/PublicPoliciesContainer.tsx
/**
* Contenedor global de políticas comerciales y de garantía.
* Protege todas las rutas públicas del sitio (/ , /catalogo, /catalogo/$productId)
* y se auto-excluye formalmente en rutas privadas del panel administrativo /admin/* (RF-04.2, CL-06).
*/
function PublicPoliciesContainer() {
	const [modalOpen, setModalOpen] = useState(false);
	if (useRouterState({ select: (state) => state.location.pathname }).startsWith("/admin")) return null;
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(PoliciesBanner, { onOpenModal: () => setModalOpen(true) }), /* @__PURE__ */ jsx(PoliciesModal, {
		open: modalOpen,
		onOpenChange: setModalOpen
	})] });
}
//#endregion
//#region src/components/layout/PublicLayoutWrapper.tsx
/**
* Envoltorio de maquetación para vistas públicas (Landing, Catálogo, Detalle y Carrito).
* (Spec 009, RF-01, RF-12, Spec 010, RF-07, Caso Límite 3, TASK-15)
*
* Características:
* - Inyecta la clase `dark` de forma determinista y sincrónica para activar los tokens semánticos OKLCH oscuros.
* - En `pathname === '/'` (Landing Page), aplica el relleno compensatorio dinámico para la barra fija móvil:
*   padding-bottom: calc(var(--bottom-bar-height, 64px) + env(safe-area-inset-bottom))
* - En rutas secundarias (/catalogo, /admin, etc.), este padding no se aplica.
*/
function PublicLayoutWrapper({ children, className = "" }) {
	const isLandingPage = useLocation().pathname === "/";
	return /* @__PURE__ */ jsx("div", {
		className: cn("dark min-h-screen bg-background text-foreground antialiased selection:bg-white/20 selection:text-white", isLandingPage && "landing-bottom-bar-pad pb-[calc(var(--bottom-bar-height,64px)+env(safe-area-inset-bottom,0px))]", className),
		style: isLandingPage ? { paddingBottom: "calc(var(--bottom-bar-height, 64px) + env(safe-area-inset-bottom, 0px))" } : void 0,
		"data-testid": "public-layout-wrapper",
		children
	});
}
//#endregion
//#region src/routes/__root.tsx
function NotFoundComponent() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-6",
					children: /* @__PURE__ */ jsx(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	const router = useRouter();
	useEffect(() => {
		console.error("[Root ErrorBoundary]", error);
	}, [error]);
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ jsx("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$7 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Laboratorio Diésel" },
			{
				name: "description",
				content: "Especialistas en inyección diésel y Common Rail."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.svg",
				type: "image/svg+xml"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Barlow:wght@500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "es",
		children: [/* @__PURE__ */ jsxs("head", { children: [/* @__PURE__ */ jsx(HeadContent, {}), /* @__PURE__ */ jsx("script", { dangerouslySetInnerHTML: { __html: `document.documentElement.classList.add('js-enabled');` } })] }), /* @__PURE__ */ jsxs("body", { children: [children, /* @__PURE__ */ jsx(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$7.useRouteContext();
	const isAdmin = useLocation().pathname.startsWith("/admin");
	useEffect(() => {
		document.documentElement.classList.add("js-enabled");
		document.body.classList.add("js-enabled");
	}, []);
	return /* @__PURE__ */ jsx(QueryClientProvider, {
		client: queryClient,
		children: isAdmin ? /* @__PURE__ */ jsx(Outlet, {}) : /* @__PURE__ */ jsx(CatalogCartProvider, { children: /* @__PURE__ */ jsxs(PublicLayoutWrapper, { children: [/* @__PURE__ */ jsx(Outlet, {}), /* @__PURE__ */ jsx(PublicPoliciesContainer, {})] }) })
	});
}
//#endregion
//#region src/components/landing/scroll-reveal.ts
/**
* Spec 010 (RF-05, Caso Límite 2, RNF-02):
* Sistema canónico de revelación progresiva al scroll con stagger y activación única (once).
*
* Configuración canónica:
* - Umbral de intersección: 10% (amount: 0.1)
* - Activación única: once: true
* - Stagger entre tarjetas consecutivas: 0.12s (rango 0.1s - 0.2s)
* - Curva de aceleración: cubic-bezier(0.16, 1, 0.3, 1)
* - Resiliencia ante scroll ultrarrápido y navegación SPA.
*/
var revealedSectionsCache = /* @__PURE__ */ new Set();
var scrollRevealViewport = {
	once: true,
	amount: .1
};
var staggerContainerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: .12,
			delayChildren: .05
		}
	}
};
var instantContainerVariants = {
	hidden: { opacity: 1 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0,
			delayChildren: 0
		}
	}
};
var scrollRevealItemVariants = {
	hidden: {
		opacity: 0,
		y: 20
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: .6,
			ease: [
				.16,
				1,
				.3,
				1
			]
		}
	}
};
var instantItemVariants = {
	hidden: {
		opacity: 1,
		y: 0
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0 }
	}
};
var singleBlockVariants = {
	hidden: {
		opacity: 0,
		y: 20
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: .7,
			ease: [
				.16,
				1,
				.3,
				1
			]
		}
	}
};
var instantSingleBlockVariants = {
	hidden: {
		opacity: 1,
		y: 0
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0 }
	}
};
function useScrollReveal(sectionId) {
	const ref = useRef(null);
	const shouldReduceMotion = useReducedMotion();
	const [isVisible, setIsVisible] = useState(false);
	const [isInstant, setIsInstant] = useState(() => {
		if (shouldReduceMotion) return true;
		if (sectionId && revealedSectionsCache.has(sectionId)) return true;
		return false;
	});
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (shouldReduceMotion || sectionId && revealedSectionsCache.has(sectionId)) {
			setIsInstant(true);
			setIsVisible(true);
			el.classList.add("opacity-100", "translate-y-0", "revealed", "is-visible");
			el.classList.remove("opacity-0", "translate-y-4", "translate-y-8", "translate-y-20");
			return;
		}
		const rect = el.getBoundingClientRect();
		if (rect.bottom <= 0 || rect.top < window.innerHeight && rect.bottom > 0) {
			setIsVisible(true);
			setIsInstant(true);
			if (sectionId) revealedSectionsCache.add(sectionId);
			el.classList.add("opacity-100", "translate-y-0", "revealed", "is-visible");
			el.classList.remove("opacity-0", "translate-y-4", "translate-y-8", "translate-y-20");
		} else el.classList.add("scroll-reveal");
		let observer = null;
		if (typeof IntersectionObserver !== "undefined") {
			observer = new IntersectionObserver((entries) => {
				for (const entry of entries) if (entry.isIntersecting) {
					setIsVisible(true);
					if (sectionId) revealedSectionsCache.add(sectionId);
					el.classList.add("is-visible", "opacity-100", "translate-y-0", "revealed");
					el.classList.remove("opacity-0", "translate-y-4", "translate-y-8", "translate-y-20");
					el.querySelectorAll(".scroll-reveal, [data-scroll-reveal], .scroll-reveal-item").forEach((child) => {
						child.classList.add("is-visible", "opacity-100", "translate-y-0", "revealed");
						child.classList.remove("opacity-0", "translate-y-4", "translate-y-8", "translate-y-20");
					});
					if (observer) {
						observer.unobserve(el);
						observer.disconnect();
					}
					break;
				}
			}, {
				threshold: .1,
				rootMargin: "0px 0px -40px 0px"
			});
			observer.observe(el);
		}
		const handleKeyDown = (e) => {
			if (e.key === "PageDown" || e.key === "End" || e.key === " " && !e.shiftKey) {
				setIsInstant(true);
				setIsVisible(true);
				if (sectionId) revealedSectionsCache.add(sectionId);
				el.classList.add("opacity-100", "translate-y-0", "revealed", "is-visible");
			}
		};
		let lastScrollY = window.scrollY;
		let lastTime = performance.now();
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			const currentTime = performance.now();
			const timeDelta = currentTime - lastTime;
			if (timeDelta > 0) {
				if (Math.abs(currentScrollY - lastScrollY) / timeDelta > 2.5) {
					setIsInstant(true);
					setIsVisible(true);
					if (sectionId) revealedSectionsCache.add(sectionId);
					el.classList.add("opacity-100", "translate-y-0", "revealed", "is-visible");
				}
			}
			lastScrollY = currentScrollY;
			lastTime = currentTime;
			const currentRect = el.getBoundingClientRect();
			if (currentRect.top < window.innerHeight && currentRect.bottom > 0) {
				setIsVisible(true);
				if (sectionId) revealedSectionsCache.add(sectionId);
				el.classList.add("opacity-100", "translate-y-0", "revealed", "is-visible");
			}
		};
		window.addEventListener("keydown", handleKeyDown, { passive: true });
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => {
			if (observer) observer.disconnect();
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("scroll", handleScroll);
		};
	}, [sectionId, shouldReduceMotion]);
	const handleAnimationComplete = () => {
		if (sectionId) revealedSectionsCache.add(sectionId);
	};
	return {
		ref,
		isInstant,
		isVisible,
		handleAnimationComplete,
		containerVariants: isInstant ? instantContainerVariants : staggerContainerVariants,
		itemVariants: isInstant ? instantItemVariants : scrollRevealItemVariants,
		singleVariants: isInstant ? instantSingleBlockVariants : singleBlockVariants,
		viewportConfig: scrollRevealViewport,
		transitionClass: "transition-all duration-700 ease-out"
	};
}
//#endregion
//#region src/components/landing/BenchShowcaseSection.tsx
function BenchShowcaseSection({ className = "" }) {
	const { ref, isInstant, containerVariants, itemVariants, singleVariants, viewportConfig, handleAnimationComplete } = useScrollReveal("equipamiento");
	return /* @__PURE__ */ jsx("section", {
		ref,
		"aria-label": "Exhibición técnica de bancos de prueba",
		className: `relative overflow-hidden bg-zinc-950 py-24 md:py-32 border-b border-white/10 ${className}`,
		children: /* @__PURE__ */ jsxs("div", {
			className: "site-container",
			children: [/* @__PURE__ */ jsxs(motion.div, {
				variants: singleVariants,
				initial: isInstant ? "visible" : "hidden",
				whileInView: "visible",
				viewport: viewportConfig,
				className: "mb-20",
				children: [/* @__PURE__ */ jsx("p", {
					className: "font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600 mb-3",
					children: "Infraestructura y Banco Computarizado"
				}), /* @__PURE__ */ jsx("h2", {
					className: "text-4xl md:text-6xl font-light tracking-tighter text-white uppercase",
					children: "Equipamiento de Calibración"
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-32",
				children: [/* @__PURE__ */ jsxs(motion.div, {
					variants: singleVariants,
					initial: isInstant ? "visible" : "hidden",
					whileInView: "visible",
					viewport: viewportConfig,
					className: "grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "lg:col-span-7 relative overflow-hidden border border-white/10 group",
						children: [/* @__PURE__ */ jsx("img", {
							src: banco_pruebas_default,
							alt: "Banco de pruebas computarizado de alta presión",
							className: "w-full h-[400px] md:h-[550px] object-cover transition-transform duration-700 ease-out group-hover:scale-105",
							loading: "lazy"
						}), /* @__PURE__ */ jsx("div", {
							className: "absolute bottom-4 left-4 font-mono text-[10px] tracking-widest uppercase text-white/70 bg-zinc-950/80 px-3 py-1.5 border border-white/10",
							children: "Línea de Ensayos Dinámicos"
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "lg:col-span-5 flex flex-col justify-center space-y-10",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("span", {
								className: "font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 block mb-2",
								children: "01 / CAPACIDAD TÉCNICA"
							}),
							/* @__PURE__ */ jsx("h3", {
								className: "text-4xl md:text-5xl font-light tracking-tight text-white uppercase leading-tight",
								children: "Banco de Pruebas Common Rail"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-4 text-sm md:text-base font-light text-zinc-400 leading-relaxed",
								children: "Generación de curvas de caudal, control de estanqueidad milimétrica y simulación de carga en tiempo real bajo protocolos rigurosos de inyección diésel moderna."
							})
						] }), /* @__PURE__ */ jsxs(motion.div, {
							variants: containerVariants,
							initial: isInstant ? "visible" : "hidden",
							whileInView: "visible",
							viewport: viewportConfig,
							className: "grid grid-cols-2 gap-8 border-t border-white/10 pt-8",
							children: [
								/* @__PURE__ */ jsxs(motion.div, {
									variants: itemVariants,
									children: [/* @__PURE__ */ jsx("div", {
										className: "text-5xl font-light text-white tracking-tight",
										children: "2.500"
									}), /* @__PURE__ */ jsx("div", {
										className: "mt-2 text-xs uppercase tracking-widest text-zinc-500 font-mono",
										children: "Bar Presión Max"
									})]
								}),
								/* @__PURE__ */ jsxs(motion.div, {
									variants: itemVariants,
									children: [/* @__PURE__ */ jsx("div", {
										className: "text-5xl font-light text-white tracking-tight",
										children: "4"
									}), /* @__PURE__ */ jsx("div", {
										className: "mt-2 text-xs uppercase tracking-widest text-zinc-500 font-mono",
										children: "Canales Simultáneos"
									})]
								}),
								/* @__PURE__ */ jsxs(motion.div, {
									variants: itemVariants,
									children: [/* @__PURE__ */ jsx("div", {
										className: "text-5xl font-light text-white tracking-tight",
										children: "0.01"
									}), /* @__PURE__ */ jsx("div", {
										className: "mt-2 text-xs uppercase tracking-widest text-zinc-500 font-mono",
										children: "mm Tolerancia"
									})]
								}),
								/* @__PURE__ */ jsxs(motion.div, {
									variants: itemVariants,
									children: [/* @__PURE__ */ jsx("div", {
										className: "text-5xl font-light text-white tracking-tight",
										children: "OEM"
									}), /* @__PURE__ */ jsx("div", {
										className: "mt-2 text-xs uppercase tracking-widest text-zinc-500 font-mono",
										children: "Calibración"
									})]
								})
							]
						})]
					})]
				}), /* @__PURE__ */ jsxs(motion.div, {
					variants: singleVariants,
					initial: isInstant ? "visible" : "hidden",
					whileInView: "visible",
					viewport: viewportConfig,
					onAnimationComplete: handleAnimationComplete,
					className: "grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "lg:col-span-5 lg:order-1 order-2 flex flex-col justify-center space-y-10",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("span", {
								className: "font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 block mb-2",
								children: "02 / PRECISIÓN"
							}),
							/* @__PURE__ */ jsx("h3", {
								className: "text-4xl md:text-5xl font-light tracking-tight text-white uppercase leading-tight",
								children: "Ajuste Micrométrico"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-4 text-sm md:text-base font-light text-zinc-400 leading-relaxed",
								children: "Diagnóstico electrónico de actuadores inductivos y piezoeléctricos con calibración de preinyección, inyección principal y retorno."
							})
						] }), /* @__PURE__ */ jsxs(motion.div, {
							variants: containerVariants,
							initial: isInstant ? "visible" : "hidden",
							whileInView: "visible",
							viewport: viewportConfig,
							className: "grid grid-cols-2 gap-8 border-t border-white/10 pt-8",
							children: [/* @__PURE__ */ jsxs(motion.div, {
								variants: itemVariants,
								children: [/* @__PURE__ */ jsx("div", {
									className: "text-5xl font-light text-white tracking-tight",
									children: "100%"
								}), /* @__PURE__ */ jsx("div", {
									className: "mt-2 text-xs uppercase tracking-widest text-zinc-500 font-mono",
									children: "Trazabilidad"
								})]
							}), /* @__PURE__ */ jsxs(motion.div, {
								variants: itemVariants,
								children: [/* @__PURE__ */ jsx("div", {
									className: "text-5xl font-light text-white tracking-tight",
									children: "30 D"
								}), /* @__PURE__ */ jsx("div", {
									className: "mt-2 text-xs uppercase tracking-widest text-zinc-500 font-mono",
									children: "Garantía Escrita"
								})]
							})]
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "lg:col-span-7 lg:order-2 order-1 relative overflow-hidden border border-white/10 group",
						children: [/* @__PURE__ */ jsx("img", {
							src: inyectores_detalle_default,
							alt: "Detalle de inyectores Common Rail en calibración de precisión",
							className: "w-full h-[400px] md:h-[550px] object-cover transition-transform duration-700 ease-out group-hover:scale-105",
							loading: "lazy"
						}), /* @__PURE__ */ jsx("div", {
							className: "absolute bottom-4 left-4 font-mono text-[10px] tracking-widest uppercase text-white/70 bg-zinc-950/80 px-3 py-1.5 border border-white/10",
							children: "Inyectores Inductivos y Piezoeléctricos"
						})]
					})]
				})]
			})]
		})
	});
}
//#endregion
//#region src/components/landing/brands/BrandLogos.tsx
function BoschLogo({ className = "h-8 w-auto", ...props }) {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 180 40",
		fill: "currentColor",
		className,
		"aria-label": "Bosch Diesel Service",
		role: "img",
		...props,
		children: [
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(4, 4)",
				children: [
					/* @__PURE__ */ jsx("circle", {
						cx: "16",
						cy: "16",
						r: "15",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "2.5"
					}),
					/* @__PURE__ */ jsx("circle", {
						cx: "16",
						cy: "16",
						r: "10.5",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("rect", {
						x: "13.5",
						y: "3",
						width: "5",
						height: "26",
						rx: "1.5",
						fill: "currentColor"
					}),
					/* @__PURE__ */ jsx("rect", {
						x: "3",
						y: "13.5",
						width: "26",
						height: "5",
						rx: "1.5",
						fill: "currentColor"
					}),
					/* @__PURE__ */ jsx("circle", {
						cx: "16",
						cy: "16",
						r: "3.5",
						fill: "currentColor"
					})
				]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(44, 2)",
				children: [
					/* @__PURE__ */ jsx("path", { d: "M0 2h10c3.5 0 6 1.8 6 4.8 0 2-1.2 3.5-3 4.2 2.4.7 3.8 2.5 3.8 4.8 0 3.4-2.8 5.2-6.8 5.2H0V2zm4.5 4v3.5h5.2c1.4 0 2.2-.8 2.2-1.8 0-1-.8-1.7-2.2-1.7H4.5zm0 6.8v4.5h5.5c1.6 0 2.5-.9 2.5-2.2 0-1.4-.9-2.3-2.5-2.3H4.5z" }),
					/* @__PURE__ */ jsx("path", { d: "M25 2c6.2 0 10.5 4.4 10.5 9.5s-4.3 9.5-10.5 9.5S14.5 16.6 14.5 11.5 18.8 2 25 2zm0 4.2c-3.4 0-5.8 2.4-5.8 5.3s2.4 5.3 5.8 5.3 5.8-2.4 5.8-5.3-2.4-5.3-5.8-5.3z" }),
					/* @__PURE__ */ jsx("path", { d: "M46.8 6.5c-1.3-.9-3-1.4-4.8-1.4-2.5 0-4.2 1.3-4.2 3.2 0 4.5 10.5 2.2 10.5 8.3 0 3-2.5 4.7-6.5 4.7-2.8 0-5.2-.9-7-2.4l2-3.2c1.4 1.2 3.2 1.8 5 1.8 2.4 0 4-1.1 4-2.7 0-4.5-10.5-2.2-10.5-8.2 0-3.2 2.6-4.9 6.7-4.9 2.4 0 4.6.7 6.2 1.8l-1.4 3z" }),
					/* @__PURE__ */ jsx("path", { d: "M60.5 2c5.8 0 9.8 4 9.8 9.5h-4.6c0-3-2.2-5.3-5.2-5.3-3.4 0-5.7 2.4-5.7 5.3s2.3 5.3 5.7 5.3c3 0 5.2-2.3 5.2-5.3h4.6c0 5.5-4 9.5-9.8 9.5-6.2 0-10.4-4.3-10.4-9.5S54.3 2 60.5 2z" }),
					/* @__PURE__ */ jsx("path", { d: "M72 2h4.6v6.8h7.8V2H89v19h-4.6v-7.8h-7.8V21H72V2z" })
				]
			}),
			/* @__PURE__ */ jsx("text", {
				x: "44",
				y: "34",
				fontFamily: "system-ui, -apple-system, sans-serif",
				fontSize: "8",
				fontWeight: "700",
				letterSpacing: "1.8",
				fill: "currentColor",
				children: "DIESEL SERVICE"
			})
		]
	});
}
function ZexelLogo({ className = "h-8 w-auto", ...props }) {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 150 40",
		fill: "currentColor",
		className,
		"aria-label": "Zexel",
		role: "img",
		...props,
		children: /* @__PURE__ */ jsxs("g", {
			transform: "skewX(-12) translate(12, 6)",
			children: [
				/* @__PURE__ */ jsx("path", { d: "M4 4h18l-10 16h11v5H3l10-16H4V4z" }),
				/* @__PURE__ */ jsx("path", { d: "M26 4h16v5H32v5h9v4.5h-9v5.5h11V29H26V4z" }),
				/* @__PURE__ */ jsx("path", { d: "M44 4h6l5.5 9 5.5-9h6l-8.5 12.5L67 29h-6l-6-9.5-6 9.5h-6l8.8-12.5L44 4z" }),
				/* @__PURE__ */ jsx("path", { d: "M69 4h16v5H75v5h9v4.5h-9v5.5h11V29H69V4z" }),
				/* @__PURE__ */ jsx("path", { d: "M88 4h6v20h11v5H88V4z" })
			]
		})
	});
}
function DensoLogo({ className = "h-8 w-auto", ...props }) {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 150 40",
		fill: "currentColor",
		className,
		"aria-label": "Denso",
		role: "img",
		...props,
		children: /* @__PURE__ */ jsxs("g", {
			transform: "translate(6, 8)",
			children: [
				/* @__PURE__ */ jsx("path", { d: "M4 1h12.5l7.5 7.5v15.5H4V1zm6 6v12h9V10l-4-3H10z" }),
				/* @__PURE__ */ jsx("path", { d: "M28 1h17v5.5H34v4h10v5H34v4.5h11V24H28V1z" }),
				/* @__PURE__ */ jsx("path", { d: "M49 1h5.8l9.2 14.5V1h6v23h-5.5L55 9.5V24h-6V1z" }),
				/* @__PURE__ */ jsx("path", { d: "M84 4c-1.8-2-4.5-3-7.5-3-5 0-8.5 3-8.5 7.2 0 5 4.5 6.5 9 7.8 4 1.2 5.5 2 5.5 4 0 2-2 3.2-4.5 3.2-3.2 0-5.5-1.5-6.8-3.5L76 23.5c1.8 2.2 4.5 3.5 8 3.5 6 0 9.8-3.2 9.8-7.8 0-5-4.2-6.5-9-7.8-3.8-1-5.5-2-5.5-3.8 0-1.8 1.8-3 4.2-3 2.5 0 4.8 1 6.2 2.5L84 4z" }),
				/* @__PURE__ */ jsx("path", { d: "M106 1c-6.8 0-12 5-12 11.5s5.2 11.5 12 11.5 12-5 12-11.5S112.8 1 106 1zm0 5.5c3.5 0 6 3 6 6s-2.5 6-6 6-6-3-6-6 2.5-6 6-6z" })
			]
		})
	});
}
function SiemensVDOLogo({ className = "h-8 w-auto", ...props }) {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 180 40",
		fill: "currentColor",
		className,
		"aria-label": "Siemens VDO",
		role: "img",
		...props,
		children: /* @__PURE__ */ jsxs("g", {
			transform: "translate(4, 10)",
			children: [
				/* @__PURE__ */ jsxs("g", {
					transform: "scale(0.85)",
					children: [
						/* @__PURE__ */ jsx("path", { d: "M12 4.5c-1.5-1-3.2-1.5-5-1.5-3 0-4.8 1.4-4.8 3.5 0 4 10 2.2 10 7.8 0 3-2.5 4.7-6.2 4.7-2.6 0-5-.9-6.8-2.5l2-3c1.3 1.2 3 1.8 4.8 1.8 2.2 0 3.8-1 3.8-2.5 0-4-10-2.2-10-7.8 0-3.2 2.6-4.8 6.5-4.8 2.4 0 4.5.7 6 1.8l-1.3 2.5z" }),
						/* @__PURE__ */ jsx("path", { d: "M15 1h3.5v18H15V1z" }),
						/* @__PURE__ */ jsx("path", { d: "M22 1h11v3.5h-7.5v3.8h6.5v3.2h-6.5v4H33V19H22V1z" }),
						/* @__PURE__ */ jsx("path", { d: "M36 1h4.2l4.8 11.2L49.8 1H54v18h-3.4V7.5L46.2 17h-2.4L39.4 7.5V19H36V1z" }),
						/* @__PURE__ */ jsx("path", { d: "M57 1h11v3.5h-7.5v3.8h6.5v3.2h-6.5v4H68V19H57V1z" }),
						/* @__PURE__ */ jsx("path", { d: "M71 1h3.5l7 10.8V1H85v18h-3.5L74.5 8.2V19H71V1z" }),
						/* @__PURE__ */ jsx("path", { d: "M97 4.5c-1.5-1-3.2-1.5-5-1.5-3 0-4.8 1.4-4.8 3.5 0 4 10 2.2 10 7.8 0 3-2.5 4.7-6.2 4.7-2.6 0-5-.9-6.8-2.5l2-3c1.3 1.2 3 1.8 4.8 1.8 2.2 0 3.8-1 3.8-2.5 0-4-10-2.2-10-7.8 0-3.2 2.6-4.8 6.5-4.8 2.4 0 4.5.7 6 1.8l-1.3 2.5z" })
					]
				}),
				/* @__PURE__ */ jsx("rect", {
					x: "92",
					y: "0",
					width: "2",
					height: "20",
					opacity: "0.3",
					fill: "currentColor"
				}),
				/* @__PURE__ */ jsxs("g", {
					transform: "translate(100, 0)",
					children: [
						/* @__PURE__ */ jsx("path", { d: "M2 0h6l5.5 15.5L19 0h6L16.5 20h-6L2 0z" }),
						/* @__PURE__ */ jsx("path", { d: "M27 0h9c5.5 0 9.5 4 9.5 10s-4 10-9.5 10h-9V0zm5.5 5v10h3.5c2.8 0 4.5-2 4.5-5s-1.7-5-4.5-5h-3.5z" }),
						/* @__PURE__ */ jsx("path", { d: "M58 0c6 0 10 4.2 10 10s-4 10-10 10-10-4.2-10-10 4-10 10-10zm0 5c-2.8 0-4.5 2-4.5 5s1.7 5 4.5 5 4.5-2 4.5-5-1.7-5-4.5-5z" })
					]
				})
			]
		})
	});
}
function DelphiLogo({ className = "h-8 w-auto", ...props }) {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 150 40",
		fill: "currentColor",
		className,
		"aria-label": "Delphi",
		role: "img",
		...props,
		children: /* @__PURE__ */ jsxs("g", {
			transform: "translate(10, 6)",
			children: [/* @__PURE__ */ jsx("ellipse", {
				cx: "65",
				cy: "2",
				rx: "42",
				ry: "2",
				opacity: "0.4",
				fill: "currentColor"
			}), /* @__PURE__ */ jsxs("g", {
				transform: "translate(0, 4)",
				children: [
					/* @__PURE__ */ jsx("path", { d: "M4 1h11c7 0 12 4.5 12 11s-5 11-12 11H4V1zm6 5.5v11h5c3.8 0 6-2.2 6-5.5s-2.2-5.5-6-5.5H10z" }),
					/* @__PURE__ */ jsx("path", { d: "M31 1h16v5.5H37v3h8v5h-8v4h9V23H31V1z" }),
					/* @__PURE__ */ jsx("path", { d: "M51 1h6v16.5h10V23H51V1z" }),
					/* @__PURE__ */ jsx("path", { d: "M71 1h11c5 0 8.5 3 8.5 7.5S87 16 82 16h-5v7h-6V1zm6 5v5h5c1.8 0 2.8-.8 2.8-2.5s-1-2.5-2.8-2.5H77z" }),
					/* @__PURE__ */ jsx("path", { d: "M94 1h6v8h8V1h6v22h-6v-8.5h-8V23h-6V1z" }),
					/* @__PURE__ */ jsx("path", { d: "M118 1h6v22h-6V1z" })
				]
			})]
		})
	});
}
function CaterpillarLogo({ className = "h-8 w-auto", ...props }) {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 130 40",
		fill: "currentColor",
		className,
		"aria-label": "Caterpillar (CAT)",
		role: "img",
		...props,
		children: /* @__PURE__ */ jsxs("g", {
			transform: "translate(6, 4)",
			children: [
				/* @__PURE__ */ jsx("path", { d: "M28 6c-2.5-2.2-6-3.5-10-3.5-8 0-14 5.5-14 13.5s6 13.5 14 13.5c4 0 7.5-1.3 10-3.5l-3.5-5.5c-1.8 1.5-4 2.5-6.5 2.5-4.5 0-7.8-3.2-7.8-7s3.3-7 7.8-7c2.5 0 4.7 1 6.5 2.5L28 6z" }),
				/* @__PURE__ */ jsx("path", { d: "M47 2.5L34 29.5h6.5l2.6-5.8h11.2l2.6 5.8h6.5L50.4 2.5H47zm-1.8 16.5l3.5-8 3.5 8h-7z" }),
				/* @__PURE__ */ jsx("path", { d: "M64 2.5v6.5h8v20.5h6.5V9h8V2.5H64z" }),
				/* @__PURE__ */ jsx("polygon", {
					points: "41.5,29.5 55.5,29.5 48.5,18",
					fill: "currentColor"
				}),
				/* @__PURE__ */ jsx("text", {
					x: "3",
					y: "34",
					fontFamily: "system-ui, -apple-system, sans-serif",
					fontSize: "4.2",
					fontWeight: "900",
					letterSpacing: "1.5",
					fill: "currentColor",
					children: "CATERPILLAR"
				})
			]
		})
	});
}
function CumminsLogo({ className = "h-8 w-auto", ...props }) {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 150 40",
		fill: "currentColor",
		className,
		"aria-label": "Cummins",
		role: "img",
		...props,
		children: /* @__PURE__ */ jsxs("g", {
			transform: "translate(6, 6)",
			children: [
				/* @__PURE__ */ jsx("path", { d: "M4 1h26v8.5H14.5v9H30V27H4V1z" }),
				/* @__PURE__ */ jsx("polygon", {
					points: "14.5,9.5 22,9.5 18,18.5 14.5,18.5",
					fill: "currentColor"
				}),
				/* @__PURE__ */ jsxs("g", {
					transform: "translate(36, 1)",
					children: [
						/* @__PURE__ */ jsx("path", { d: "M14 4c-1.5-1.5-3.5-2.2-6-2.2-4.5 0-8 3.5-8 8.5s3.5 8.5 8 8.5c2.5 0 4.5-.7 6-2.2l-2-2.8c-1 .8-2.3 1.3-4 1.3-2.6 0-4.5-1.8-4.5-4.8s1.9-4.8 4.5-4.8c1.7 0 3 .5 4 1.3L14 4z" }),
						/* @__PURE__ */ jsx("path", { d: "M18 6.5h3.6v7.5c0 1.8.8 2.8 2.4 2.8 1.6 0 2.4-1 2.4-2.8V6.5H30v12.2h-3.4v-1.8c-.8 1.3-2.2 2-3.8 2-3 0-4.8-1.8-4.8-5V6.5z" }),
						/* @__PURE__ */ jsx("path", { d: "M33 6.5h3.4v1.8c.8-1.3 2-2 3.6-2 1.8 0 3 .8 3.6 2.2.8-1.4 2.2-2.2 3.8-2.2 2.6 0 4.2 1.6 4.2 4.6v7.8h-3.5v-7c0-1.4-.6-2-1.8-2-1.2 0-2 .8-2 2.2v6.8H41v-7c0-1.4-.6-2-1.8-2-1.2 0-2 .8-2 2.2v6.8H33V6.5z" }),
						/* @__PURE__ */ jsx("path", { d: "M54 6.5h3.4v1.8c.8-1.3 2-2 3.6-2 1.8 0 3 .8 3.6 2.2.8-1.4 2.2-2.2 3.8-2.2 2.6 0 4.2 1.6 4.2 4.6v7.8h-3.5v-7c0-1.4-.6-2-1.8-2-1.2 0-2 .8-2 2.2v6.8H62v-7c0-1.4-.6-2-1.8-2-1.2 0-2 .8-2 2.2v6.8H54V6.5z" }),
						/* @__PURE__ */ jsx("circle", {
							cx: "75",
							cy: "3",
							r: "1.8"
						}),
						/* @__PURE__ */ jsx("rect", {
							x: "73.2",
							y: "6.5",
							width: "3.6",
							height: "12.2"
						}),
						/* @__PURE__ */ jsx("path", { d: "M80 6.5h3.4v1.8c.8-1.3 2.2-2 4-2 2.8 0 4.4 1.8 4.4 5v7.4h-3.6v-7c0-1.6-.7-2.3-2.2-2.3-1.4 0-2.4 1-2.4 2.6v6.7H80V6.5z" }),
						/* @__PURE__ */ jsx("path", { d: "M99 9c-1-.8-2-1.2-3.2-1.2-1.6 0-2.6.8-2.6 2 0 2.5 6 1.3 6 5 0 2.2-1.8 3.8-4.5 3.8-1.8 0-3.5-.7-4.6-2l1.8-2c.8.8 1.8 1.4 2.8 1.4 1.2 0 1.8-.6 1.8-1.4 0-2.4-6-1.2-6-4.8 0-2.2 1.8-3.6 4.4-3.6 1.5 0 3 .5 4 1.4L99 9z" })
					]
				})
			]
		})
	});
}
function StanadyneLogo({ className = "h-8 w-auto", ...props }) {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 160 40",
		fill: "currentColor",
		className,
		"aria-label": "Stanadyne",
		role: "img",
		...props,
		children: /* @__PURE__ */ jsxs("g", {
			transform: "translate(6, 6)",
			children: [/* @__PURE__ */ jsxs("g", {
				transform: "translate(2, 2)",
				children: [/* @__PURE__ */ jsx("polygon", {
					points: "12,0 24,12 12,24 0,12",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2.5"
				}), /* @__PURE__ */ jsx("polygon", {
					points: "12,5 19,12 12,19 5,12",
					fill: "currentColor"
				})]
			}), /* @__PURE__ */ jsxs("g", {
				transform: "translate(36, 4)",
				children: [
					/* @__PURE__ */ jsx("path", { d: "M9 3c-1-.7-2.3-1.2-3.8-1.2-2.2 0-3.6 1-3.6 2.5 0 3.2 7.8 1.6 7.8 6 0 2.2-1.8 3.5-4.6 3.5-2 0-3.8-.6-5-1.8l1.3-2.2c1 .9 2.2 1.4 3.6 1.4 1.6 0 2.6-.7 2.6-1.7 0-3.2-7.8-1.6-7.8-6 0-2.3 1.9-3.7 4.8-3.7 1.8 0 3.4.5 4.6 1.4L9 3z" }),
					/* @__PURE__ */ jsx("path", { d: "M12 1.5h8v2.6h-2.6v11H14.7v-11H12V1.5z" }),
					/* @__PURE__ */ jsx("path", { d: "M25 1.5L20 15.1h2.7l1.2-3.2h5.5l1.2 3.2h2.7l-5-13.6h-3.3zm-.2 8l2-5.4 2 5.4h-4z" }),
					/* @__PURE__ */ jsx("path", { d: "M35 1.5h2.6l5.5 8.5V1.5h2.6v13.6h-2.5l-5.6-8.6v8.6H35V1.5z" }),
					/* @__PURE__ */ jsx("path", { d: "M51 1.5L46 15.1h2.7l1.2-3.2h5.5l1.2 3.2h2.7l-5-13.6h-3.3zm-.2 8l2-5.4 2 5.4h-4z" }),
					/* @__PURE__ */ jsx("path", { d: "M61 1.5h5.8c4 0 6.8 2.6 6.8 6.8s-2.8 6.8-6.8 6.8H61V1.5zm2.7 2.6v8.4h3c2.4 0 4-1.5 4-4.2s-1.6-4.2-4-4.2h-3z" }),
					/* @__PURE__ */ jsx("path", { d: "M75 1.5h2.8l3.2 5.4 3.2-5.4H87l-4.7 7.5v6.1h-2.7V9L75 1.5z" }),
					/* @__PURE__ */ jsx("path", { d: "M89 1.5h2.6l5.5 8.5V1.5h2.6v13.6h-2.5l-5.6-8.6v8.6H89V1.5z" }),
					/* @__PURE__ */ jsx("path", { d: "M102 1.5h8.8v2.5h-6.1v2.8h5.2v2.4h-5.2v3.4h6.3v2.5h-9V1.5z" })
				]
			})]
		})
	});
}
function DieselKikiLogo({ className = "h-8 w-auto", ...props }) {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 160 40",
		fill: "currentColor",
		className,
		"aria-label": "Diesel Kiki",
		role: "img",
		...props,
		children: /* @__PURE__ */ jsxs("g", {
			transform: "translate(6, 7)",
			children: [/* @__PURE__ */ jsxs("g", {
				transform: "translate(0, 3)",
				children: [
					/* @__PURE__ */ jsx("circle", {
						cx: "10",
						cy: "10",
						r: "9",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "2"
					}),
					/* @__PURE__ */ jsx("path", {
						d: "M10 4v4l3 2",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "1.8",
						strokeLinecap: "round"
					}),
					/* @__PURE__ */ jsx("circle", {
						cx: "10",
						cy: "10",
						r: "2",
						fill: "currentColor"
					})
				]
			}), /* @__PURE__ */ jsxs("g", {
				transform: "translate(26, 0)",
				children: [/* @__PURE__ */ jsx("text", {
					x: "0",
					y: "11",
					fontFamily: "system-ui, -apple-system, sans-serif",
					fontSize: "11.5",
					fontWeight: "900",
					letterSpacing: "1.2",
					fill: "currentColor",
					children: "DIESEL"
				}), /* @__PURE__ */ jsx("text", {
					x: "0",
					y: "24",
					fontFamily: "system-ui, -apple-system, sans-serif",
					fontSize: "11.5",
					fontWeight: "900",
					letterSpacing: "3.5",
					fill: "currentColor",
					children: "KIKI"
				})]
			})]
		})
	});
}
function PerkinsLogo({ className = "h-8 w-auto", ...props }) {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 150 40",
		fill: "currentColor",
		className,
		"aria-label": "Perkins",
		role: "img",
		...props,
		children: /* @__PURE__ */ jsxs("g", {
			transform: "translate(6, 6)",
			children: [/* @__PURE__ */ jsxs("g", {
				transform: "translate(2, 4)",
				children: [
					/* @__PURE__ */ jsx("polygon", {
						points: "0,18 9,0 18,18",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "2"
					}),
					/* @__PURE__ */ jsx("polygon", {
						points: "9,0 18,18 27,0",
						fill: "currentColor",
						opacity: "0.8"
					}),
					/* @__PURE__ */ jsx("polygon", {
						points: "18,18 27,0 36,18",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "2"
					})
				]
			}), /* @__PURE__ */ jsxs("g", {
				transform: "translate(44, 4)",
				children: [
					/* @__PURE__ */ jsx("path", { d: "M4 1h8c4.2 0 7 2.6 7 6.5s-2.8 6.5-7 6.5H8v6H4V1zm4 4v5h4c1.8 0 3-.8 3-2.5S13.8 5 12 5H8z" }),
					/* @__PURE__ */ jsx("path", { d: "M21 11.5c0-4.8 3.5-8 8-8s7.8 3.5 7.8 8.2v1.2H25c.3 2.5 2 3.8 4.5 3.8 1.8 0 3.2-.8 4-2l3 1.8c-1.5 2.2-3.8 3.4-7 3.4-5 0-8.5-3.6-8.5-8.4zm11.8-1.5c-.3-2.2-1.8-3.5-3.8-3.5s-3.5 1.3-3.8 3.5h7.6z" }),
					/* @__PURE__ */ jsx("path", { d: "M40 7h4v2.5c.8-1.8 2.5-2.8 4.5-2.8.8 0 1.5.2 2 .5v4.2c-.8-.4-1.8-.5-2.6-.5-2.4 0-3.9 1.6-3.9 4.2V20H40V7z" }),
					/* @__PURE__ */ jsx("path", { d: "M53 1h4v8.5l5.5-6h5.2l-6.5 6.8 7 9.7h-5.2l-4.8-6.8-1.2 1.3V20h-4V1z" }),
					/* @__PURE__ */ jsx("circle", {
						cx: "73",
						cy: "2.5",
						r: "2"
					}),
					/* @__PURE__ */ jsx("rect", {
						x: "71",
						y: "7",
						width: "4",
						height: "13"
					}),
					/* @__PURE__ */ jsx("path", { d: "M78 7h4v2.2c1-1.5 2.6-2.5 4.8-2.5 3.5 0 5.2 2.2 5.2 6V20h-4v-6.8c0-2-.8-3-2.6-3s-3.4 1.2-3.4 3.2V20h-4V7z" }),
					/* @__PURE__ */ jsx("path", { d: "M96 17c1.2 1 2.6 1.5 4 1.5 1.6 0 2.5-.7 2.5-1.8 0-3-8-1.5-8-6.2 0-2.8 2.4-4.5 5.5-4.5 2 0 3.8.7 5.2 1.8l-2 2.5c-1-.8-2.2-1.3-3.2-1.3-1.4 0-2.2.6-2.2 1.5 0 2.8 8 1.4 8 6.2 0 3-2.5 4.8-6 4.8-2.2 0-4.4-.8-5.8-2.2l2-2.3z" })
				]
			})]
		})
	});
}
/**
* Nómina inmutable de las 10 marcas oficiales autorizadas por el taller (RF-03.2)
*/
var WORKSHOP_BRANDS = [
	{
		id: "bosch",
		name: "Bosch",
		subtitle: "Diesel Service",
		Component: BoschLogo
	},
	{
		id: "zexel",
		name: "Zexel",
		Component: ZexelLogo
	},
	{
		id: "denso",
		name: "Denso",
		Component: DensoLogo
	},
	{
		id: "siemens-vdo",
		name: "Siemens VDO",
		Component: SiemensVDOLogo
	},
	{
		id: "delphi",
		name: "Delphi",
		Component: DelphiLogo
	},
	{
		id: "caterpillar",
		name: "Caterpillar",
		subtitle: "CAT",
		Component: CaterpillarLogo
	},
	{
		id: "cummins",
		name: "Cummins",
		Component: CumminsLogo
	},
	{
		id: "stanadyne",
		name: "Stanadyne",
		Component: StanadyneLogo
	},
	{
		id: "diesel-kiki",
		name: "Diesel Kiki",
		Component: DieselKikiLogo
	},
	{
		id: "perkins",
		name: "Perkins",
		Component: PerkinsLogo
	}
];
//#endregion
//#region src/components/landing/BrandsMarquee.tsx
/**
* Carrusel Continuo de Marcas Homologadas (Brands Marquee).
* (Spec 010, RF-01, Módulo A, RNF-04, WCAG 2.2.2)
*
* Características canónicas:
* 1. Botón Accesible Toggle WCAG 2.2.2:
*    - Posicionado al inicio como sr-only, visible al foco de teclado (:focus-visible).
*    - Alterna entre "Pausar animación" (aria-pressed="false") y "Reanudar animación" (aria-pressed="true").
*    - Memoria de pausa estricta: prevalece sobre visibilitychange (no se reanuda al volver de pestaña si el usuario pausó).
*    - Si prefers-reduced-motion está activo, el botón NO se renderiza en el DOM para evitar redundancia de accesibilidad.
* 2. Clonación dinámica: calcula programáticamente clones para superar min-width: 200vw
*    (incluso en resoluciones 4K y Ultrawide) independientemente de si hay 3 o 30 marcas.
* 3. Recálculo en resize con debounce de 250ms para adaptación continua.
* 4. Traslación CSS pura continua de 0 a -50% en 35 segundos de derecha a izquierda.
* 5. Siluetas monocromáticas accesibles: brightness-0 invert opacity-70 (opacity-100 en hover),
*    con tamaño máximo de 40x120px y separación horizontal uniforme de 48px (gap-12).
* 6. Desmontaje condicional completo (retorna null) si el listado de marcas es vacío.
* 7. Máscara difuminada lateral (mask-image) para entrada y salida suave de logotipos.
* 8. Suspensión automática al hover, al toque en pantallas táctiles y por Page Visibility API.
*/
var ITEM_ESTIMATED_WIDTH_PX = 168;
function BrandsMarquee({ className = "", brands = WORKSHOP_BRANDS }) {
	const [viewportWidth, setViewportWidth] = useState(() => {
		return typeof window !== "undefined" ? window.innerWidth : 1920;
	});
	const [isManualPaused, setIsManualPaused] = useState(false);
	const [isTouchPaused, setIsTouchPaused] = useState(false);
	const [isTabVisible, setIsTabVisible] = useState(true);
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
		if (typeof window === "undefined") return false;
		return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	});
	if (!brands || brands.length === 0) return null;
	useEffect(() => {
		if (typeof window === "undefined") return;
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		const handleChange = (e) => {
			setPrefersReducedMotion(e.matches);
		};
		mediaQuery.addEventListener("change", handleChange);
		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, []);
	useEffect(() => {
		let timeoutId = null;
		const handleResize = () => {
			if (timeoutId) clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				setViewportWidth(window.innerWidth);
			}, 250);
		};
		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, []);
	useEffect(() => {
		const handleVisibilityChange = () => {
			setIsTabVisible(document.visibilityState === "visible" && !document.hidden);
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, []);
	const marqueeItems = useMemo(() => {
		const targetHalfWidth = viewportWidth;
		const oneSetWidth = brands.length * ITEM_ESTIMATED_WIDTH_PX;
		const repetitionsPerHalf = Math.max(1, Math.ceil(targetHalfWidth / oneSetWidth));
		const halfItems = [];
		for (let i = 0; i < repetitionsPerHalf; i++) for (const brand of brands) halfItems.push({
			brand,
			cloneIndex: i
		});
		return [...halfItems, ...halfItems];
	}, [brands, viewportWidth]);
	const toggleManualPause = useCallback(() => {
		setIsManualPaused((prev) => !prev);
	}, []);
	const touchTimerRef = useRef(null);
	const resumeTimerRef = useRef(null);
	useEffect(() => {
		return () => {
			if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
			if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
		};
	}, []);
	const handleTouchStart = useCallback(() => {
		if (resumeTimerRef.current) {
			clearTimeout(resumeTimerRef.current);
			resumeTimerRef.current = null;
		}
		touchTimerRef.current = setTimeout(() => {
			setIsTouchPaused(true);
		}, 250);
	}, []);
	const handleTouchEnd = useCallback(() => {
		if (touchTimerRef.current) {
			clearTimeout(touchTimerRef.current);
			touchTimerRef.current = null;
		}
		resumeTimerRef.current = setTimeout(() => {
			setIsTouchPaused(false);
		}, 1500);
	}, []);
	const isEffectivePaused = isManualPaused || isTouchPaused || !isTabVisible;
	return /* @__PURE__ */ jsxs("section", {
		"aria-label": "Marcas y sistemas de inyección atendidos",
		className: cn("relative overflow-hidden py-24 md:py-32 bg-zinc-950 border-y border-white/10", className),
		children: [
			!prefersReducedMotion && /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: toggleManualPause,
				"aria-pressed": isManualPaused,
				className: cn("sr-only focus-visible:not-sr-only", "focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-30", "focus-visible:inline-flex focus-visible:items-center focus-visible:gap-2", "focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-none", "focus-visible:bg-white focus-visible:text-black focus-visible:font-mono focus-visible:text-xs focus-visible:font-semibold focus-visible:uppercase focus-visible:tracking-widest", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-industrial focus-visible:ring-offset-2 focus-visible:ring-offset-black", "transition-all duration-150 cursor-pointer shadow-lg"),
				children: isManualPaused ? "Reanudar animación" : "Pausar animación"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "site-container mb-12 text-center",
				children: [/* @__PURE__ */ jsx("p", {
					className: "font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500",
					children: "Especialización Técnica Multimarca"
				}), /* @__PURE__ */ jsx("h2", {
					className: "mt-3 font-display text-2xl md:text-3xl font-light tracking-tight text-zinc-300",
					children: "Marcas y Sistemas de Inyección que Atendemos"
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "relative w-full overflow-hidden touch-pan-y [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] [touch-action:pan-y]",
				onTouchStart: handleTouchStart,
				onTouchEnd: handleTouchEnd,
				onTouchCancel: handleTouchEnd,
				"data-testid": "brands-marquee-container",
				children: /* @__PURE__ */ jsx("div", {
					className: "flex w-max items-center gap-12 py-4 group hover:[animation-play-state:paused] animate-marquee motion-reduce:[animation:none]",
					style: isEffectivePaused ? { animationPlayState: "paused" } : void 0,
					"data-paused": isEffectivePaused ? "true" : "false",
					"data-testid": "brands-marquee-track",
					children: marqueeItems.map(({ brand, cloneIndex }, idx) => {
						const BrandLogoComponent = brand.Component;
						const subtitle = "subtitle" in brand ? brand.subtitle : void 0;
						return /* @__PURE__ */ jsx("div", {
							"aria-hidden": "true",
							tabIndex: -1,
							className: "flex h-10 max-h-10 w-[120px] max-w-[120px] items-center justify-center shrink-0 cursor-default select-none transition-all duration-300 ease-out",
							title: subtitle ? `${brand.name} (${subtitle})` : brand.name,
							"data-testid": `brand-item-${brand.id}`,
							children: BrandLogoComponent ? /* @__PURE__ */ jsx(BrandLogoComponent, {
								className: "h-auto max-h-10 w-auto max-w-[120px] object-contain brightness-0 invert opacity-70 hover:opacity-100 transition-opacity duration-200",
								"aria-hidden": "true"
							}) : /* @__PURE__ */ jsx("span", {
								className: "font-mono text-xs uppercase tracking-widest text-zinc-400 brightness-0 invert opacity-70 hover:opacity-100 transition-opacity duration-200",
								children: brand.name
							})
						}, `${brand.id}-${cloneIndex}-${idx}`);
					})
				})
			})
		]
	});
}
//#endregion
//#region src/services/landing.service.ts
/**
* Servicio de Consumo HTTP para la Landing Page (Fase 6, Bloque 7, Tarea 7.1).
* (RF-07, RNF-03, RNF-05, CL-02)
*
* Encapsula la consulta pública a los productos destacados con tipado estricto
* y captura de excepciones silenciosa (retornando [] ante errores de red o HTTP 500).
*/
/**
* Consulta la lista de productos destacados activos desde GET /api/products/featured.
* Si la petición falla por error de servidor (500), timeout o caída de red,
* captura silenciosamente la excepción y retorna un array vacío [] (RF-07, CA-07.2, CL-02).
*/
async function fetchFeaturedProducts() {
	try {
		const products = await api.get("/api/products/featured");
		if (!Array.isArray(products)) return [];
		return products;
	} catch {
		return [];
	}
}
//#endregion
//#region src/components/landing/FeaturedProductsCarousel.tsx
/**
* Carrusel dinámico de productos destacados para la Landing Page (Fase 6 - Bloque 7, Tarea 7.2).
* (RF-06, RF-07, RNF-03, RNF-05, CL-01, CL-02)
*
* Características:
* - Hidratación dinámica desde GET /api/products/featured con degradación silenciosa.
* - Prevención de CLS mediante contenedor de reserva de altura mínima (min-h-[460px]).
* - Desmontaje automático y limpio (retorna null) si hay 0 destacados o fallo de API.
* - Envoltura semántica de tarjeta en Link directo a /catalogo/$productId.
* - Animación de bucle continuo infinito con framer-motion.
*/
function FeaturedProductsCarousel({ products: propProducts, className = "" }) {
	const [loadedProducts, setLoadedProducts] = useState(propProducts ?? null);
	const [isLoading, setIsLoading] = useState(propProducts === void 0);
	useEffect(() => {
		if (propProducts !== void 0) {
			setLoadedProducts(propProducts);
			setIsLoading(false);
			return;
		}
		let isMounted = true;
		setIsLoading(true);
		fetchFeaturedProducts().then((items) => {
			if (isMounted) {
				setLoadedProducts(items);
				setIsLoading(false);
			}
		}).catch(() => {
			if (isMounted) {
				setLoadedProducts([]);
				setIsLoading(false);
			}
		});
		return () => {
			isMounted = false;
		};
	}, [propProducts]);
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		"data-testid": "featured-carousel-skeleton",
		className: `min-h-[460px] w-full bg-background dark:bg-slate-950 py-20 border-y border-border/60 ${className}`,
		"aria-hidden": "true"
	});
	const activeProducts = loadedProducts ?? [];
	if (activeProducts.length === 0) return null;
	const marqueeProducts = [...activeProducts, ...activeProducts];
	return /* @__PURE__ */ jsx("section", {
		id: "destacados",
		"data-testid": "featured-products-section",
		className: `scroll-mt-20 bg-zinc-950 py-24 md:py-32 border-b border-white/10 overflow-hidden min-h-[460px] ${className}`,
		"aria-labelledby": "destacados-heading",
		children: /* @__PURE__ */ jsxs("div", {
			className: "site-container",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-16",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "max-w-2xl",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600 block mb-3",
								children: "Catálogo Seleccionado"
							}),
							/* @__PURE__ */ jsx("h2", {
								id: "destacados-heading",
								className: "text-3xl md:text-5xl font-light tracking-tight text-white uppercase leading-tight",
								children: "Inyectores y Bombas en Stock"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-4 text-base font-light text-zinc-400",
								children: "Piezas calibradas y verificadas bajo estándares OEM listas para instalación inmediata."
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "hidden sm:inline-flex items-center gap-2 border border-white/10 bg-zinc-950 px-3.5 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-400",
						children: [/* @__PURE__ */ jsx("span", { className: "size-1.5 bg-emerald-400 animate-pulse" }), /* @__PURE__ */ jsx("span", { children: "Actualización en tiempo real" })]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "relative w-full overflow-hidden py-4",
					children: [
						/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute left-0 top-0 z-20 h-full w-12 sm:w-24 bg-gradient-to-r from-zinc-950 to-transparent" }),
						/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute right-0 top-0 z-20 h-full w-12 sm:w-24 bg-gradient-to-l from-zinc-950 to-transparent" }),
						/* @__PURE__ */ jsx(motion.div, {
							className: "flex gap-8 w-max",
							animate: { x: ["0%", "-50%"] },
							transition: {
								repeat: Infinity,
								duration: 32,
								ease: "linear"
							},
							children: marqueeProducts.map((product, index) => {
								return /* @__PURE__ */ jsx("article", {
									className: "group relative flex w-[290px] shrink-0 flex-col overflow-hidden border border-white/10 bg-zinc-950 transition-all duration-300 hover:border-white/30 sm:w-[320px] md:w-[340px] cursor-pointer",
									children: /* @__PURE__ */ jsxs(Link, {
										to: "/catalogo/$productId",
										params: { productId: product.id },
										className: "flex flex-col h-full focus:outline-none",
										"aria-label": `Ver ${product.name} en el catálogo oficial`,
										children: [/* @__PURE__ */ jsxs("div", {
											className: "relative aspect-[16/10] w-full overflow-hidden border-b border-white/10 bg-black",
											children: [
												/* @__PURE__ */ jsx(ProductImageWithFallback, {
													src: product.imageUrl ?? null,
													alt: product.name,
													className: "size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
												}),
												product.brandName && /* @__PURE__ */ jsx("span", {
													className: "absolute left-3 top-3 border border-white/10 bg-zinc-950/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white",
													children: product.brandName
												}),
												/* @__PURE__ */ jsx("span", {
													className: "absolute right-3 top-3 border border-white/10 bg-zinc-950/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-400",
													children: product.condition
												})
											]
										}), /* @__PURE__ */ jsxs("div", {
											className: "flex flex-1 flex-col p-6",
											children: [
												/* @__PURE__ */ jsxs("span", {
													className: "mb-3 font-mono text-xs uppercase tracking-widest text-zinc-500",
													children: ["OEM ", product.oem]
												}),
												/* @__PURE__ */ jsx("h3", {
													className: "font-light text-base md:text-lg leading-snug text-white transition-colors group-hover:text-zinc-300 line-clamp-2",
													title: product.name,
													children: product.name
												}),
												product.vehicleCompatibility && /* @__PURE__ */ jsx("p", {
													className: "mt-2 line-clamp-2 text-xs font-light text-zinc-400",
													children: product.vehicleCompatibility
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "mt-auto pt-6 flex items-center justify-between border-t border-white/10",
													children: [/* @__PURE__ */ jsx("div", { children: product.showPrice && product.price !== null ? /* @__PURE__ */ jsx("p", {
														className: "font-light text-xl text-white",
														children: formatPrice(product.price)
													}) : /* @__PURE__ */ jsx("span", {
														className: "font-mono text-xs uppercase tracking-widest text-zinc-500",
														children: "Consultar precio"
													}) }), /* @__PURE__ */ jsxs("span", {
														className: "inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-zinc-400 transition-colors group-hover:text-white",
														children: ["Ficha", /* @__PURE__ */ jsx(ArrowRight, { className: "size-3" })]
													})]
												})
											]
										})]
									})
								}, `${product.id}-${index}`);
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-20 flex flex-col items-center justify-center text-center",
					children: [/* @__PURE__ */ jsx(CatalogCTAButton, {
						to: "/catalogo",
						label: "Ver Catálogo Completo",
						size: "lg",
						className: "shadow-xl"
					}), /* @__PURE__ */ jsxs("p", {
						className: "mt-4 font-mono text-xs text-zinc-500 flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(Check, { className: "size-3.5 text-zinc-400" }), /* @__PURE__ */ jsx("span", { children: "Más de 500 referencias en inyectores, toberas y bombas con garantía" })]
					})]
				})
			]
		})
	});
}
//#endregion
//#region src/components/landing/FloatingWhatsApp.tsx
function FloatingWhatsApp({ className = "", targetSectionIds = ["garantias", "ubicacion"] }) {
	const [isOverlapping, setIsOverlapping] = useState(false);
	const { shouldShowBanner } = usePoliciesConsent();
	const generalUrl = buildWhatsAppUrl(SITE_CONFIG.phone, SITE_CONFIG.whatsappMessages.general);
	useEffect(() => {
		if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
		const intersectingMap = /* @__PURE__ */ new Map();
		const observer = new IntersectionObserver((entries) => {
			const isMobile = window.innerWidth < 768;
			entries.forEach((entry) => {
				intersectingMap.set(entry.target.id, entry.isIntersecting);
			});
			const anyIntersecting = Array.from(intersectingMap.values()).some(Boolean);
			setIsOverlapping(isMobile && anyIntersecting);
		}, { threshold: .15 });
		targetSectionIds.forEach((id) => {
			const element = document.getElementById(id);
			if (element) observer.observe(element);
		});
		const handleResize = () => {
			if (window.innerWidth >= 768) setIsOverlapping(false);
		};
		window.addEventListener("resize", handleResize);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", handleResize);
		};
	}, [targetSectionIds]);
	return /* @__PURE__ */ jsx("aside", {
		"aria-label": "Acceso directo a WhatsApp",
		className: `fixed ${shouldShowBanner ? "bottom-36 sm:bottom-6" : "bottom-6"} right-6 z-30 transition-all duration-300 ${isOverlapping ? "pointer-events-none translate-y-6 opacity-0" : "translate-y-0 opacity-100"} ${className}`,
		children: /* @__PURE__ */ jsxs("div", {
			className: "relative flex items-center justify-center",
			children: [/* @__PURE__ */ jsx("div", {
				className: "absolute inset-0 rounded-full bg-[#25D366] animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-60",
				"aria-hidden": "true"
			}), /* @__PURE__ */ jsxs("a", {
				href: generalUrl,
				target: "_blank",
				rel: "noopener noreferrer",
				"aria-label": "Contactar por WhatsApp para consulta general o turnos",
				className: "relative z-10 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-emerald-950/25 transition-transform hover:scale-110 hover:bg-[#20BA5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-95",
				children: [/* @__PURE__ */ jsx(FaWhatsapp, { className: "size-7" }), /* @__PURE__ */ jsx("span", {
					className: "sr-only",
					children: "Contactar por WhatsApp"
				})]
			})]
		})
	});
}
//#endregion
//#region src/components/landing/HeroSection.tsx
/**
* Sección Principal (Hero) — Inmersión Edge-to-Edge Industrial con Contraste Localizado.
* (Spec 010, RF-03, Módulo C, RF-04, RNF-01, RNF-02)
*
* Jerarquía visual y cinemática:
* 1. Título principal: "LABORATORIO DIÉSEL" con animación fade-in slide-up en 0.8s (Y: 20px a 0).
* 2. Subtítulo: "Especialistas en inyección diésel" con mecanografía técnica a 50ms/char tras 800ms de retardo,
*    con cursor parpadeante permanente en barra vertical (|) coloreado en Naranja Técnico (#ea580c).
* 3. Acciones primarias integrando CatalogCTAButton con micro-interacción shimmer y compresión física activa.
* 4. Erradicación absoluta de tonos azules residuales.
*/
var FULL_SUBTITLE = "Especialistas en inyección diésel";
function HeroSection({ className = "" }) {
	const [displayedSubtitle, setDisplayedSubtitle] = useState("");
	useEffect(() => {
		if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setDisplayedSubtitle(FULL_SUBTITLE);
			return;
		}
		const delayTimer = setTimeout(() => {
			let currentIndex = 0;
			const interval = setInterval(() => {
				currentIndex++;
				setDisplayedSubtitle(FULL_SUBTITLE.slice(0, currentIndex));
				if (currentIndex >= 33) clearInterval(interval);
			}, 35);
			return () => clearInterval(interval);
		}, 300);
		return () => clearTimeout(delayTimer);
	}, []);
	return /* @__PURE__ */ jsxs("section", {
		id: "inicio",
		className: `relative min-h-[100dvh] w-full overflow-hidden border-b border-white/10 bg-zinc-950 text-foreground flex flex-col justify-between ${className}`,
		children: [
			/* @__PURE__ */ jsx("img", {
				src: taller_hero_default,
				alt: "Instalaciones y banco de pruebas computarizado de Laboratorio Diésel",
				width: 1920,
				height: 1080,
				className: "absolute inset-0 h-full w-full object-cover brightness-[0.7] max-md:[object-position:center_35%] max-md:opacity-35 md:object-center animate-slow-zoom",
				fetchPriority: "high"
			}),
			/* @__PURE__ */ jsx("div", {
				className: "pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-transparent to-zinc-950/90",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ jsx("div", {
				className: "h-24 sm:h-28",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative z-10 mx-auto my-auto max-w-5xl px-4 py-8 flex flex-col items-center justify-center text-center",
				children: [
					/* @__PURE__ */ jsx(motion.h1, {
						initial: {
							opacity: 0,
							y: 20
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: {
							duration: .4,
							ease: [
								.16,
								1,
								.3,
								1
							]
						},
						className: "font-display text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-bold uppercase tracking-tight text-white leading-none text-center drop-shadow-lg",
						children: SITE_CONFIG.name
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-4 sm:mt-6 font-mono text-xs sm:text-sm md:text-base uppercase tracking-[0.25em] text-zinc-300 text-center flex items-center justify-center min-h-[2rem]",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "sr-only",
								children: "Especialistas en inyección diésel"
							}),
							/* @__PURE__ */ jsx("span", {
								"aria-hidden": "true",
								children: displayedSubtitle
							}),
							/* @__PURE__ */ jsx("span", {
								"aria-hidden": "true",
								className: "inline-block ml-1 font-bold select-none animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite]",
								style: { color: "#ea580c" },
								children: "|"
							})
						]
					}),
					/* @__PURE__ */ jsxs(motion.div, {
						initial: {
							opacity: 0,
							y: 15
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: {
							delay: .1,
							duration: .4
						},
						className: "mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4",
						children: [/* @__PURE__ */ jsx(CatalogCTAButton, {
							size: "lg",
							className: "rounded-none border-white/20",
							children: "Ver Catálogo de Inyectores"
						}), /* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							asChild: true,
							className: "h-12 px-7 rounded-none border border-white/10 bg-zinc-950/60 backdrop-blur-md text-xs font-mono uppercase tracking-widest text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all shadow-none",
							children: /* @__PURE__ */ jsxs("a", {
								href: "#contacto",
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ jsx(FaWhatsapp, { className: "size-4 text-channel-support" }), /* @__PURE__ */ jsx("span", { children: "Contactar al Taller" })]
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "relative z-20 border-t border-white/10 bg-zinc-950/80 backdrop-blur-md px-6 py-5 sm:px-12",
				children: /* @__PURE__ */ jsx("div", {
					className: "site-container flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-0",
					children: /* @__PURE__ */ jsx("div", {
						className: "flex flex-wrap items-center gap-4 sm:gap-8 text-xs font-mono uppercase tracking-widest text-zinc-400",
						children: SITE_CONFIG.valueProps.map((prop) => /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ jsx("span", { className: "size-1.5 bg-industrial" }), /* @__PURE__ */ jsx("span", {
								className: "text-zinc-300",
								children: prop
							})]
						}, prop))
					})
				})
			})
		]
	});
}
//#endregion
//#region src/components/landing/IntroSection.tsx
function IntroSection({ className = "" }) {
	const { ref, isInstant, singleVariants, viewportConfig, handleAnimationComplete } = useScrollReveal("intro");
	return /* @__PURE__ */ jsx("section", {
		ref,
		"aria-label": "Introducción institucional",
		className: `relative bg-zinc-950 py-32 border-b border-white/10 ${className}`,
		children: /* @__PURE__ */ jsx("div", {
			className: "site-container",
			children: /* @__PURE__ */ jsxs(motion.div, {
				variants: singleVariants,
				initial: isInstant ? "visible" : "hidden",
				whileInView: "visible",
				viewport: viewportConfig,
				onAnimationComplete: handleAnimationComplete,
				className: "max-w-4xl mx-auto text-center",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-600 block mb-6",
						children: "Ingeniería & Calibración"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-3xl md:text-5xl text-zinc-300 max-w-4xl mx-auto text-center font-light leading-snug",
						children: "Más de dos décadas de precisión absoluta en inyección diésel Common Rail, bancos de prueba computarizados y diagnósticos de vanguardia."
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-10 flex items-center justify-center gap-3",
						children: [
							/* @__PURE__ */ jsx("span", { className: "h-px w-12 bg-white/20" }),
							/* @__PURE__ */ jsxs("span", {
								className: "font-mono text-xs uppercase tracking-[0.25em] text-zinc-500",
								children: [SITE_CONFIG.name, " · San Luis"]
							}),
							/* @__PURE__ */ jsx("span", { className: "h-px w-12 bg-white/20" })
						]
					})
				]
			})
		})
	});
}
//#endregion
//#region src/components/landing/LocationSection.tsx
function LocationSection({ className = "" }) {
	const { ref, isInstant, containerVariants, itemVariants, singleVariants, viewportConfig, handleAnimationComplete } = useScrollReveal("ubicacion");
	return /* @__PURE__ */ jsx("section", {
		id: "ubicacion",
		ref,
		className: `scroll-mt-20 border-b border-white/10 bg-zinc-950 py-24 md:py-32 text-foreground ${className}`,
		"aria-labelledby": "ubicacion-heading",
		children: /* @__PURE__ */ jsxs("div", {
			className: "site-container",
			children: [/* @__PURE__ */ jsxs(motion.div, {
				variants: singleVariants,
				initial: isInstant ? "visible" : "hidden",
				whileInView: "visible",
				viewport: viewportConfig,
				className: "mb-16 max-w-3xl",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600 block mb-3",
						children: "Ubicación & Logística"
					}),
					/* @__PURE__ */ jsx("h2", {
						id: "ubicacion-heading",
						className: "text-3xl md:text-5xl font-light tracking-tight text-white uppercase leading-tight",
						children: "Ubicación y Horarios de Atención"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-4 text-base font-light text-zinc-400 leading-relaxed",
						children: "Estamos ubicados estratégicamente para recibir tu vehículo, maquinaria o coordinar envíos de repuestos e inyectores."
					})
				]
			}), /* @__PURE__ */ jsxs(motion.div, {
				variants: containerVariants,
				initial: isInstant ? "visible" : "hidden",
				whileInView: "visible",
				viewport: viewportConfig,
				onAnimationComplete: handleAnimationComplete,
				className: "grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12 border-t border-white/10 pt-16",
				children: [/* @__PURE__ */ jsxs(motion.div, {
					variants: itemVariants,
					className: "flex flex-col justify-between border border-white/10 bg-zinc-950 p-8 lg:col-span-5",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
						className: "relative mb-8 aspect-video w-full overflow-hidden border border-white/10 bg-black",
						children: [/* @__PURE__ */ jsx("img", {
							src: fachada_local_default,
							alt: "Fachada oficial del taller Laboratorio Diésel en Av. Pres. Perón 1215",
							className: "h-full w-full object-cover transition-transform duration-700 hover:scale-105",
							loading: "lazy",
							width: 800,
							height: 450
						}), /* @__PURE__ */ jsxs("div", {
							className: "absolute bottom-3 left-3 z-10 flex items-center gap-2 border border-white/10 bg-zinc-950/80 px-3 py-1 font-mono text-[10px] tracking-widest uppercase text-white/80",
							children: [/* @__PURE__ */ jsx("span", { className: "size-1.5 bg-zinc-400" }), /* @__PURE__ */ jsx("span", { children: "Local a la Calle · Pres. Perón 1215" })]
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "space-y-6 border-t border-white/10 pt-6",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 mb-2",
							children: "Dirección del Taller"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-sm font-light text-zinc-300 leading-relaxed",
							children: SITE_CONFIG.address
						})] }), /* @__PURE__ */ jsxs("div", {
							className: "border-t border-white/5 pt-4",
							children: [
								/* @__PURE__ */ jsx("h3", {
									className: "font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 mb-2",
									children: "Horarios de Atención"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-sm font-light text-zinc-300 leading-relaxed",
									children: SITE_CONFIG.businessHours
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-1 font-mono text-[11px] text-zinc-500",
									children: "Sábados, domingos y feriados cerrado"
								})
							]
						})]
					})] }), /* @__PURE__ */ jsx("div", {
						className: "mt-8 border-t border-white/10 pt-6",
						children: /* @__PURE__ */ jsx(Button, {
							variant: "outline",
							asChild: true,
							className: "h-11 w-full justify-center rounded-none border border-white/20 bg-white/[0.04] text-xs font-mono uppercase tracking-widest text-white hover:bg-white hover:text-black hover:border-white transition-all shadow-none",
							children: /* @__PURE__ */ jsxs("a", {
								href: SITE_CONFIG.googleMapsDirectionsUrl,
								target: "_blank",
								rel: "noopener noreferrer",
								children: ["Cómo llegar en Google Maps", /* @__PURE__ */ jsx(ExternalLink, { className: "ml-2 size-3.5" })]
							})
						})
					})]
				}), /* @__PURE__ */ jsx(motion.div, {
					variants: itemVariants,
					className: "relative min-h-[420px] overflow-hidden border border-white/10 bg-zinc-950 lg:col-span-7",
					children: /* @__PURE__ */ jsx("iframe", {
						title: "Mapa de ubicación del taller Laboratorio Diésel",
						src: SITE_CONFIG.googleMapsEmbedUrl,
						className: "absolute inset-0 h-full w-full border-0 opacity-90 hover:opacity-100 transition-opacity duration-500",
						loading: "lazy",
						referrerPolicy: "no-referrer-when-downgrade",
						tabIndex: -1
					})
				})]
			})]
		})
	});
}
//#endregion
//#region src/components/landing/MobileStickyBar.tsx
/**
* Barra fija móvil inferior (Spec 010, RF-07, RNF-03, Caso Límite 1, Caso Límite 3).
*
* Características canónicas:
* 1. Renderizado condicional: Activa exclusivamente en pantallas móviles (< 768px)
*    y estrictamente en la Landing Page (pathname === '/').
* 2. Altura mínima flexible de 64px (min-h-[64px]) con superficie translúcida
*    bg-black/80, desenfoque backdrop-blur-md y borde perimetral superior border-white/10.
* 3. Botón WhatsApp icónico con ancho exacto e inmutable de 48px (w-12), sin texto,
*    con área táctil mínima de 44x44px y estilo secundario.
* 4. Botón "Ir al catálogo" (CatalogCTAButton) expandido en flex-1 con efecto shimmer.
* 5. Área segura móvil protegida: padding-bottom acoplado a env(safe-area-inset-bottom).
* 6. Suspensión automática en modo landscape (< 450px de altura) con re-evaluación al hacer blur.
* 7. Suscripción a ResizeObserver para actualizar dinámicamente --bottom-bar-height.
*/
function MobileStickyBar({ className = "" }) {
	const location = useLocation();
	const barRef = useRef(null);
	const [isLandscape, setIsLandscape] = useState(false);
	const isLandingPage = location.pathname === "/";
	useEffect(() => {
		const checkLandscape = () => {
			if (typeof window === "undefined") return;
			const height = window.innerHeight;
			const isLandscapeMedia = window.matchMedia?.("(orientation: landscape)").matches;
			setIsLandscape(height < 450 || Boolean(isLandscapeMedia) && height < 500);
		};
		checkLandscape();
		window.addEventListener("resize", checkLandscape);
		window.addEventListener("orientationchange", checkLandscape);
		window.addEventListener("blur", checkLandscape);
		window.addEventListener("focus", checkLandscape);
		return () => {
			window.removeEventListener("resize", checkLandscape);
			window.removeEventListener("orientationchange", checkLandscape);
			window.removeEventListener("blur", checkLandscape);
			window.removeEventListener("focus", checkLandscape);
		};
	}, []);
	useEffect(() => {
		if (!isLandingPage || isLandscape) {
			if (typeof document !== "undefined") document.documentElement.style.removeProperty("--bottom-bar-height");
			return;
		}
		const element = barRef.current;
		if (!element || typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const height = (Array.isArray(entry.borderBoxSize) && entry.borderBoxSize[0] ? entry.borderBoxSize[0].blockSize : null) ?? entry.contentRect?.height ?? element.offsetHeight;
				if (height && height > 0) document.documentElement.style.setProperty("--bottom-bar-height", `${Math.round(height)}px`);
			}
		});
		observer.observe(element);
		return () => {
			observer.disconnect();
			if (typeof document !== "undefined") document.documentElement.style.removeProperty("--bottom-bar-height");
		};
	}, [isLandingPage, isLandscape]);
	if (!isLandingPage || isLandscape) return null;
	const generalWhatsappUrl = buildWhatsAppUrl(SITE_CONFIG.phone, SITE_CONFIG.whatsappMessages.general);
	return /* @__PURE__ */ jsxs("aside", {
		ref: barRef,
		"aria-label": "Acciones rápidas inferiores",
		"data-testid": "mobile-sticky-bar",
		className: cn("fixed bottom-0 inset-x-0 z-40 md:hidden", "min-h-[64px] w-full", "bg-black/80 backdrop-blur-md", "border-t border-white/10", "px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))]", "flex items-center gap-3", "transition-all duration-300", className),
		style: { paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom, 0px))" },
		children: [/* @__PURE__ */ jsxs("a", {
			href: generalWhatsappUrl,
			target: "_blank",
			rel: "noopener noreferrer",
			"aria-label": "Contactar por WhatsApp",
			"data-testid": "mobile-whatsapp-btn",
			className: "flex h-11 w-12 shrink-0 items-center justify-center rounded-none border border-emerald-500/40 bg-zinc-900/90 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500 active:scale-95 transition-all shadow-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500",
			children: [/* @__PURE__ */ jsx(FaWhatsapp, { className: "size-5 text-channel-support" }), /* @__PURE__ */ jsx("span", {
				className: "sr-only",
				children: "Contactar por WhatsApp"
			})]
		}), /* @__PURE__ */ jsx(CatalogCTAButton, {
			to: "/catalogo",
			size: "default",
			"data-testid": "mobile-catalog-btn",
			className: "flex-1 h-11 w-full justify-center text-xs tracking-wider font-semibold",
			children: "Ir al catálogo"
		})]
	});
}
//#endregion
//#region src/components/landing/ServicesSection.tsx
/**
* Sección de Servicios Especializados — Bento Grid Industrial Premium.
* (Spec 009, RF-04, RNF-01, RNF-02, Bloque 3 - Tarea 3.1)
*
* Características:
* - Matriz Bento Grid industrial de 12 columnas en desktop (gap-6) y apilamiento vertical continuo en móvil (gap-4).
* - Superficie mineral inerte con hairlines de 1px (border-border/80) y realce sutil ante interacción.
* - Priorización de datos duros (presiones en bar, tolerancias y protocolos IMA) sobre prosa comercial.
* - Fotografía real del taller integrada con viñeta periférica de contraste localizada.
* - Cláusula formal técnica sobre repuestos originales y alternativos homologados.
*/
var BENTO_GRID_CLASSES = {
	"banco-pruebas": "lg:col-span-7 md:col-span-2 min-h-[320px] lg:min-h-[440px]",
	"bombas-inyectoras": "lg:col-span-5 md:col-span-1 min-h-[320px] lg:min-h-[440px]",
	"inyectores-common-rail": "lg:col-span-6 md:col-span-1 min-h-[300px] lg:min-h-[360px]",
	"diagnostico-repuestos": "lg:col-span-6 md:col-span-2 min-h-[300px] lg:min-h-[360px]"
};
var ROMAN_NUMERALS = [
	"I",
	"II",
	"III",
	"IV"
];
function ServicesSection({ className = "" }) {
	const { ref, isInstant, containerVariants, itemVariants, singleVariants, viewportConfig, handleAnimationComplete } = useScrollReveal("servicios");
	return /* @__PURE__ */ jsx("section", {
		id: "servicios",
		ref,
		className: `scroll-mt-20 border-b border-white/10 bg-zinc-950 py-24 md:py-32 ${className}`,
		"aria-labelledby": "servicios-heading",
		children: /* @__PURE__ */ jsxs("div", {
			className: "site-container",
			children: [
				/* @__PURE__ */ jsxs(motion.div, {
					variants: singleVariants,
					initial: isInstant ? "visible" : "hidden",
					whileInView: "visible",
					viewport: viewportConfig,
					className: "mb-20 max-w-4xl",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600 mb-4",
							children: "Pilares Técnicos y Capacidad Operativa"
						}),
						/* @__PURE__ */ jsx("h2", {
							id: "servicios-heading",
							className: "text-4xl md:text-7xl font-light tracking-tighter text-white uppercase leading-none",
							children: "Soluciones para Sistemas de Inyección Diésel"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-8 text-base md:text-xl font-light leading-relaxed text-zinc-400 max-w-3xl",
							children: "Diagnóstico avanzado y calibración milimétrica con equipamiento computarizado de precisión para motores diésel livianos, medianos, pesados y agrícolas."
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "border-b border-white/10",
					children: /* @__PURE__ */ jsx(motion.div, {
						variants: containerVariants,
						initial: isInstant ? "visible" : "hidden",
						whileInView: "visible",
						viewport: viewportConfig,
						onAnimationComplete: handleAnimationComplete,
						className: "grid grid-cols-1 lg:grid-cols-12 gap-y-16 gap-x-12",
						children: SITE_CONFIG.services.map((service, index) => {
							const bentoColSpan = BENTO_GRID_CLASSES[service.id] ?? "lg:col-span-6";
							const roman = ROMAN_NUMERALS[index] ?? `0${index + 1}`;
							return /* @__PURE__ */ jsxs(motion.article, {
								variants: itemVariants,
								className: `border-t border-white/10 pt-12 pb-16 flex flex-col justify-between group transition-colors ${bentoColSpan}`,
								children: [/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between gap-4 mb-8",
										children: [/* @__PURE__ */ jsx("span", {
											className: "font-mono text-2xl md:text-3xl font-light text-zinc-500",
											children: roman
										}), /* @__PURE__ */ jsx("div", {
											className: "flex flex-wrap gap-2 justify-end",
											children: service.badges?.map((badge) => /* @__PURE__ */ jsx("span", {
												className: "font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 border border-white/10 px-2.5 py-1",
												children: badge
											}, badge))
										})]
									}),
									/* @__PURE__ */ jsx("h3", {
										className: "text-3xl md:text-5xl font-light tracking-tight text-white mb-6 leading-tight",
										children: service.title
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-sm md:text-base font-light text-zinc-400 leading-relaxed mb-8 max-w-xl",
										children: service.description
									})
								] }), /* @__PURE__ */ jsxs("div", {
									className: "relative overflow-hidden border border-white/10 h-52 md:h-64 w-full mt-auto",
									children: [/* @__PURE__ */ jsx("img", {
										src: service.image,
										alt: service.title,
										className: "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105",
										loading: "lazy"
									}), /* @__PURE__ */ jsx("div", {
										className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-80",
										"aria-hidden": "true"
									})]
								})]
							}, service.id);
						})
					})
				}),
				/* @__PURE__ */ jsxs(motion.div, {
					variants: singleVariants,
					initial: isInstant ? "visible" : "hidden",
					whileInView: "visible",
					viewport: viewportConfig,
					className: "mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.25em]",
						children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "size-4 text-zinc-400 shrink-0" }), /* @__PURE__ */ jsx("span", { children: "Especificaciones de Repuesto" })]
					}), /* @__PURE__ */ jsx("p", {
						className: "font-mono text-xs text-zinc-400 max-w-2xl text-left sm:text-right",
						children: SITE_CONFIG.servicesTransparencyClause
					})]
				})
			]
		})
	});
}
//#endregion
//#region src/assets/workshop/banco-en-vivo.mp4
var banco_en_vivo_default = "/assets/banco-en-vivo-PYcrTCJl.mp4";
//#endregion
//#region src/components/landing/WarrantySection.tsx
function WarrantySection({ className = "" }) {
	const warrantyUrl = buildWhatsAppUrl(SITE_CONFIG.phone, SITE_CONFIG.whatsappMessages.warranty);
	const videoRef = useRef(null);
	const [shouldFallback, setShouldFallback] = useState(false);
	const { ref, isInstant, containerVariants, itemVariants, singleVariants, viewportConfig, handleAnimationComplete } = useScrollReveal("garantias");
	useEffect(() => {
		if (typeof navigator !== "undefined") {
			const nav = navigator;
			if (nav.connection?.saveData === true || nav.connection?.effectiveType === "2g" || nav.connection?.effectiveType === "slow-2g") {
				setShouldFallback(true);
				return;
			}
		}
		if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-data: reduce)")?.matches) {
			setShouldFallback(true);
			return;
		}
		const video = videoRef.current;
		if (video && typeof video.play === "function") try {
			const playPromise = video.play();
			if (playPromise !== void 0 && typeof playPromise.catch === "function") playPromise.catch(() => {
				setShouldFallback(true);
			});
		} catch {
			setShouldFallback(true);
		}
	}, []);
	return /* @__PURE__ */ jsx("section", {
		id: "garantias",
		ref,
		className: `scroll-mt-20 border-b border-white/10 bg-zinc-950 py-24 md:py-32 text-foreground ${className}`,
		"aria-labelledby": "garantias-heading",
		children: /* @__PURE__ */ jsx("div", {
			className: "site-container",
			children: /* @__PURE__ */ jsx("div", {
				className: "border-t border-white/10 pt-16",
				children: /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start",
					children: [/* @__PURE__ */ jsxs(motion.div, {
						variants: singleVariants,
						initial: isInstant ? "visible" : "hidden",
						whileInView: "visible",
						viewport: viewportConfig,
						className: "lg:col-span-7 space-y-8",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("span", {
									className: "font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600 block mb-3",
									children: "Respaldo & Posventa"
								}),
								/* @__PURE__ */ jsx("h2", {
									id: "garantias-heading",
									className: "text-3xl md:text-5xl font-light tracking-tight text-white uppercase leading-tight",
									children: SITE_CONFIG.warrantyTerms.title
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-4 text-base font-light leading-relaxed text-zinc-400 max-w-2xl",
									children: SITE_CONFIG.warrantyTerms.summary
								})
							] }),
							/* @__PURE__ */ jsx(motion.div, {
								variants: containerVariants,
								initial: isInstant ? "visible" : "hidden",
								whileInView: "visible",
								viewport: viewportConfig,
								className: "border-t border-white/10 pt-6 space-y-4",
								children: SITE_CONFIG.warrantyTerms.details.map((detail) => /* @__PURE__ */ jsxs(motion.div, {
									variants: itemVariants,
									className: "flex items-start gap-4 border-b border-white/5 pb-4",
									children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "mt-1 size-4 shrink-0 text-zinc-400" }), /* @__PURE__ */ jsx("span", {
										className: "text-sm font-light text-zinc-300 leading-relaxed",
										children: detail
									})]
								}, detail))
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "pt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center",
								children: [/* @__PURE__ */ jsx(Button, {
									variant: "outline",
									size: "lg",
									asChild: true,
									className: "h-11 rounded-none border border-white/20 bg-white/[0.05] px-6 font-mono text-xs uppercase tracking-widest text-white hover:bg-white hover:text-black hover:border-white transition-all shadow-none",
									children: /* @__PURE__ */ jsxs("a", {
										href: warrantyUrl,
										target: "_blank",
										rel: "noopener noreferrer",
										children: [/* @__PURE__ */ jsx(FaWhatsapp, { className: "mr-2 size-3.5 text-whatsapp" }), "Solicitar Garantía / Soporte"]
									})
								}), /* @__PURE__ */ jsx("p", {
									className: "font-mono text-xs text-zinc-500",
									children: "Atención técnica directa de Lun a Vie"
								})]
							})
						]
					}), /* @__PURE__ */ jsx(motion.div, {
						variants: singleVariants,
						initial: isInstant ? "visible" : "hidden",
						whileInView: "visible",
						viewport: viewportConfig,
						onAnimationComplete: handleAnimationComplete,
						className: "lg:col-span-5",
						children: /* @__PURE__ */ jsxs("div", {
							className: "relative aspect-video w-full overflow-hidden border border-white/10 bg-black",
							children: [shouldFallback ? /* @__PURE__ */ jsx("img", {
								src: inyectores_detalle_default,
								alt: "Banco de ensayo y calibración de precisión Common Rail",
								className: "h-full w-full object-cover"
							}) : /* @__PURE__ */ jsx("video", {
								ref: videoRef,
								src: banco_en_vivo_default,
								poster: inyectores_detalle_default,
								muted: true,
								autoPlay: true,
								loop: true,
								playsInline: true,
								preload: "metadata",
								onError: () => setShouldFallback(true),
								className: "h-full w-full object-cover",
								"aria-label": "Ensayo y prueba de inyectores diésel en banco computarizado"
							}), /* @__PURE__ */ jsxs("div", {
								className: "absolute top-4 left-4 z-10 flex items-center gap-2 border border-white/10 bg-zinc-950/80 px-3 py-1 font-mono text-[10px] tracking-widest uppercase text-white/80",
								children: [/* @__PURE__ */ jsx("span", { className: `size-1.5 ${shouldFallback ? "bg-zinc-500" : "bg-emerald-400 animate-pulse"}` }), /* @__PURE__ */ jsx("span", { children: shouldFallback ? "Banco de Precisión Common Rail" : "Ensayo en Tiempo Real" })]
							})]
						})
					})]
				})
			})
		})
	});
}
//#endregion
//#region src/components/landing/use-hash-navigation.ts
function useHashNavigation() {
	useEffect(() => {
		const scrollToHash = (hash) => {
			const id = hash.startsWith("#") ? hash.slice(1) : "";
			if (!id) return;
			const target = document.getElementById(id);
			if (!target) return;
			const prefersReducedMotion = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			target.scrollIntoView({
				behavior: prefersReducedMotion ? "auto" : "smooth",
				block: "start"
			});
		};
		const scheduleInitialScroll = () => {
			if (typeof window.requestAnimationFrame === "function") {
				const frameId = window.requestAnimationFrame(() => scrollToHash(window.location.hash));
				return () => window.cancelAnimationFrame(frameId);
			}
			const timeoutId = window.setTimeout(() => scrollToHash(window.location.hash), 0);
			return () => window.clearTimeout(timeoutId);
		};
		const cancelInitialScroll = scheduleInitialScroll();
		const handleLocationChange = () => scrollToHash(window.location.hash);
		const handleAnchorClick = (event) => {
			if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
			const clickTarget = event.target;
			if (!(clickTarget instanceof Element)) return;
			const hash = clickTarget.closest("a[href^=\"#\"]")?.getAttribute("href");
			if (!hash || !document.getElementById(hash.slice(1))) return;
			event.preventDefault();
			scrollToHash(hash);
			if (window.location.hash !== hash) window.history.pushState(null, "", hash);
		};
		document.addEventListener("click", handleAnchorClick);
		window.addEventListener("hashchange", handleLocationChange);
		window.addEventListener("popstate", handleLocationChange);
		return () => {
			cancelInitialScroll();
			document.removeEventListener("click", handleAnchorClick);
			window.removeEventListener("hashchange", handleLocationChange);
			window.removeEventListener("popstate", handleLocationChange);
		};
	}, []);
}
//#endregion
//#region src/routes/index.tsx
var Route$6 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Laboratorio Diésel — Precisión en inyección Common Rail" },
		{
			name: "description",
			content: "Diagnóstico, banco de pruebas, recambios y repuestos Common Rail. Especialistas en inyección diésel con 30 días de garantía."
		},
		{
			property: "og:title",
			content: "Laboratorio Diésel — Precisión en inyección Common Rail"
		},
		{
			property: "og:description",
			content: "Diagnóstico, banco de pruebas, recambios y repuestos Common Rail. Especialistas en inyección diésel con 30 días de garantía."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: LandingPage
});
function LandingPage() {
	useHashNavigation();
	useEffect(() => {
		if (typeof window !== "undefined" && !window.location.hash) window.scrollTo({
			top: 0,
			behavior: "instant"
		});
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-zinc-950 text-zinc-100 selection:bg-white selection:text-black",
		children: [
			/* @__PURE__ */ jsx(LandingNavbar, {}),
			/* @__PURE__ */ jsxs("main", { children: [
				/* @__PURE__ */ jsx(HeroSection, {}),
				/* @__PURE__ */ jsx(IntroSection, {}),
				/* @__PURE__ */ jsx(FeaturedProductsCarousel, {}),
				/* @__PURE__ */ jsx(BrandsMarquee, {}),
				/* @__PURE__ */ jsx(ServicesSection, {}),
				/* @__PURE__ */ jsx(BenchShowcaseSection, {}),
				/* @__PURE__ */ jsx(WarrantySection, {}),
				/* @__PURE__ */ jsx(LocationSection, {})
			] }),
			/* @__PURE__ */ jsx(LandingFooter, {}),
			/* @__PURE__ */ jsx(FloatingWhatsApp, { className: "max-md:hidden" }),
			/* @__PURE__ */ jsx(MobileStickyBar, {})
		]
	});
}
//#endregion
//#region src/routes/admin.tsx
var $$splitComponentImporter$5 = () => import("./admin-B36gs1gN.js");
var Route$5 = createFileRoute("/admin")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
/**
* Layout principal del árbol administrativo /admin.
* Estructura jerárquica estricta de proveedores y tema claro SaaS:
* 1. AdminAuthProvider (provee la sesión Zero-Trust en memoria).
* 2. AdminGuard (verifica la sesión y redirige defensivamente si no está autenticado).
* 3. AdminProvider (provee el estado reactivo del catálogo y taxonomías conectado a PostgreSQL).
* 4. Layout visual (Sidebar, Header y <Outlet /> en Modo Claro SaaS).
*/
//#endregion
//#region src/routes/admin.index.tsx
var $$splitComponentImporter$4 = () => import("./admin.index-Bk_t2IL9.js");
var Route$4 = createFileRoute("/admin/")({
	head: () => pageHead("Catálogo de Repuestos — Laboratorio Diésel", "Administración y control de inventario de repuestos, bombas e inyectores diésel con calibración y trazabilidad técnica."),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
/**
* Punto de entrada principal del backoffice (/admin).
* Integra Toolbar, Table, FormModal y DeleteModal para el catálogo de repuestos.
* (RF-05, RF-06, RF-07)
*/
//#endregion
//#region src/routes/admin.categorias.tsx
var $$splitComponentImporter$3 = () => import("./admin.categorias-BxOOJt42.js");
var Route$3 = createFileRoute("/admin/categorias")({
	head: () => pageHead("Categorías — Laboratorio Diésel", "Gestión jerárquica de categorías y subcategorías de repuestos de inyección diésel."),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
//#endregion
//#region src/routes/admin.dashboard.tsx
var $$splitComponentImporter$2 = () => import("./admin.dashboard-jfLNBYb2.js");
var Route$2 = createFileRoute("/admin/dashboard")({
	head: () => pageHead("Dashboard — Laboratorio Diésel", "Panel de control y métricas consolidadas del catálogo técnico de inyección diésel y repuestos."),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
//#endregion
//#region src/routes/admin.login.tsx
var $$splitComponentImporter$1 = () => import("./admin.login-Cco3P7-B.js");
var Route$1 = createFileRoute("/admin/login")({
	head: () => pageHead("Iniciar Sesión — Panel de Administración", "Acceso restringido para el personal y administración de Laboratorio Diésel."),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
//#endregion
//#region src/routes/admin.marcas.tsx
var $$splitComponentImporter = () => import("./admin.marcas-UTdco0T_.js");
var Route = createFileRoute("/admin/marcas")({
	head: () => pageHead("Marcas — Laboratorio Diésel", "Gestión de marcas y fabricantes de repuestos del catálogo técnico de inyección diésel."),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
//#region src/routeTree.gen.ts
var IndexRoute = Route$6.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$7
});
var AdminRoute = Route$5.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$7
});
var CatalogoRoute = Route$8.update({
	id: "/catalogo",
	path: "/catalogo",
	getParentRoute: () => Route$7
});
var AdminIndexRoute = Route$4.update({
	id: "/",
	path: "/",
	getParentRoute: () => AdminRoute
});
var AdminCategoriasRoute = Route$3.update({
	id: "/categorias",
	path: "/categorias",
	getParentRoute: () => AdminRoute
});
var AdminDashboardRoute = Route$2.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AdminRoute
});
var AdminLoginRoute = Route$1.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => AdminRoute
});
var AdminMarcasRoute = Route.update({
	id: "/marcas",
	path: "/marcas",
	getParentRoute: () => AdminRoute
});
var CatalogoProductIdRoute = Route$9.update({
	id: "/$productId",
	path: "/$productId",
	getParentRoute: () => CatalogoRoute
});
var AdminRouteChildren = {
	AdminCategoriasRoute,
	AdminDashboardRoute,
	AdminLoginRoute,
	AdminMarcasRoute,
	AdminIndexRoute
};
var AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
var CatalogoRouteChildren = { CatalogoProductIdRoute };
var rootRouteChildren = {
	IndexRoute,
	AdminRoute: AdminRouteWithChildren,
	CatalogoRoute: CatalogoRoute._addFileChildren(CatalogoRouteChildren)
};
var routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
