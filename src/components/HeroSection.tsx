import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroImg from "@/assets/hero-fasteners.jpg";
import { useSiteContent } from "@/hooks/useSiteContent";

const HeroSection = () => {
  const { get } = useSiteContent();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} id="home" className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Parallax BG */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <motion.img
          src={heroImg}
          alt="Premium fasteners by M.I. Engineering Works"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-dark opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/60 to-transparent" />
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{ left: `${10 + i * 12}%`, top: `${15 + (i % 4) * 20}%` }}
            animate={{ y: [0, -40, 0], opacity: [0.15, 0.5, 0.15], scale: [1, 1.5, 1] }}
            transition={{ duration: 5 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          />
        ))}
      </div>

      <motion.div className="container relative z-10 py-20 md:py-32" style={{ y: textY, opacity }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-3xl">
          <motion.div
            className="gold-divider w-20 mb-6"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            style={{ transformOrigin: "left" }}
          />
          {get("hero.eyebrow") && (
            <div className="mb-3 text-xs font-semibold tracking-[0.4em] uppercase text-gold-light/80" data-testid="text-hero-eyebrow">
              {get("hero.eyebrow")}
            </div>
          )}
          <motion.h1
            className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight"
            initial={{ opacity: 0, y: 40, rotateX: 15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span data-testid="text-hero-title">{get("hero.title")}</span>{get("hero.titleAccent") && " "}
            {get("hero.titleAccent") && (
              <motion.span
                className="text-gradient-gold inline-block"
                initial={{ opacity: 0, y: 30, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                data-testid="text-hero-title-accent"
              >
                {get("hero.titleAccent")}
              </motion.span>
            )}
          </motion.h1>
          <motion.p
            className="mt-6 text-lg md:text-xl text-gold-light/80 max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            data-testid="text-hero-subtitle"
          >
            {get("hero.subtitle")}
          </motion.p>
          <motion.div
            className="mt-10 flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            {get("hero.ctaPrimaryText") && (
              <motion.a
                href={get("hero.ctaPrimaryUrl") || "#products"}
                className="inline-flex items-center px-8 py-3.5 bg-gradient-gold text-charcoal font-semibold rounded-sm hover:opacity-90 transition-opacity shadow-gold"
                whileHover={{ scale: 1.05, boxShadow: "0 8px 30px -4px hsl(43 72% 48% / 0.5)" }}
                whileTap={{ scale: 0.97 }}
                data-testid="link-hero-primary"
              >
                {get("hero.ctaPrimaryText")}
              </motion.a>
            )}
            {get("hero.ctaSecondaryText") && (
              <motion.a
                href={get("hero.ctaSecondaryUrl") || "#contact"}
                className="inline-flex items-center px-8 py-3.5 border-2 border-gold/50 text-gold-light font-semibold rounded-sm hover:bg-gold/10 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                data-testid="link-hero-secondary"
              >
                {get("hero.ctaSecondaryText")}
              </motion.a>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
