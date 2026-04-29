import { useEffect, useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function FloatingLogo() {
  const { content } = useSiteContent();
  const brandLogo = (content["brand.logo"] || "").trim();
  const brandName = (content["brand.name"] || "M.I. Engineering Works").trim();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`${brandName} — back to top`}
      data-testid="button-floating-logo"
      className={`fixed left-4 md:left-6 bottom-20 md:bottom-24 z-40 w-14 h-14 md:w-16 md:h-16 rounded-full bg-card border border-primary/40 shadow-gold flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-110 hover:border-primary ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      {brandLogo ? (
        <img
          src={brandLogo}
          alt={brandName}
          className="w-full h-full object-contain p-1.5"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="font-heading font-bold text-sm md:text-base text-gradient-gold">
          MI
        </span>
      )}
    </button>
  );
}
