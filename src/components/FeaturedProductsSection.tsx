import { Link } from "react-router-dom";
import { ArrowRight, ImageOff } from "lucide-react";
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
  return (
    <section
      id="featured-products"
      className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/30"
      data-testid="section-featured-products"
    >
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {FEATURED.map((p) => (
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
      </div>
    </section>
  );
}
