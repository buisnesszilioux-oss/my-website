import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ChevronRight, Package, ArrowRight, X, ImageOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, type Product } from "@/lib/api";

const CATEGORY_META: Record<string, { tagline: string; description: string; slug: string }> = {
  "Bolts":                 { slug: "bolts",              tagline: "All Types of Industrial Bolts",      description: "Premium grade hex, heavy hex, anchor, U-bolts, J-bolts, eye bolts, T-bolts, carriage and stud bolts manufactured to ASME, DIN and IS standards." },
  "Nuts":                  { slug: "nuts",               tagline: "High-Strength Industrial Nuts",      description: "Hex, heavy hex, coupling, flange, castle and lock nuts in MS, SS and high-tensile grades." },
  "Screws":                { slug: "screws",             tagline: "Precision Threaded Fasteners",       description: "Machine screws, cap screws, set screws, self-tapping and sheet metal screws in all sizes." },
  "Washers":               { slug: "washers",            tagline: "Flat & Spring Washers",             description: "Plain, spring, lock, tab and structural washers manufactured to DIN and IS standards." },
  "Rivets":                { slug: "rivets",             tagline: "Solid & Pop Rivets",                description: "Solid aluminium, steel and copper rivets plus blind/pop rivets for structural applications." },
  "Threaded Rods / Studs": { slug: "threaded-rods",      tagline: "Full & Partial Threaded Rods",      description: "Fully and partially threaded rods and studs in Grade B7 / B8 and metric/imperial sizes." },
  "Anchors":               { slug: "anchors",            tagline: "Foundation & Chemical Anchors",     description: "Expansion, wedge, sleeve, drop-in and chemical anchors for civil and structural use." },
  "Industrial / Heavy":    { slug: "industrial-heavy",   tagline: "Heavy-Duty Industrial Fasteners",   description: "Tower, flange, structural and high-strength bolting systems for industrial projects." },
  "Special":               { slug: "special",            tagline: "Custom & Special Fasteners",        description: "Non-standard and custom-engineered fasteners produced to drawing or specification." },
};

