import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Phone, Mail, Search, Package, ChevronRight } from "lucide-react";
import { getProductBySlug, products, type Product as RichProduct } from "@/data/products";
import { categories, PRODUCT_IMAGES } from "@/data/categories";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

type ResolvedProduct = RichProduct & { categorySlug?: string; categoryName?: string };

/**
 * Resolve a product slug from either the rich `products.ts` source or any
 * sub-product in `categories.ts`. When found in categories, sensible default
 * detail fields are filled so every product can render the same rich page.
 */
function resolveProduct(slug: string): ResolvedProduct | null {
  const rich = getProductBySlug(slug);
  if (rich) {
    const cat = categories.find((c) => c.products.some((p) => p.slug === rich.slug));
    return { ...rich, categorySlug: cat?.slug, categoryName: cat?.name };
  }
  for (const cat of categories) {
    const cp = cat.products.find((p) => p.slug === slug);
    if (!cp) continue;
    const img = cp.image || PRODUCT_IMAGES[cp.slug] || PRODUCT_IMAGES[cp.slug.replace(/s$/, "")] || "";
    return {
      slug: cp.slug,
      name: cp.name,
      img,
      standard: cat.tagline,
      description: cp.description,
      sizes: cp.sizes,
      threads: "Metric (Coarse & Fine) | UNC / UNF / BSW (as applicable)",
      length: "Standard & custom lengths on request",
      material: cp.material,
      finish: ["Plain / Black Oxide", "Hot Dip Galvanized", "Zinc Plated", "Yellow Passivated"],
      grades: cp.material.split(/[\/|]/).map((s) => s.trim()).filter(Boolean).slice(0, 8),
      applications: [
        `${cat.name} for industrial assemblies`,
        "Pipelines, structures & flange joints",
        "Heavy machinery & equipment fabrication",
        "Maintenance & repair operations",
      ],
      dimensions: [
        { label: "Material", value: cp.material },
        { label: "Sizes", value: cp.sizes },
        { label: "Standard", value: cat.tagline },
        { label: "Quality", value: "Made-to-order with mill test certificate" },
        { label: "Finish", value: "Plain / HDG / Zinc / Custom" },
        { label: "MOQ", value: "On request — bulk pricing available" },
      ],
      categorySlug: cat.slug,
      categoryName: cat.name,
    };
  }
  return null;
}

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = useMemo(() => resolveProduct(slug || ""), [slug]);

  // SEO: Dynamic document title and meta
  useEffect(() => {
    if (product) {
      document.title = `${product.name} | M.I. Engineering Works`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", product.description);
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", product.name);

      const existingLd = document.getElementById("product-jsonld");
      if (existingLd) existingLd.remove();
      const script = document.createElement("script");
      script.id = "product-jsonld";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.img,
        sku: product.slug,
        brand: { "@type": "Brand", name: "M.I. Engineering Works" },
        manufacturer: {
          "@type": "Organization",
          name: "M.I. Engineering Works",
          address: { "@type": "PostalAddress", streetAddress: "301, Mehar Iron Bazar, Iron Market, Khedwadi, Girgaon", addressLocality: "Mumbai", addressRegion: "Maharashtra", postalCode: "400004", addressCountry: "IN" },
          telephone: "+919819972301",
          email: "mienginering17@gmail.com",
        },
        offers: { "@type": "Offer", availability: "https://schema.org/InStock", priceCurrency: "INR", seller: { "@type": "Organization", name: "M.I. Engineering Works" } },
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "127", bestRating: "5" },
      });
      document.head.appendChild(script);
      return () => { script.remove(); };
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-3xl font-bold text-foreground mb-4">Product Not Found</h1>
            <Link to="/products" className="text-primary hover:underline">← Back to Products</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Build sidebar list of category products (or fallback to other rich products).
  const category = product.categorySlug ? categories.find((c) => c.slug === product.categorySlug) : undefined;
  const sidebarItems = category
    ? category.products.map((p) => ({
        slug: p.slug,
        name: p.name,
        img: p.image || PRODUCT_IMAGES[p.slug] || "",
      }))
    : products.filter((p) => p.slug !== product.slug).slice(0, 8).map((p) => ({ slug: p.slug, name: p.name, img: p.img }));

  const relatedProducts = (category
    ? category.products.filter((p) => p.slug !== product.slug).slice(0, 4).map((p) => ({
        slug: p.slug,
        name: p.name,
        img: p.image || PRODUCT_IMAGES[p.slug] || "",
      }))
    : products.filter((p) => p.slug !== product.slug).slice(0, 4).map((p) => ({ slug: p.slug, name: p.name, img: p.img })));

  return (
    <PageTransition>
    <div className="min-h-screen">
      <Header />

      {/* Breadcrumb */}
      <motion.div
        className="bg-secondary/50 border-b border-border"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="container py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
            {category && (
              <>
                <span>/</span>
                <Link to={`/category/${category.slug}`} className="hover:text-primary transition-colors">{category.name}</Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground font-medium">{product.name}</span>
          </div>
        </div>
      </motion.div>

      {/* Product Hero with sidebar layout */}
      <section className="py-10 md:py-14 bg-background">
        <div className="container">
          <Link to={category ? `/category/${category.slug}` : "/products"} className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to {category ? category.name : "Products"}
          </Link>

          <div className="grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">

            {/* Sidebar — products in same category */}
            <aside className="bg-card rounded-xl border border-border overflow-hidden h-fit lg:sticky lg:top-24" data-testid="aside-related-category">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-secondary/40">
                <Package className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-wider">{category ? `${category.name} (${sidebarItems.length})` : "Related Products"}</h2>
              </div>
              <ul className="max-h-[60vh] lg:max-h-[calc(100vh-12rem)] overflow-y-auto">
                {sidebarItems.map((it) => {
                  const isActive = it.slug === product.slug;
                  return (
                    <li key={it.slug}>
                      <Link
                        to={`/product/${it.slug}`}
                        data-testid={`link-sidebar-${it.slug}`}
                        className={`flex items-center gap-3 px-3 py-2.5 border-l-4 transition hover:bg-secondary/50 ${
                          isActive ? "bg-primary/10 border-primary text-primary font-semibold" : "border-transparent text-foreground/85"
                        }`}
                      >
                        {it.img ? (
                          <img src={it.img} alt={it.name} loading="lazy" className="w-10 h-10 object-contain bg-secondary/40 rounded-md p-1 flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 bg-secondary/40 rounded-md flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-muted-foreground/50" />
                          </div>
                        )}
                        <span className="text-sm leading-snug flex-1">{it.name}</span>
                        <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/40"}`} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </aside>

            {/* Product main */}
            <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-card rounded-xl border border-border shadow-elegant overflow-hidden group"
              >
                <div className="aspect-square flex items-center justify-center p-8 bg-secondary/20 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "conic-gradient(from 0deg, transparent, hsl(var(--primary) / 0.15), transparent, hsl(var(--primary) / 0.1), transparent)" }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                  {product.img ? (
                    <motion.img
                      src={product.img}
                      alt={`${product.name} — M.I. Engineering Works Mumbai`}
                      width={600}
                      height={600}
                      className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                      animate={{ y: [0, -12, 0], rotateY: [0, 5, 0, -5, 0] }}
                      transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" }, rotateY: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
                      whileHover={{ scale: 1.12, rotateY: 15, rotateX: -5 }}
                    />
                  ) : (
                    <div className="text-center">
                      <Package className="w-20 h-20 text-muted-foreground/40 mx-auto" />
                      <p className="text-xs text-muted-foreground mt-3">Reference image available on request</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Info */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col">
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-2" data-testid="text-product-standard">{product.standard}</span>
                <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3" data-testid="text-product-name">{product.name}</h1>
                <div className="gold-divider w-16 my-3" />
                <p className="text-muted-foreground leading-relaxed mb-6" data-testid="text-product-description">{product.description}</p>

                <div className="space-y-3 mb-6">
                  {[
                    { label: "Sizes", value: product.sizes },
                    { label: "Threads", value: product.threads },
                    { label: "Length", value: product.length },
                    { label: "Material", value: product.material },
                  ].map((spec) => (
                    <div key={spec.label} className="flex items-start gap-3">
                      <span className="text-sm font-semibold text-foreground min-w-[80px]">{spec.label}:</span>
                      <span className="text-sm text-muted-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to={`/quote?product=${encodeURIComponent(product.name)}${category ? `&category=${encodeURIComponent(category.name)}` : ""}`}
                    data-testid="btn-product-quote"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-gold text-charcoal font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-gold"
                  >
                    Get a Quote
                  </Link>
                  <a href="tel:9819972301" data-testid="btn-product-call" className="inline-flex items-center justify-center gap-2 border border-primary text-primary font-semibold py-3 px-6 rounded-lg hover:bg-primary/5 transition-colors">
                    <Phone className="w-4 h-4" /> Call Now
                  </a>
                  <a href="mailto:mienginering17@gmail.com" data-testid="btn-product-email" className="inline-flex items-center justify-center gap-2 border border-border text-foreground/80 font-semibold py-3 px-6 rounded-lg hover:border-primary/50 hover:text-primary transition-colors">
                    <Mail className="w-4 h-4" /> Email
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: "📐",
                title: "Dimensions & Properties",
                content: (
                  <div className="space-y-3">
                    {product.dimensions.map((d) => (
                      <div key={d.label} className="flex justify-between items-center border-b border-border pb-2 last:border-0">
                        <span className="text-sm text-muted-foreground">{d.label}</span>
                        <span className="text-sm font-semibold text-foreground text-right">{d.value}</span>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                icon: "🏷️",
                title: "Material Grades",
                content: (
                  <>
                    <div className="mb-5">
                      <p className="text-sm text-muted-foreground mb-3">
                        This product is supplied in a wide range of standard material grades. Refer to our complete grade chart for tensile strength, yield strength and chemical composition details.
                      </p>
                      <Link
                        to="/grade-chart"
                        data-testid="btn-detail-grade-chart"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-gold text-charcoal text-sm font-bold hover:opacity-90 transition shadow-gold"
                      >
                        📊 View Grade Chart
                      </Link>
                    </div>
                    <h3 className="font-heading text-sm font-bold text-foreground mb-3">Surface Finish</h3>
                    <ul className="space-y-2">
                      {product.finish.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </>
                ),
              },
              {
                icon: "🏭",
                title: "Applications",
                content: (
                  <ul className="space-y-3">
                    {product.applications.map((a) => (
                      <li key={a} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                ),
              },
            ].map((card) => (
              <div key={card.title} className="bg-card rounded-xl border border-border shadow-elegant p-6 hover:shadow-gold hover:border-primary/30 transition-all duration-300">
                <h2 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  {card.icon} {card.title}
                </h2>
                {card.content}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-background">
          <div className="container">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              {category ? `More from ${category.name}` : "Related Products"} <span className="text-gradient-gold"></span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {relatedProducts.map((p) => (
                <Link
                  key={p.slug}
                  to={`/product/${p.slug}`}
                  data-testid={`card-related-${p.slug}`}
                  className="group block bg-card rounded-lg border border-border hover:border-primary/40 transition-all duration-300 overflow-hidden shadow-elegant hover:shadow-gold"
                >
                  <div className="aspect-square bg-secondary/30 flex items-center justify-center p-4 overflow-hidden">
                    {p.img ? (
                      <img src={p.img} alt={p.name} loading="lazy" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <Package className="w-12 h-12 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="p-3 text-center border-t border-border">
                    <h3 className="font-heading text-sm font-semibold text-foreground line-clamp-2">{p.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
    </PageTransition>
  );
};

export default ProductDetail;
