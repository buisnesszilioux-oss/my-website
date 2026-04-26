import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Globe2, Layers, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, type Industry } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";

const ApplicationsPage = () => {
  const { data, isLoading } = useQuery<Industry[]>({ queryKey: ["/api/industries"], queryFn: () => api("/api/industries") });
  const industries = data || [];

  return (
    <PageTransition>
      <SEO
        title="Applications & Industries — Global Engineering Solutions"
        description="Precision-engineered fastening solutions for the world's most demanding environments. M.I. Engineering Works supplies ASTM A193 Grade B7 fasteners to 50+ industries — oil & gas, aerospace, power, construction, and more — from Mumbai, India."
        keywords={[
          "fasteners for oil and gas",
          "fasteners for aerospace",
          "fasteners for power plants",
          "fasteners for construction",
          "industrial fasteners applications",
          "ASTM A193 B7 industries",
          "engineering fasteners Mumbai India",
          "fasteners supplier for petrochemical",
          "pressure vessel bolts",
          "fasteners for automotive industry",
        ]}
        path="/applications"
      />

      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-dark py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1600&q=80)", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="container relative z-10 text-center text-primary-foreground">
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary inline-block">Global Engineering Solutions</span>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold mt-3">Applications</h1>
          <p className="max-w-3xl mx-auto text-base md:text-lg text-primary-foreground/80 mt-5">
            Precision-engineered fastening solutions designed for the world's most demanding environments. From deep-sea extraction to aerospace exploration, we secure the future of global industry.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <a href="#industries" className="px-6 py-3 rounded-md bg-gradient-gold text-charcoal font-semibold hover:opacity-90 transition">Explore Industries</a>
            <Link to="/standards" className="px-6 py-3 rounded-md border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-charcoal transition">Explore Standards</Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14 max-w-5xl mx-auto">
            {[
              { icon: Globe2, num: "50+", title: "Global Industries", sub: "Wide Coverage" },
              { icon: ShieldCheck, num: "ISO Certified", title: "Quality", sub: "Compliance ASTM & DIN" },
              { icon: Layers, num: "20+", title: "Core Sectors", sub: "Specialized Alloys" },
              { icon: Award, num: "Doorstep", title: "Global Supply", sub: "Reliable Delivery" },
            ].map(({ icon: Icon, num, title, sub }) => (
              <div key={title} className="bg-card/10 backdrop-blur-md border border-white/10 rounded-lg p-5 text-center">
                <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="font-heading text-2xl font-bold text-primary">{num}</div>
                <div className="text-sm text-primary-foreground/90 font-semibold">{title}</div>
                <div className="text-xs text-primary-foreground/60 mt-1">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-4xl text-center">
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary">Industries Served</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3 text-foreground">Engineering Integrity in Every Connection</h2>
          <div className="gold-divider w-24 mx-auto mt-4" />
          <p className="text-muted-foreground mt-6">
            Browse our complete catalogue of industry applications. Click any sector to explore the specific fastener grades, materials, and engineering requirements we deliver.
          </p>
        </div>
      </section>

      {/* Industries Grid */}
      <section id="industries" className="py-10 md:py-16 bg-secondary/20">
        <div className="container">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 16 }).map((_, i) => <div key={i} className="aspect-[4/3] bg-card animate-pulse rounded-lg" />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {industries.map((industry) => (
                <Link
                  key={industry.slug}
                  to={`/industry/${industry.slug}`}
                  data-testid={`card-industry-${industry.slug}`}
                  className="group block relative rounded-xl overflow-hidden shadow-elegant hover:shadow-gold transition-all duration-500 aspect-[4/3]"
                >
                  <img src={industry.image} alt={industry.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-heading text-white text-base font-bold">{industry.name}</h3>
                    <span className="inline-flex items-center gap-1 text-primary text-xs font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      View Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </PageTransition>
  );
};

export default ApplicationsPage;
