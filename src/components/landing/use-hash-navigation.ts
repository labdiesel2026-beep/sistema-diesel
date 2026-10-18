import { useEffect } from "react";

export function useHashNavigation() {
  useEffect(() => {
    const scrollToHash = (hash: string) => {
      const id = hash.startsWith("#") ? hash.slice(1) : "";
      if (!id) return;

      const target = document.getElementById(id);
      if (!target) return;

      const prefersReducedMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    };

    const scheduleInitialScroll = () => {
      if (typeof window.requestAnimationFrame === "function") {
        const frameId = window.requestAnimationFrame(() =>
          scrollToHash(window.location.hash),
        );
        return () => window.cancelAnimationFrame(frameId);
      }

      const timeoutId = window.setTimeout(
        () => scrollToHash(window.location.hash),
        0,
      );
      return () => window.clearTimeout(timeoutId);
    };

    const cancelInitialScroll = scheduleInitialScroll();
    const handleLocationChange = () => scrollToHash(window.location.hash);
    const handleAnchorClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const clickTarget = event.target;
      if (!(clickTarget instanceof Element)) return;

      const anchor = clickTarget.closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = anchor?.getAttribute("href");
      if (!hash || !document.getElementById(hash.slice(1))) return;

      event.preventDefault();
      scrollToHash(hash);

      if (window.location.hash !== hash) {
        window.history.pushState(null, "", hash);
      }
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
