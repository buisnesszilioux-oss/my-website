import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, type Product } from "@/lib/api";
import { useActiveAnimations } from "@/hooks/useActiveAnimations";

const ALL_CATEGORIES = [
  "All",
  "Bolts",
  "Nuts",
  "Screws",
  "Washers",
  "Rivets",
  "Threaded Rods / Studs",
  "Anchors",
  "Industrial / Heavy",
  "Special",
] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const Product3DCard = ({ product, animClass }: { product: Product; animClass: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 800, rotateX, rotateY, transformStyle: "preserve-3d" }}
    >
      <Link
        to={`/product/${product.slug}`}
        className={`group block bg-card rounded-lg border border-border hover:border-primary/40 transition-all duration-300 overflow-hidden shadow-elegant hover:shadow-gold ${animClass}`}
        data-testid={`card-product-${product.slug}`}
      >
        <div className="aspect-square bg-secondary/30 flex items-center justify-center p-4 overflow-hidden relative">
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ transform: "translateZ(20px)" }}
          />
          <motion.img
            src={product.image}
            alt={`${product.name} - ${product.standard}`}
            loading="lazy"
            width={512}
            height={512}
            className="w-full h-full object-contain"
            whileHover={{ scale: 1.12, rotate: 2 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (!img.dataset.fallback) {
                img.dataset.fallback = "1";
                img.src = `https://placehold.co/512x512/1f2937/d4af37/png?text=${encodeURIComponent(product.name)}`;
              }
            }}
          />
        </div>
        <motion.div className="p-4 text-center border-t border-border" whileHover={{ backgroundColor: "hsl(var(--primary) / 0.05)" }}>
          <h3 className="font-heading text-sm md:text-base font-semibold text-foreground line-clamp-1">{product.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{product.standard}</p>
          <span className="inline-block mt-2 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            View Details →
          </span>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export interface ProductsSectionProps {
  /** When true, show search + category filter bar (used on /products). */
  withFilters?: boolean;
  /** Hide the section heading (useful for embeds). */
  hideHeading?: boolean;
}

const ProductsSection = ({ withFilters = false, hideHeading = false }: ProductsSectionProps) => {
  const { product: anim } = useActiveAnimations();
  const animClass = anim.cardClass || "";

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => api<Product[]>("/api/products"),
    staleTime: 30_000,
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");

  // Categories present in current data, with counts
  const categoryCounts = useMemo(() => {
    const m = new Map<string, number>();
    products.forEach((p) => m.set(p.category || "Special", (m.get(p.category || "Special") || 0) + 1));
    return m;
  }, [products]);

  const visibleCategories = useMemo(() => {
    return ALL_CATEGORIES.filter((c) => c === "All" || categoryCounts.has(c));
  }, [categoryCounts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "All" && (p.category || "Special") !== category) return false;
      if (!q) return true;
      const hay = `${p.name} ${p.standard} ${p.description} ${p.material} ${(p.applications || []).join(" ")} ${(p.grades || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [products, search, category]);

  return (
    <section id="products" className="py-16 md:py-24 bg-background">
      <div className="container">
        {!hideHeading && (
          <motion.div
            className="text-center mb-10 md:mb-14"
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
          </motion.div>
        )}

        {withFilters && (
          <div className="mb-8 md:mb-10 space-y-5">
            {/* Search bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name, standard, material, application…"
                data-testid="input-product-search"
                className="w-full pl-12 pr-12 py-3 rounded-full bg-card border border-border focus:border-primary/60 outline-none text-sm md:text-base text-foreground placeholder:text-muted-foreground shadow-sm focus:shadow-gold transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  data-testid="button-clear-search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary/60"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Horizontal category bar */}
            <div className="-mx-4 px-4 overflow-x-auto scrollbar-thin">
              <div className="flex items-center gap-2 md:gap-3 min-w-max justify-center pb-2">
                {visibleCategories.map((c) => {
                  const count = c === "All" ? products.length : categoryCounts.get(c) || 0;
                  const active = category === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      data-testid={`category-chip-${c.replace(/\s+/g, "-").toLowerCase()}`}
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-xs md:text-sm font-medium border transition-all ${
                        active
                          ? "bg-gradient-gold text-charcoal border-transparent shadow-gold"
                          : "bg-card text-foreground/75 border-border hover:border-primary/50 hover:text-primary"
                      }`}
                    >
                      {c} <span className={`ml-1 text-[10px] ${active ? "text-charcoal/70" : "text-muted-foreground"}`}>({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Result summary */}
            <div className="text-center text-xs md:text-sm text-muted-foreground">
              {isLoading ? (
                "Loading products…"
              ) : (
                <>
                  Showing <span className="text-primary font-semibold">{filtered.length}</span> of {products.length} products
                  {category !== "All" && <> in <span className="text-primary font-semibold">{category}</span></>}
                  {search && <> matching “<span className="text-primary font-semibold">{search}</span>”</>}
                </>
              )}
            </div>
          </div>
        )}

        {filtered.length === 0 && !isLoading ? (
          <div className="text-center py-16">
            <p className="text-lg text-foreground/80 mb-2">No products found.</p>
            <p className="text-sm text-muted-foreground mb-6">Try a different search term or category.</p>
            <button
              type="button"
              onClick={() => { setSearch(""); setCategory("All"); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-gold text-charcoal text-sm font-semibold"
              data-testid="button-reset-filters"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <motion.div
            key={`${category}-${search}`}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((p) => (
              <Product3DCard key={p.slug} product={p} animClass={animClass} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
