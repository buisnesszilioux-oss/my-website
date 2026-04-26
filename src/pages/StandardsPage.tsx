import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Award, ShieldCheck, FileCheck2, Layers, ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { api, type Standard } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";
import { useHeroImage } from "@/hooks/useHeroImage";

const StandardsPage = () => {
  const { data, isLoading } = useQuery<Standard[]>({ queryKey: ["/api/standards"], queryFn: () => api("/api/standards") });
  const heroImage = useHeroImage("standards");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [letter, setLetter] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const arr = [...(data || [])];
    arr.sort((a, b) => (a.code || "").localeCompare(b.code || "", undefined, { numeric: true, sensitivity: "base" }));
    if (sortDir === "desc") arr.reverse();
    return arr;
  }, [data, sortDir]);

  const letters = useMemo(() => {
    const s = new Set<string>();
    for (const x of data || []) {
      const ch = (x.code || x.name || "").trim().charAt(0).toUpperCase();
      if (ch) s.add(ch);
    }
    return Array.from(s).sort();
  }, [data]);

  const standards = useMemo(() => {
    if (!letter) return sorted;
    return sorted.filter((s) => (s.code || s.name || "").trim().charAt(0).toUpperCase() === letter);
  }, [sorted, letter]);

  return (
    <PageTransition>
      <SEO
        title="Standards Archive — ASTM, DIN, ISO, BS, IS, SAE"
        description="M.I. Engineering Works manufactures fasteners to the highest international standards — ASTM A193, ANSI/ASME B16.5, DIN 976, ISO 4014, BS, IS, SAE, EN, UNI. Full material traceability and EN 10204 mill test certificates."
        keywords={[
          "ASTM A193 B7 standard",
          "DIN 976 threaded rods standard",
          "ISO 4014 hex bolts standard",
          "ANSI ASME B16.5 stud bolts",
          "fastener standards India",
          "BS 1769 bolts standard",
          "IS 1367 fasteners standard",
          "SAE J429 bolt grades",
          "EN 10204 mill test certificate",
          "international fastener standards Mumbai",
        ]}
        path="/standards"
      />

      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-dark text-primary-foreground py-24 md:py-32 overflow-hidden">
        {heroImage && (
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/60 to-background/95" />
        <div className="container relative z-10 text-center">
          <span className="text-xs md:text-sm font-semibold tracking-[0.4em] uppercase text-primary inline-block">Engineering Integrity</span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mt-4 mb-5 leading-[1.1] tracking-tight">
            Precision Fasteners Built to <span className="text-gradient-gold">Global Standards</span>
          </h1>
          <div className="gold-divider w-24 mx-auto mb-5" />
          <p className="max-w-3xl mx-auto text-base md:text-lg text-primary-foreground/80 leading-relaxed">
            Every fastener we produce conforms to the most demanding international specifications — ensuring dimensional accuracy, mechanical integrity, and full traceability across every project.
          </p>
        </div>
      </section>

      {/* Why Standards Matter */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary">Why Standards Matter</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3 text-foreground">Quality Assurance & Testing</h2>
            <div className="gold-divider w-24 mx-auto mt-4" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: ShieldCheck, title: "Engineering Reliability", text: "Standardised mechanical properties guarantee predictable joint performance under load, vibration, and temperature." },
              { icon: FileCheck2, title: "Material Traceability", text: "EN 10204 3.1/3.2 mill test certificates accompany every batch with full chemistry and mechanical data." },
              { icon: Award, title: "Global Acceptance", text: "Compliance with ASTM, DIN, ISO, EN ensures interchangeability and acceptance in every export market." },
              { icon: Layers, title: "Quality Inspection", text: "100% dimensional checks, hardness testing, and tensile sampling on every production lot." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-card rounded-lg border border-border p-6 text-center shadow-elegant hover:shadow-gold hover:border-primary/30 transition">
                <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-charcoal" />
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Standards grid */}
      <section className="py-16 md:py-24 bg-secondary/20">
        <div className="container">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary">Standards Archive</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3 text-foreground">
              Comprehensive <span className="text-gradient-gold">Standards</span> Overview
            </h2>
            <div className="gold-divider w-24 mx-auto mt-4" />
          </div>

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
                data-testid="button-sort-standards"
                className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-border bg-card hover:border-primary/50 transition"
                title={`Sort ${sortDir === "asc" ? "Z → A" : "A → Z"}`}
              >
                {sortDir === "asc" ? <ArrowDownAZ className="w-4 h-4" /> : <ArrowUpAZ className="w-4 h-4" />}
                {sortDir === "asc" ? "A → Z" : "Z → A"}
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-72 bg-card animate-pulse rounded-lg" />)}
            </div>
          ) : standards.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">
              No standards found for letter <strong>{letter}</strong>.
              <button onClick={() => setLetter(null)} className="ml-2 text-primary underline">Show all</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {standards.map((s) => (
                <Link
                  key={s.slug}
                  to={`/standards/${s.slug}`}
                  data-testid={`card-standard-${s.slug}`}
                  className="group bg-card rounded-lg border border-border overflow-hidden hover:border-primary/40 hover:shadow-gold transition flex flex-col"
                >
                  {s.image && (
                    <div className="aspect-[16/9] overflow-hidden bg-secondary">
                      <img src={s.image} alt={s.code} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-heading text-2xl font-bold text-gradient-gold">{s.code}</div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-1 rounded-full">{s.region}</span>
                    </div>
                    <h3 className="font-heading text-base font-semibold text-foreground mb-2">{s.name}</h3>
                    <p className="text-sm text-muted-foreground flex-1 line-clamp-3">{s.description}</p>
                    <div className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-medium">
                      View Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
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

export default StandardsPage;
