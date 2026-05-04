import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { Menu, X, Phone, Mail, Search, Download, ChevronDown } from "lucide-react";
import SearchDialog from "@/components/SearchDialog";
import { useSiteContent } from "@/hooks/useSiteContent";
import { categories as productCategories } from "@/data/categories";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const { content } = useSiteContent();
  const brandName = (content["brand.name"] || "M.I. Engineering Works").trim();
  const brandTagline = (content["brand.tagline"] || "Premium Fastener Solutions").trim();
  const brandLogo = (content["brand.logo"] || "").trim();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
    setMobileSubmenu(null);
  }, [location.pathname]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.assign("/");
    }
  };

  const handleHomeNavClick = (e: React.MouseEvent) => {
    if (location.pathname === "/") {
      e.preventDefault();
      setMobileOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setOpenDropdown(null), 180);
  };

  const isProductsOpen = openDropdown === "Products";

  return (
    <>
      {/* Top bar */}
      <div className="bg-[hsl(222,47%,11%)] text-white py-2 text-xs hidden md:block border-b border-primary/30">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="mailto:mienginering17@gmail.com" className="flex items-center gap-1.5 text-white hover:text-[hsl(195,100%,70%)] transition-colors font-medium">
              <Mail className="w-3.5 h-3.5" /> mienginering17@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:9819972301" className="flex items-center gap-1.5 text-white hover:text-[hsl(195,100%,70%)] transition-colors font-medium">
              <Phone className="w-3.5 h-3.5" /> +91 98199 72301
            </a>
            <span className="text-white/50">|</span>
            <a href="tel:9137658733" className="flex items-center gap-1.5 text-white hover:text-[hsl(195,100%,70%)] transition-colors font-medium">
              <Phone className="w-3.5 h-3.5" /> +91 91376 58733
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header className="sticky top-0 z-50 glass-panel-strong border-b border-primary/15">
        <div className="container flex items-center justify-between gap-3 h-14 md:h-16">
          {/* Logo */}
          <a
            href="/"
            onClick={handleLogoClick}
            data-testid="link-logo-home"
            className="logo-glow flex items-center gap-2 leading-tight group flex-shrink-0 cursor-pointer"
          >
            {brandLogo ? (
              <span className="logo-flip h-8 md:h-10 inline-block" aria-hidden={false}>
                <img src={brandLogo} alt={brandName} className="logo-flip-img h-8 md:h-10 w-auto object-contain" data-testid="img-brand-logo" />
              </span>
            ) : null}
            <span className="flex flex-col">
              <span className="font-heading text-sm md:text-base lg:text-lg font-bold text-gradient-gold leading-tight">{brandName}</span>
              <span className="hidden sm:inline text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{brandTagline}</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            {/* Home */}
            <Link
              to="/"
              onClick={handleHomeNavClick}
              data-testid="nav-home"
              className={`relative text-sm font-medium transition-colors after:absolute after:left-0 after:right-0 after:-bottom-1.5 after:h-0.5 after:rounded-full after:bg-primary after:transition-transform after:origin-center ${
                location.pathname === "/" ? "text-primary after:scale-x-100" : "text-foreground/80 hover:text-primary after:scale-x-0 hover:after:scale-x-100"
              }`}
            >
              Home
            </Link>

            {/* Products dropdown */}
            <div
              className="relative"
              onMouseEnter={() => { cancelClose(); setOpenDropdown("Products"); }}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                data-testid="nav-products"
                onClick={() => setOpenDropdown(isProductsOpen ? null : "Products")}
                className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
                  location.pathname.startsWith("/product") || isProductsOpen ? "text-primary" : "text-foreground/80 hover:text-primary"
                }`}
              >
                Products
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isProductsOpen ? "rotate-180" : ""}`} />
              </button>

              {isProductsOpen && (
                <div
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[min(720px,92vw)]"
                >
                  <div className="rounded-xl border border-primary/15 bg-card/98 shadow-elegant p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">Browse by Category</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1 max-h-[70vh] overflow-y-auto pr-1">
                      {productCategories.map((cat) => (
                        <div key={cat.slug}>
                          <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-primary/70">{cat.icon} {cat.name}</p>
                          {cat.products.map((p) => (
                            <Link
                              key={p.slug}
                              to={`/product/${p.slug}`}
                              onClick={() => setOpenDropdown(null)}
                              className="block px-3 py-1.5 rounded-md text-sm text-foreground/80 hover:text-primary hover:bg-secondary/60 transition-colors line-clamp-1"
                              data-testid={`nav-dropdown-${p.slug}`}
                              title={p.name}
                            >
                              {p.name}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              data-testid="button-search"
              aria-label="Search"
              title="Search"
              className="hidden md:inline-flex items-center justify-center w-8 h-8 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary transition"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            <a
              href="/api/catalog.pdf"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-download-catalog"
              aria-label="Download catalog"
              title="Download catalog"
              className="hidden md:inline-flex items-center justify-center w-8 h-8 rounded-md border border-primary/40 text-primary hover:bg-primary/10 transition"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                if (location.pathname !== "/") { e.preventDefault(); window.location.assign("/#contact"); }
                else { setMobileOpen(false); }
              }}
              data-testid="nav-quote"
              className="hidden md:inline-flex items-center px-3 py-1.5 rounded-md bg-gradient-gold text-charcoal text-xs font-bold hover:opacity-90 transition shadow-gold"
            >
              Get Quote
            </a>

            <button onClick={() => setSearchOpen(true)} data-testid="button-search-mobile" aria-label="Search" className="md:hidden p-1.5 text-foreground"><Search className="w-5 h-5" /></button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-foreground p-1.5" data-testid="button-menu-mobile" aria-label="Menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="lg:hidden bg-card/95 border-t border-border pb-4 max-h-[80vh] overflow-y-auto">
            {/* Home */}
            <Link
              to="/"
              onClick={(e) => { handleHomeNavClick(e); setMobileOpen(false); }}
              className="block px-6 py-3 text-foreground/80 hover:text-primary hover:bg-secondary/50 transition-colors font-medium"
            >
              Home
            </Link>

            {/* Products with submenu */}
            <div className="border-b border-border/40">
              <div className="flex items-center">
                <span className="flex-1 px-6 py-3 text-foreground/80 font-medium">Products</span>
                <button
                  type="button"
                  onClick={() => setMobileSubmenu(mobileSubmenu === "Products" ? null : "Products")}
                  className="px-4 py-3 text-foreground/60 hover:text-primary"
                  aria-label="Toggle Products submenu"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileSubmenu === "Products" ? "rotate-180" : ""}`} />
                </button>
              </div>
              {mobileSubmenu === "Products" && (
                <div className="bg-secondary/30 max-h-72 overflow-y-auto">
                  {productCategories.map((cat) => (
                    <div key={cat.slug}>
                      <p className="px-9 pt-2 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-primary/70">{cat.icon} {cat.name}</p>
                      {cat.products.map((p) => (
                        <Link
                          key={p.slug}
                          to={`/product/${p.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="block px-12 py-1.5 text-sm text-foreground/75 hover:text-primary hover:bg-secondary/60"
                        >
                          {p.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 pt-3 space-y-2 text-sm">
              <div className="flex flex-wrap gap-2">
                <a
                  href="/#contact"
                  onClick={() => setMobileOpen(false)}
                  data-testid="nav-quote-mobile"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-gold text-charcoal font-semibold"
                >
                  Get a Quote
                </a>
                <a href="/api/catalog.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-foreground/80 font-semibold">
                  <Download className="w-4 h-4" /> Catalog
                </a>
              </div>
              <a href="mailto:mienginering17@gmail.com" className="flex items-center gap-2 text-primary"><Mail className="w-4 h-4" /> mienginering17@gmail.com</a>
              <a href="tel:9819972301" className="flex items-center gap-2 text-primary"><Phone className="w-4 h-4" /> +91 98199 72301</a>
            </div>
          </nav>
        )}
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;
