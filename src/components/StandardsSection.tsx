import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, type Standard } from "@/lib/api";
import { ArrowRight, Award } from "lucide-react";

const StandardsSection = () => {
  const { data, isLoading } = useQuery<Standard[]>({ queryKey: ["/api/standards"], queryFn: () => api("/api/standards") });
  const standards = data || [];

  return (
    <section id="standards" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary inline-block">
            Engineering Integrity
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3 text-foreground">
            Comprehensive <span className="text-gradient-gold">Standards</span> Overview
          </h2>
          <p className="text-muted-foreground mt-4 max-w-3xl mx-auto">
            Every fastener we manufacture is engineered to the world's most rigorous international standards — guaranteeing dimensional accuracy, mechanical integrity, and metallurgical excellence across every application.
          </p>
          <div className="gold-divider w-24 mx-auto mt-6" />
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-secondary/50 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {standards.map((s) => (
              <Link
                key={s.slug}
                to={`/standards/${s.slug}`}
                data-testid={`link-standard-${s.slug}`}
                className="group bg-card rounded-lg border border-border p-6 hover:border-primary/40 hover:shadow-gold transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center">
                    <Award className="w-6 h-6 text-charcoal" />
                  </div>
                  <div>
                    <div className="font-heading text-xl font-bold text-foreground">{s.code}</div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.region}</div>
                  </div>
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground mb-2">{s.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{s.description}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore Standard <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/standards" data-testid="link-all-standards" className="inline-flex items-center gap-2 px-6 py-3 rounded-md border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition">
            Explore All Standards <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default StandardsSection;
