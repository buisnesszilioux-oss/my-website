import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, type Industry } from "@/lib/api";

const ApplicationsSection = () => {
  const { data, isLoading } = useQuery<Industry[]>({ queryKey: ["/api/industries"], queryFn: () => api("/api/industries") });
  const industries = (data || []).slice(0, 12);

  return (
    <section id="applications" className="py-20 md:py-28 bg-secondary/20">
      <div className="container">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary inline-block">
            Industries Served
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3 text-foreground">
            Applications & <span className="text-gradient-gold">Industries</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Precision-engineered fastening solutions designed for the world's most demanding environments. Serving 50+ global industries with ISO-certified quality.
          </p>
          <div className="gold-divider w-24 mx-auto mt-6" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-secondary/50 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {industries.map((industry) => (
              <Link
                key={industry.slug}
                to={`/industry/${industry.slug}`}
                data-testid={`link-industry-${industry.slug}`}
                className="group block relative rounded-lg overflow-hidden shadow-md hover:shadow-gold transition-all duration-300 aspect-[4/3]"
              >
                <img
                  src={industry.image}
                  alt={`${industry.name} - Industrial Fasteners Application`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                  <h3 className="font-heading text-white text-xs md:text-sm font-semibold leading-tight">{industry.name}</h3>
                  <span className="inline-flex items-center gap-1 text-primary text-[10px] md:text-xs font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/applications" data-testid="link-all-applications" className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-gradient-gold text-charcoal font-semibold hover:opacity-90 transition">
            View All 50+ Industries <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ApplicationsSection;
