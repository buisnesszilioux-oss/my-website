import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, type Standard } from "@/lib/api";
import { ArrowRight, Award } from "lucide-react";

const StandardsSection = () => {
  const { data, isLoading } = useQuery<Standard[]>({ queryKey: ["/api/standards"], queryFn: () => api("/api/standards") });
  const standards = data || [];

  return (
    <section id="standards" className="py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="container relative z-10">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary inline-block">
            Engineering Integrity
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3 text-foreground">
            Comprehensive <span className="text-gradient-gold">Standards</span> Overview
          </h2>
          <p className="text-muted-foreground mt-4 max-w-3xl mx-auto">
            Every fastener we manufacture is engineered to the world's most rigorous international standards.
          </p>
          <div className="gold-divider w-24 mx-auto mt-6" />
        </div>

        {isLoading ? (
          <div className="flex gap-6 justify-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-28 h-32 bg-secondary/50 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-end justify-center gap-x-6 gap-y-12 md:gap-x-10 md:gap-y-14 px-2">
            {standards.map((s, idx) => (
              <Link
                key={s.slug}
                to={`/standards/${s.slug}`}
                data-testid={`link-standard-${s.slug}`}
                className="group flex flex-col items-center text-center w-32 md:w-40 anim-card-float"
                style={{
                  animationDelay: `${(idx % 6) * 0.45}s`,
                  animationDuration: `${4.5 + (idx % 5)}s`,
                }}
              >
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-gold flex items-center justify-center shadow-[0_10px_30px_-8px_hsl(210_100%_56%/0.55)] group-hover:shadow-[0_14px_40px_-8px_hsl(210_100%_56%/0.85)] transition-all">
                  <Award className="w-9 h-9 md:w-10 md:h-10 text-charcoal" />
                  <div className="absolute -inset-1 rounded-full ring-1 ring-primary/30 group-hover:ring-primary/60 transition" />
                </div>
                <div className="mt-3 font-heading text-lg md:text-xl font-bold text-foreground leading-tight">
                  {s.code}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.region || "International"}
                </div>
                <div className="mt-1 text-xs md:text-sm text-foreground/80 line-clamp-2 max-w-[10rem]">
                  {s.name}
                </div>
                <span className="inline-flex items-center gap-1 text-primary text-[11px] md:text-xs font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/standards"
            data-testid="link-all-standards"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition"
          >
            Explore All Standards <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default StandardsSection;
