import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Globe2, Layers, Award, ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, type Industry } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";
import { useHeroImage } from "@/hooks/useHeroImage";

const ApplicationsPage = () => {
  const { data, isLoading } = useQuery<Industry[]>({ queryKey: ["/api/industries"], queryFn: () => api("/api/industries") });
  const heroImage = useHeroImage("applications");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [letter, setLetter] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const arr = [...(data || [])];
    arr.sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, { numeric: true, sensitivity: "base" }));
    if (sortDir === "desc") arr.reverse();
    return arr;
  }, [data, sortDir]);

  const letters = useMemo(() => {
    const s = new Set<string>();
    for (const x of data || []) {
      const ch = (x.name || "").trim().charAt(0).toUpperCase();
      if (ch) s.add(ch);
    }
    return Array.from(s).sort();
  }, [data]);

  const industries = useMemo(() => {
    if (!letter) return sorted;
    return sorted.filter((i) => (i.name || "").trim().charAt(0).toUpperCase() === letter);
  }, [sorted, letter]);

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
        {heroImage && (
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/55 to-charcoal/85" />
        <div className="container relative z-10 text-center text-primary-foreground">
          <span className="text-xs md:text-sm font-semibold tracking-[0.4em] uppercase text-primary inline-block">Global Engineering Solutions</span>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold mt-4 leading-[1.05] tracking-tight">
            Applications
          </h1>
          <div className="gold-divider w-24 mx-auto mt-5" />
          <p className="max-w-3xl mx-auto text-base md:text-lg text-primary-foreground/80 mt-5 leading-relaxed">
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
          {/* A–Z letter index + sort toggle */}
          {!isLoading && letters.length > 0 && (
            <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setLetter(null)}
                data-testid="filter-letter-all"
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  letter === null ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                All
              </button>
              {letters.map((l) => (
                <button
                  key={l}
                  onClick={() => setLetter(l === letter ? null : l)}
                  data-testid={`filter-letter-${l}`}
                  className={`w-9 h-9 inline-flex items-center justify-center rounded-full text-sm font-bold border transition ${
                    letter === l ? "bg-primary text-primary-foreground border-primary shadow-gold" : "bg-card text-foreground border-border hover:border-primary/60"
                  }`}
                >
                  {l}
                </button>
              ))}
              <button
                onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                data-testid="button-sort-applications"
                className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-border bg-card hover:border-primary/50 transition"
                title={`Sort ${sortDir === "asc" ? "Z → A" : "A → Z"}`}
              >
                {sortDir === "asc" ? <ArrowDownAZ className="w-4 h-4" /> : <ArrowUpAZ className="w-4 h-4" />}
                {sortDir === "asc" ? "A → Z" : "Z → A"}
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 16 }).map((_, i) => <div key={i} className="aspect-[4/3] bg-card animate-pulse rounded-lg" />)}
            </div>
          ) : industries.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">
              No industries found for letter <strong>{letter}</strong>.
              <button onClick={() => setLetter(null)} className="ml-2 text-primary underline">Show all</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {industries.map((industry) => (
                <Link
                  key={industry.slug}
                  to={`/industry/${industry.slug}`}
                  data-testid={`card-industry-${industry.slug}`}
                  className="group block relative rounded-xl overflow-hidden shadow-elegant hover:shadow-gold transition-all duration-500 aspect-[4/3] border border-border/40 hover:border-primary/40"
                >
                  <img src={industry.image} alt={industry.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-heading text-white text-base md:text-lg font-bold tracking-tight leading-snug">{industry.name}</h3>
                    <span className="inline-flex items-center gap-1 text-primary text-xs font-semibold mt-1.5 opacity-90 group-hover:opacity-100 group-hover:gap-2 transition-all duration-300">
                      View Details <ArrowRight className="w-3.5 h-3.5" />
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
