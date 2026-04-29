import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ChevronRight, Package, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";
import { categories, PRODUCT_IMAGES } from "@/data/categories";
import { useHeroImage } from "@/hooks/useHeroImage";

export default function ProductsPage() {
  const heroImage = useHeroImage("products");
  const [query, setQuery] = useState("");

  const totalProducts = useMemo(
    () => categories.reduce((sum, c) => sum + c.products.length, 0),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        products: cat.products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.material.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            cat.name.toLowerCase().includes(q)
        ),
      }))
      .filter((c) => c.products.length > 0);
  }, [query]);

  const matchCount = useMemo(
    () => filtered.reduce((s, c) => s + c.products.length, 0),
    [filtered]
  );

  return (
    <PageTransition>
      <SEO
        title="Industrial Fasteners — Bolts, Nuts, Washers, Flanges, Pipe Fittings, Springs, Sheets & More"
        description="Browse our complete range of industrial products organised by category — Bolts, Nuts, Washers, Screws, Flanges, Pipe Fittings, Sheet Metal, Springs, Raw Materials and Special Fasteners. Manufactured in Mumbai by M.I. Engineering Works."
        keywords={[
          "industrial fasteners catalog",
          "stud bolts Mumbai",
          "flanges manufacturer",
          "pipe fittings supplier",
          "springs manufacturer",
          "sheet metal fabrication",
          "raw materials supplier India",
        ]}
        path="/products"
      />
      <Header />

      <main>
        {/* HERO */}
        <section className="relative bg-gradient-dark py-20 md:py-28 overflow-hidden">
          {heroImage && (
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: `url(${heroImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/55 to-charcoal/85" />
          <div className="container relative z-10 text-center">
            <span className="text-xs md:text-sm font-semibold tracking-[0.4em] uppercase text-primary drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              Complete Product Range
            </span>
            <h1 className="font-heading text-4xl md:text-6xl font-bold mt-4 leading-[1.1] tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
              Our <span className="text-gradient-gold">Products</span>
            </h1>
            <div className="gold-divider w-24 mx-auto mt-5" />
            <p className="mt-5 max-w-2xl mx-auto text-white/90 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              {totalProducts}+ products across {categories.length} categories — Bolts, Nuts, Washers,
              Screws, Flanges, Pipe Fittings, Sheet Metal, Springs, Raw Materials and Special Fasteners.
            </p>
          </div>
        </section>

        {/* CATEGORY JUMP NAV + SEARCH */}
        <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="container py-4">
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, materials, sizes…"
                  data-testid="input-products-search"
                  className="w-full bg-card border border-primary/20 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </div>
              {/* Category chips */}
              <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
                {categories.map((cat) => (
                  <a
                    key={cat.slug}
                    href={`#cat-${cat.slug}`}
                    data-testid={`chip-cat-${cat.slug}`}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-card hover:bg-primary/10 hover:border-primary text-xs font-semibold text-foreground transition"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      ({cat.products.length})
                    </span>
                  </a>
                ))}
              </div>
            </div>
            {query && (
              <p className="mt-2 text-xs text-muted-foreground">
                {matchCount === 0
                  ? "No products match your search."
                  : `Showing ${matchCount} match${matchCount === 1 ? "" : "es"} across ${filtered.length} categor${filtered.length === 1 ? "y" : "ies"}.`}
              </p>
            )}
          </div>
        </section>

        {/* CATEGORIES + PRODUCTS */}
        <section className="py-10 md:py-14 bg-secondary/20">
          <div className="container space-y-12 md:space-y-16">
            {filtered.map((cat, ci) => (
              <motion.div
                key={cat.slug}
                id={`cat-${cat.slug}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: Math.min(ci * 0.04, 0.2) }}
                className="scroll-mt-40"
              >
                {/* Category header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5 pb-4 border-b border-primary/15">
                  <div className="flex-1">
                    <h2
                      className="font-heading text-2xl md:text-3xl font-bold text-foreground"
                      data-testid={`heading-cat-${cat.slug}`}
                    >
                      {cat.name}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        ({cat.products.length} products)
                      </span>
                    </h2>
                    <p className="text-sm text-primary font-semibold mt-0.5">{cat.tagline}</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
                      {cat.description}
                    </p>
                  </div>
                  <Link
                    to={`/category/${cat.slug}`}
                    data-testid={`link-view-cat-${cat.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline whitespace-nowrap"
                  >
                    View Category <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Products grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {cat.products.map((p) => {
                    const img = PRODUCT_IMAGES[p.slug];
                    return (
                      <Link
                        key={p.slug}
                        to={`/product/${p.slug}`}
                        data-testid={`card-product-${p.slug}`}
                        className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-gold transition-all hover-elevate active-elevate-2"
                      >
                        <div className="aspect-square bg-gradient-to-br from-secondary/40 to-background relative overflow-hidden">
                          {img ? (
                            <img
                              src={img}
                              alt={p.name}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-12 h-12 text-primary/30" />
                            </div>
                          )}
                          <span className="absolute top-2 left-2 text-[10px] font-semibold bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur">
                            {cat.name}
                          </span>
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-sm text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                            {p.name}
                          </h3>
                          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                            {p.sizes}
                          </p>
                          <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-primary">
                            View details <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No products match <span className="font-semibold text-foreground">"{query}"</span>.
                  Try a different keyword.
                </p>
                <button
                  onClick={() => setQuery("")}
                  data-testid="button-clear-search"
                  className="mt-4 text-sm font-semibold text-primary hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
}
