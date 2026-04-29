import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { ArrowRight, ImageOff, Search, X } from "lucide-react";
import { categories, PRODUCT_IMAGES } from "@/data/categories";

type Featured = {
  name: string;
  image?: string;
  category: string;
  catSlug: string;
  prodSlug: string;
  blurb: string;
};

const FEATURED: Featured[] = categories.flatMap((cat) =>
  cat.products.map((p) => ({
    name: p.name,
    image: p.image || PRODUCT_IMAGES[p.slug],
    category: cat.name,
    catSlug: cat.slug,
    prodSlug: p.slug,
    blurb: p.description,
  }))
);

export default function FeaturedProductsSection() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FEATURED;
    return FEATURED.filter((p) =>
      `${p.name} ${p.category} ${p.blurb}`.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <section
      id="featured-products"
      className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/30"
      data-testid="section-featured-products"
    >
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">
              Premium Industrial Fasteners
            </span>
            <h2 className="mt-2 font-heading text-3xl md:text-4xl font-bold text-foreground">
              Featured Products
            </h2>
            <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">
              Our complete catalog of industrial fasteners, manufactured to ASME, DIN and IS standards
              and shipped from stock.
            </p>
          </div>
          <Link
            to="/products"
            data-testid="link-view-all-products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline shrink-0"
          >
            View all categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Search bar */}
        <div className="mb-8 md:mb-10 max-w-2xl mx-auto">
          <div className="group relative rounded-full bg-card/70 border border-primary/20 shadow-elegant focus-within:border-primary/60 focus-within:shadow-[0_0_0_4px_hsl(var(--primary)/0.18),0_18px_45px_-15px_hsl(var(--primary)/0.45)] transition">
            <div className="flex items-center gap-2 pl-5 pr-2 py-2">
              <Search className="w-5 h-5 text-primary flex-shrink-0" aria-hidden />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products by name, category or description…"
                aria-label="Search featured products"
                data-testid="input-home-product-search"
                className="flex-1 bg-transparent border-0 outline-none text-sm md:text-base placeholder:text-muted-foreground/70 py-2"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  data-testid="button-home-search-clear"
                  className="p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary/60 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  document.getElementById("featured-products-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                data-testid="button-home-search-go"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-gold text-charcoal text-sm font-semibold shadow-gold hover:opacity-90 transition"
              >
                <Search className="w-4 h-4" /> <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>
          <div className="mt-3 text-center text-xs text-muted-foreground" data-testid="text-home-search-count">
            Showing <span className="text-foreground font-semibold">{filtered.length}</span> of {FEATURED.length} products
            {query && <> matching "<span className="text-primary font-semibold">{query}</span>"</>}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-sm text-muted-foreground mb-4">No products matched your search.</p>
            <button
              type="button"
              onClick={() => setQuery("")}
              data-testid="button-home-search-reset"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-gold text-charcoal text-sm font-semibold"
            >
              Reset search
            </button>
          </div>
        ) : (
        <div id="featured-products-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {filtered.map((p) => (
            <Link
              key={`${p.catSlug}-${p.prodSlug}`}
              to={`/category/${p.catSlug}?p=${p.prodSlug}`}
              data-testid={`card-featured-${p.prodSlug}`}
              className="product-3d group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all"
            >
              <div className="aspect-[4/3] overflow-hidden bg-secondary/40 flex items-center justify-center">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                    style={{ imageRendering: "auto" }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground/60 p-6">
                    <ImageOff className="w-12 h-12 mb-2" strokeWidth={1.4} />
                    <span className="text-[11px] uppercase tracking-wider">Image coming soon</span>
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className="text-[11px] font-semibold tracking-[0.2em] text-primary uppercase">
                  {p.category}
                </span>
                <h3 className="mt-1 font-heading text-lg font-bold text-foreground group-hover:text-primary transition">
                  {p.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">
                  {p.blurb}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  View details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