export default function ProductCategoriesSection() {
  const [query, setQuery] = useState("");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: () => api<Product[]>("/api/products"),
  });

  const categories = useMemo(() => {
    const map = new Map<string, Product[]>();
    products.forEach((p) => {
      const cat = p.category || "Special";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    });
    const order = Object.keys(CATEGORY_META);
    return Array.from(map.entries())
      .sort((a, b) => {
        const ai = order.indexOf(a[0]);
        const bi = order.indexOf(b[0]);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      })
      .map(([name, prods]) => ({ name, prods, meta: CATEGORY_META[name] || { slug: name.toLowerCase().replace(/\W+/g, "-"), tagline: "", description: "" } }));
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        prods: cat.prods.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.material || "").toLowerCase().includes(q) ||
            (p.description || "").toLowerCase().includes(q) ||
            cat.name.toLowerCase().includes(q)
        ),
      }))
      .filter((c) => c.prods.length > 0);
  }, [query, categories]);

  const totalProducts = products.length;
  const matchCount = useMemo(() => filtered.reduce((s, c) => s + c.prods.length, 0), [filtered]);

  return (
    <section id="products" className="py-16 md:py-24 bg-background" data-testid="section-product-categories">
      <div className="container">
        <motion.div
          className="text-center mb-10 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary">Our Products</span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3 text-foreground">
            Premium Industrial <span className="text-gradient-gold">Fasteners</span>
          </h2>
          <div className="gold-divider w-24 mx-auto mt-5" />
          <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            {totalProducts}+ products across {categories.length} categories — manufactured to ASME, DIN and IS standards and shipped from stock.
          </p>
        </motion.div>

        <div className="mb-6 max-w-2xl mx-auto">
          <div className="group relative rounded-full bg-card/70 border border-primary/20 shadow-elegant focus-within:border-primary/60 focus-within:shadow-[0_0_0_4px_hsl(var(--primary)/0.18),0_18px_45px_-15px_hsl(var(--primary)/0.45)] transition">
            <div className="flex items-center gap-2 pl-5 pr-2 py-2">
              <Search className="w-5 h-5 text-primary flex-shrink-0" aria-hidden />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products by name, material or description…"
                aria-label="Search products"
                data-testid="input-home-product-search"
                className="flex-1 bg-transparent border-0 outline-none text-sm md:text-base placeholder:text-muted-foreground/70 py-2"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear search" data-testid="button-home-search-clear" className="p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary/60 transition">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {query && (
            <div className="mt-3 text-center text-xs text-muted-foreground" data-testid="text-home-search-count">
              {matchCount === 0 ? (
                <>No products matched "<span className="text-primary font-semibold">{query}</span>"</>
              ) : (
                <>Showing <span className="text-foreground font-semibold">{matchCount}</span> match{matchCount === 1 ? "" : "es"} across {filtered.length} categor{filtered.length === 1 ? "y" : "ies"}</>
              )}
            </div>
          )}
        </div>

        {!query && (
          <div className="-mx-4 px-4 mb-10 overflow-x-auto scrollbar-thin">
            <div className="flex items-center gap-2 md:gap-2.5 min-w-max justify-center pb-2">
              {categories.map((cat) => (
                <a key={cat.meta.slug} href={`#cat-${cat.meta.slug}`} data-testid={`chip-cat-${cat.meta.slug}`} className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-primary/20 bg-card hover:bg-primary/10 hover:border-primary text-xs md:text-sm font-semibold text-foreground transition">
                  <span>{cat.name}</span>
                  <span className="text-[10px] text-muted-foreground">({cat.prods.length})</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No products match "<span className="font-semibold text-foreground">{query}</span>". Try a different keyword.</p>
            <button onClick={() => setQuery("")} data-testid="button-home-search-reset" className="mt-4 text-sm font-semibold text-primary hover:underline">Clear search</button>
          </div>
        ) : (
          <div className="space-y-12 md:space-y-16">
            {filtered.map((cat, ci) => (
              <motion.div key={cat.meta.slug} id={`cat-${cat.meta.slug}`} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: Math.min(ci * 0.04, 0.2) }} className="scroll-mt-28">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5 pb-4 border-b border-primary/15">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground" data-testid={`heading-cat-${cat.meta.slug}`}>
                      {cat.name}{" "}
                      <span className="text-sm font-normal text-muted-foreground">({cat.prods.length} products)</span>
                    </h3>
                    {cat.meta.tagline && <p className="text-sm text-primary font-semibold mt-0.5">{cat.meta.tagline}</p>}
                    {cat.meta.description && <p className="text-sm text-muted-foreground mt-1 max-w-3xl line-clamp-2">{cat.meta.description}</p>}
                  </div>
                  <Link to={`/category/${cat.meta.slug}`} data-testid={`link-view-cat-${cat.meta.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline whitespace-nowrap">
                    View Category <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {cat.prods.map((p) => (
                    <Link key={p.slug} to={`/product/${p.slug}`} data-testid={`card-product-${p.slug}`} className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-gold transition-all hover-elevate active-elevate-2">
                      <div className="aspect-square bg-gradient-to-br from-secondary/40 to-background relative overflow-hidden">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              img.style.display = "none";
                              const fb = img.nextElementSibling as HTMLElement | null;
                              if (fb) fb.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full flex-col items-center justify-center text-muted-foreground/50" style={{ display: p.image ? "none" : "flex" }}>
                          <ImageOff className="w-10 h-10 mb-1" strokeWidth={1.2} />
                          <span className="text-[9px] uppercase tracking-wider">Coming soon</span>
                        </div>
                        <span className="absolute top-2 left-2 text-[10px] font-semibold bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur">{cat.name}</span>
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-sm text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">{p.name}</h4>
                        {p.sizes && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{p.sizes}</p>}
                        <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-primary">View details <ChevronRight className="w-3 h-3" /></span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/products" data-testid="link-view-all-products" className="inline-flex items-center gap-2 px-6 py-3 rounded-md border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition">
            <Package className="w-4 h-4" /> View Full Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
