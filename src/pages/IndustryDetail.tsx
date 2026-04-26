import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, type Industry } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";

const IndustryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: industry, isLoading } = useQuery<Industry>({ queryKey: ["/api/industries", slug], queryFn: () => api(`/api/industries/${slug}`) });
  const { data: all } = useQuery<Industry[]>({ queryKey: ["/api/industries"], queryFn: () => api("/api/industries") });

  if (isLoading) return <PageTransition><Header /><div className="min-h-[60vh] flex items-center justify-center">Loading…</div><Footer /></PageTransition>;

  if (!industry) {
    return (
      <PageTransition>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Industry Not Found</h1>
            <Link to="/applications" className="text-primary mt-4 inline-block">← Back to Industries</Link>
          </div>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  const others = (all || []).filter((i) => i.slug !== industry.slug).slice(0, 4);

  return (
    <PageTransition>
      <Helmet>
        <title>{`${industry.name} Fasteners | M.I. Engineering Works Mumbai`}</title>
        <meta name="description" content={`${industry.description}`} />
      </Helmet>

      <Header />

      {/* Hero */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img src={industry.image} alt={industry.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        <div className="container relative z-10 h-full flex flex-col justify-end pb-12 text-primary-foreground">
          <Link to="/applications" data-testid="link-back-applications" className="inline-flex items-center gap-1 text-primary mb-4 hover:underline w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Applications
          </Link>
          <span className="text-sm tracking-[0.3em] uppercase text-primary mb-2">Industry</span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold">{industry.name}</h1>
        </div>
      </section>

      {/* Hero description */}
      <section className="py-14 md:py-20 bg-background">
        <div className="container max-w-4xl">
          <p className="text-base md:text-lg text-foreground/90 leading-relaxed">{industry.heroDescription || industry.description}</p>
        </div>
      </section>

      {/* Material Excellence / Grades */}
      {industry.grades?.length > 0 && (
        <section className="py-14 md:py-20 bg-secondary/20">
          <div className="container max-w-6xl">
            <div className="text-center mb-10">
              <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary">Material Excellence</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3 text-foreground">Recommended Grades & Specifications</h2>
              <div className="gold-divider w-24 mx-auto mt-4" />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {industry.grades.map((g, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-5 hover:border-primary/40 transition shadow-elegant">
                  <div className="font-heading text-lg font-bold text-gradient-gold">{g.grade}</div>
                  <div className="text-sm text-foreground mt-1">{g.specification}</div>
                  <div className="text-xs text-muted-foreground mt-2">{g.usage}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Applications */}
      {industry.applications?.length > 0 && (
        <section className="py-14 md:py-20 bg-background">
          <div className="container max-w-6xl">
            <div className="text-center mb-10">
              <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary">Fasteners Engineered for Your Application</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3 text-foreground">Use-Case Applications</h2>
              <div className="gold-divider w-24 mx-auto mt-4" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {industry.applications.map((a, i) => (
                <div key={i} className="bg-card rounded-lg overflow-hidden border border-border hover:border-primary/40 hover:shadow-gold transition">
                  <img src={a.image} alt={a.name} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  <div className="p-4">
                    <h3 className="font-heading text-base font-semibold text-foreground">{a.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Key Requirements */}
      {industry.keyRequirements?.length > 0 && (
        <section className="py-14 md:py-20 bg-secondary/20">
          <div className="container max-w-4xl">
            <div className="text-center mb-10">
              <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary">Quality Standards</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3 text-foreground">Key Compliance Requirements</h2>
              <div className="gold-divider w-24 mx-auto mt-4" />
            </div>
            <ul className="space-y-3">
              {industry.keyRequirements.map((r, i) => (
                <li key={i} className="flex items-start gap-3 bg-card border border-border rounded-md p-4">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Other industries */}
      {others.length > 0 && (
        <section className="py-14 md:py-20 bg-background">
          <div className="container">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-center text-foreground mb-8">Explore Other Industries</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {others.map((o) => (
                <Link key={o.slug} to={`/industry/${o.slug}`} className="group block relative rounded-lg overflow-hidden aspect-[4/3] hover:shadow-gold transition">
                  <img src={o.image} alt={o.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 p-4">
                    <h3 className="font-heading text-white font-semibold">{o.name}</h3>
                    <span className="inline-flex items-center gap-1 text-primary text-xs mt-1 opacity-0 group-hover:opacity-100 transition">
                      Explore <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </PageTransition>
  );
};

export default IndustryDetail;
