import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChevronRight, FileText, MessageSquareQuote, Package } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";
import { categories, getCategoryBySlug, PRODUCT_IMAGES } from "@/data/categories";

export default function CategoryPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const cat = getCategoryBySlug(slug);
  const [params, setParams] = useSearchParams();
  const initialProd = params.get("p") || cat?.products[0]?.slug || "";
  const [activeSlug, setActiveSlug] = useState<string>(initialProd);

  useEffect(() => {
    const first = cat?.products[0]?.slug || "";
    const fromParam = params.get("p");
    setActiveSlug(fromParam && cat?.products.some((p) => p.slug === fromParam) ? fromParam : first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const active = useMemo(
    () => cat?.products.find((p) => p.slug === activeSlug) || cat?.products[0],
    [cat, activeSlug],
  );

  const selectProduct = (s: string) => {
    setActiveSlug(s);
    const next = new URLSearchParams(params);
    next.set("p", s);
    setParams(next, { replace: true });
  };

  if (!cat) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center text-center px-6">
            <div>
              <h1 className="font-heading text-3xl font-bold mb-3">Category Not Found</h1>
              <p className="text-muted-foreground mb-6">The category you are looking for does not exist.</p>
              <Link to="/products" className="text-primary hover:underline">← View all categories</Link>
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEO
        title={`${cat.name} — Industrial Fasteners | M.I. Engineering Works`}
        description={cat.description}
        keywords={[cat.name.toLowerCase(), ...cat.products.map((p) => p.name.toLowerCase())]}
        path={`/category/${cat.slug}`}
      />
      <Header />

      {/* Breadcrumb / hero */}
      <section className="bg-secondary/30 border-b border-border">
        <div className="container py-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/products" className="hover:text-primary">Products</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary font-semibold">{cat.name}</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-gold text-charcoal text-2xl flex items-center justify-center shrink-0 shadow-gold">
              <span aria-hidden>{cat.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">{cat.name}</h1>
              <p className="text-sm text-primary font-semibold mt-1">{cat.tagline}</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-3xl">{cat.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Split layout */}
      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

          {/* Left: product list */}
          <aside className="bg-card rounded-xl border border-border overflow-hidden lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)]">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-secondary/40">
              <Package className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">{cat.name} ({cat.products.length})</h2>
            </div>
            <ul className="overflow-y-auto max-h-[60vh] lg:max-h-[calc(100vh-11rem)]">
              {cat.products.map((p) => {
                const isActive = p.slug === active?.slug;
                return (
                  <li key={p.slug}>
                    <button
                      type="button"
                      onClick={() => selectProduct(p.slug)}
                      data-testid={`btn-product-${p.slug}`}
                      className={`w-full text-left px-4 py-3 border-l-4 transition flex items-start gap-2 hover:bg-secondary/50 ${
                        isActive
                          ? "bg-primary/10 border-primary text-primary font-semibold"
                          : "border-transparent text-foreground/85"
                      }`}
                    >
                      <ChevronRight className={`w-4 h-4 mt-0.5 shrink-0 transition ${isActive ? "text-primary" : "text-muted-foreground/50"}`} />
                      <span className="text-sm leading-snug">{p.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Right: product detail */}
          <section className="bg-card rounded-xl border border-border p-6 md:p-8">
            {active ? (
              <article key={active.slug} className="animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                  <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">{cat.name}</span>
                </div>
                <h2 data-testid="text-active-product-name" className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                  {active.name}
                </h2>

                {/* Product image */}
                <div className="mt-6 rounded-xl overflow-hidden border border-border bg-secondary/30 aspect-[16/10] flex items-center justify-center">
                  {active.image || PRODUCT_IMAGES[active.slug] ? (
                    <img
                      src={active.image || PRODUCT_IMAGES[active.slug]}
                      alt={active.name}
                      data-testid={`img-product-${active.slug}`}
                      className="w-full h-full object-contain p-4"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-center px-6">
                      <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-2" />
                      <div className="text-xs text-muted-foreground">Reference image available on request</div>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  <Spec label="Material" value={active.material} />
                  <Spec label="Sizes" value={active.sizes} />
                </div>

                <div className="mt-6">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-2">Description</div>
                  <p className="text-sm md:text-base text-foreground/85 leading-relaxed">{active.description}</p>
                </div>

                {/* Buttons row — Grade Chart + Get Quote */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/grade-chart"
                    data-testid="btn-grade-chart"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-primary/40 text-primary font-semibold hover:bg-primary/10 transition"
                  >
                    <FileText className="w-4 h-4" /> View Grade Chart
                  </Link>
                  <Link
                    to={`/quote?product=${encodeURIComponent(active.name)}&category=${encodeURIComponent(cat.name)}`}
                    data-testid="btn-get-quote"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-gold text-charcoal font-semibold hover:opacity-90 transition shadow-gold"
                  >
                    <MessageSquareQuote className="w-4 h-4" /> Get a Quote
                  </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground">
                  Need a custom size, material or finish? <Link to="/contact" className="text-primary hover:underline font-semibold">Contact our engineers →</Link>
                </div>
              </article>
            ) : (
              <p className="text-sm text-muted-foreground">Select a product on the left to see details.</p>
            )}
          </section>
        </div>

        {/* Other categories */}
        <section className="mt-12 pt-8 border-t border-border">
          <h3 className="font-heading text-lg font-semibold mb-4">Browse Other Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.filter((c) => c.slug !== cat.slug).map((c) => (
              <Link
                key={c.slug}
                to={`/category/${c.slug}`}
                data-testid={`link-cat-${c.slug}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-secondary/40 transition text-sm"
              >
                <span aria-hidden>{c.icon}</span>
                <span className="truncate">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
}

const Spec = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-secondary/40 border border-border rounded-lg p-4">
    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">{label}</div>
    <div className="text-sm md:text-[15px] text-foreground mt-1.5 leading-relaxed">{value}</div>
  </div>
);
