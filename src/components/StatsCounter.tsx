import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Award, Users, Package, Globe } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

const ICONS = [Award, Users, Package, Globe];
const parseNum = (s: string) => {
  const m = String(s || "").replace(/[, ]/g, "").match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
};
const suffixOf = (s: string) => (String(s || "").includes("+") ? "+" : (s || "").replace(/[\d, ]/g, ""));

const AnimatedNumber = ({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span className="text-gradient-gold text-4xl md:text-5xl lg:text-6xl font-bold font-heading tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const StatsCounter = () => {
  const { get } = useSiteContent();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { icon: ICONS[0], value: parseNum(get("stats.years")), suffix: suffixOf(get("stats.years")) || "+", label: get("stats.yearsLabel"), description: "Decades of trusted manufacturing" },
    { icon: ICONS[1], value: parseNum(get("stats.clients")), suffix: suffixOf(get("stats.clients")) || "+", label: get("stats.clientsLabel"), description: "Across India & worldwide" },
    { icon: ICONS[2], value: parseNum(get("stats.orders")), suffix: suffixOf(get("stats.orders")) || "+", label: get("stats.ordersLabel"), description: "On-time, every time" },
    { icon: ICONS[3], value: parseNum(get("stats.industries")), suffix: suffixOf(get("stats.industries")) || "+", label: get("stats.industriesLabel"), description: "From Oil & Gas to Aerospace" },
  ];

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-dark" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      
      <div className="container relative z-10" ref={ref}>
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary" data-testid="text-stats-eyebrow">{get("stats.eyebrow")}</span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3 text-primary-foreground">
            <span data-testid="text-stats-title">{get("stats.title")}</span>{get("stats.titleAccent") && " "}{get("stats.titleAccent") && <span className="text-gradient-gold" data-testid="text-stats-title-accent">{get("stats.titleAccent")}</span>}
          </h2>
          <motion.div
            className="gold-divider w-24 mx-auto mt-6"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="relative group"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                {/* Glassmorphism card */}
                <div className="backdrop-blur-xl bg-primary-foreground/5 border border-primary/20 rounded-2xl p-6 md:p-8 text-center hover:bg-primary-foreground/10 hover:border-primary/40 transition-all duration-500 group-hover:shadow-[0_0_40px_-10px_hsl(43,72%,48%,0.3)]">
                  <motion.div
                    className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-4"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="w-7 h-7 text-primary" />
                  </motion.div>
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} inView={inView} />
                  <p className="text-primary-foreground font-heading font-semibold mt-3 text-sm md:text-base">{stat.label}</p>
                  <p className="text-primary-foreground/50 text-xs mt-1">{stat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
