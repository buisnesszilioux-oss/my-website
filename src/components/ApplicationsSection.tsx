import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, type Industry } from "@/lib/api";

const ApplicationsSection = () => {
  const { data, isLoading } = useQuery<Industry[]>({ queryKey: ["/api/industries"], queryFn: () => api("/api/industries") });
  const industries = (data || []).slice(0, 12);

  return (
    <section id="applications" className="py-20 md:py-28 bg-secondary/20 relative overflow-hidden">
      <div className="container relative z-10">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary inline-block">
            Industries Served
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3 text-foreground">
            Applications & <span className="text-gradient-gold">Industries</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Precision-engineered fastening solutions designed for the world's most demanding environments.
          </p>
          <div className="gold-divider w-24 mx-auto mt-6" />
        </div>

        {isLoading ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-44 h-44 flex-shrink-0 bg-secondary/50 animate-pulse rounded-full" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-end justify-center gap-x-6 gap-y-12 md:gap-x-10 md:gap-y-14 px-2">
            {industries.map((industry, idx) => (
              <Link
                key={industry.slug}
                to={`/industry/${industry.slug}`}
                data-testid={`link-industry-${industry.slug}`}
                className="group flex flex-col items-center text-center w-32 md:w-40 anim-card-float"
                style={{
                  animationDelay: `${(idx % 6) * 0.4}s`,
                  animationDuration: `${4 + (idx % 5)}s`,
                }}
              >
                <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden ring-1 ring-primary/30 shadow-[0_10px_30px_-8px_hsl(210_100%_56%/0.45)] group-hover:ring-primary/70 group-hover:shadow-[0_14px_40px_-8px_hsl(210_100%_56%/0.7)] transition-all">
                  <img
                    src={industry.image}
                    alt={`${industry.name} fasteners application`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <h3 className="mt-3 font-heading text-sm md:text-base font-semibold text-foreground leading-tight">
                  {industry.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-primary text-[11px] md:text-xs font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/applications"
            data-testid="link-all-applications"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-gold text-charcoal font-semibold hover:opacity-90 transition shadow-gold"
          >
            View All 50+ Industries <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ApplicationsSection;
