import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { Menu, X, Phone, Mail, Search, Download, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import SearchDialog from "@/components/SearchDialog";
import { useSiteContent } from "@/hooks/useSiteContent";
import { api, type Industry, type Standard } from "@/lib/api";

type NavLink = {
  label: string;
  href: string;
  dropdown?: "applications" | "standards";
};

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Applications", href: "/applications", dropdown: "applications" },
  { label: "Standards", href: "/standards", dropdown: "standards" },
  { label: "Gallery", href: "/gallery" },
  { label: "Specifications", href: "/specifications" },
  { label: "Grade Chart", href: "/grade-chart" },
  { label: "Calculator", href: "/calculator" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

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

  const { data: industries = [] } = useQuery<Industry[]>({
    queryKey: ["industries"],
    queryFn: () => api<Industry[]>("/api/industries"),
    staleTime: 60_000,
  });

  const { data: standards = [] } = useQuery<Standard[]>({
    queryKey: ["standards"],
    queryFn: () => api<Standard[]>("/api/standards"),
    staleTime: 60_000,
  });

  // Close any open dropdown on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
    setMobileSubmenu(null);
  }, [location.pathname]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    if (location.pathname === "/") window.location.reload();
    else window.location.assign("/");
  };

  const isActive = (link: NavLink) =>
    link.href === "/" ? location.pathname === "/" : location.pathname.startsWith(link.href);

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

  const renderDesktopLink = (l: NavLink) => {
    if (!l.dropdown) {
      return (
        <Link
          key={l.label}
          to={l.href}
          data-testid={`nav-${l.label.toLowerCase()}`}
          className={`text-sm font-medium transition-colors ${isActive(l) ? "text-primary" : "text-foreground/80 hover:text-primary"}`}
        >
          {l.label}
        </Link>
      );
    }

    const items =
      l.dropdown === "applications"
        ? industries.map((i) => ({ key: i.slug, label: i.name, href: `/applications/${i.slug}` }))
        : standards.map((s) => ({ key: s.slug, label: `${s.code} — ${s.name}`, href: `/standards/${s.slug}` }));

    const isOpen = openDropdown === l.label;
    return (
      <div
        key={l.label}
        className="relative"
        onMouseEnter={() => {
          cancelClose();
          setOpenDropdown(l.label);
        }}
        onMouseLeave={scheduleClose}
      >
        <button
          type="button"
          data-testid={`nav-${l.label.toLowerCase()}`}
          onClick={() => setOpenDropdown(isOpen ? null : l.label)}
          className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
            isActive(l) || isOpen ? "text-primary" : "text-foreground/80 hover:text-primary"
          }`}
        >
          {l.label}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[min(680px,90vw)]"
          >
            <div className="rounded-xl border border-primary/15 bg-card/95 backdrop-blur-xl shadow-elegant p-3">
              <Link
                to={l.href}
                onClick={() => setOpenDropdown(null)}
                className="flex items-center justify-between px-3 py-2 mb-2 rounded-md text-sm font-semibold text-primary hover:bg-secondary/60 transition-colors"
              >
                View all {l.label}
                <span className="text-xs text-muted-foreground">{items.length} total</span>
              </Link>
              <div className="grid grid-cols-2 gap-1 max-h-[60vh] overflow-y-auto pr-1">
                {items.map((it) => (
                  <Link
                    key={it.key}
                    to={it.href}
                    onClick={() => setOpenDropdown(null)}
                    className="px-3 py-2 rounded-md text-sm text-foreground/80 hover:text-primary hover:bg-secondary/60 transition-colors line-clamp-1"
                    data-testid={`nav-dropdown-${it.key}`}
                    title={it.label}
                  >
                    {it.label}
                  </Link>
                ))}
                {items.length === 0 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground col-span-2">No items found.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-gradient-dark text-primary-foreground py-2 text-sm hidden md:block">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="mailto:mienginering17@gmail.com" className="flex items-center gap-1.5 text-gold-light hover:text-gold transition-colors">
              <Mail className="w-3.5 h-3.5" /> mienginering17@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:9819972301" className="flex items-center gap-1.5 text-gold-light hover:text-gold transition-colors">
              <Phone className="w-3.5 h-3.5" /> +91 98199 72301
            </a>
            <span className="text-muted-foreground">|</span>
            <a href="tel:9137658733" className="flex items-center gap-1.5 text-gold-light hover:text-gold transition-colors">
              <Phone className="w-3.5 h-3.5" /> +91 91376 58733
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-card/80 border-b border-primary/10 shadow-elegant">
        <div className="container flex items-center justify-between gap-4 h-16 md:h-20">
          <a
            href="/"
            onClick={handleLogoClick}
            data-testid="link-logo-home"
            className="flex items-center gap-3 leading-tight group flex-shrink-0 cursor-pointer"
          >
            {brandLogo ? (
              <img src={brandLogo} alt={brandName} className="h-10 md:h-12 w-auto object-contain" data-testid="img-brand-logo" />
            ) : null}
            <span className="flex flex-col">
              <span className="font-heading text-xl md:text-2xl font-bold text-gradient-gold">{brandName}</span>
              <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-muted-foreground">{brandTagline}</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
            {navLinks.map(renderDesktopLink)}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              data-testid="button-search"
              aria-label="Search"
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm text-muted-foreground hover:text-primary hover:border-primary transition"
            >
              <Search className="w-4 h-4" /> <span className="hidden xl:inline">Search</span>
            </button>
            <a
              href="/api/catalog.pdf"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-download-catalog"
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-gold text-charcoal text-sm font-semibold hover:opacity-90 transition"
            >
              <Download className="w-4 h-4" /> <span className="hidden xl:inline">Catalog</span>
            </a>

            <button onClick={() => setSearchOpen(true)} data-testid="button-search-mobile" aria-label="Search" className="md:hidden p-2 text-foreground"><Search className="w-5 h-5" /></button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-foreground p-2" data-testid="button-menu-mobile" aria-label="Menu">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="lg:hidden backdrop-blur-xl bg-card/95 border-t border-border pb-4 max-h-[80vh] overflow-y-auto">
            {navLinks.map((l) => {
              if (!l.dropdown) {
                return (
                  <Link
                    key={l.label}
                    to={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-6 py-3 text-foreground/80 hover:text-primary hover:bg-secondary/50 transition-colors"
                  >
                    {l.label}
                  </Link>
                );
              }
              const items =
                l.dropdown === "applications"
                  ? industries.map((i) => ({ key: i.slug, label: i.name, href: `/applications/${i.slug}` }))
                  : standards.map((s) => ({ key: s.slug, label: `${s.code} — ${s.name}`, href: `/standards/${s.slug}` }));
              const expanded = mobileSubmenu === l.label;
              return (
                <div key={l.label} className="border-b border-border/40 last:border-0">
                  <div className="flex items-center">
                    <Link
                      to={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 px-6 py-3 text-foreground/80 hover:text-primary transition-colors"
                    >
                      {l.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileSubmenu(expanded ? null : l.label)}
                      className="px-4 py-3 text-foreground/60 hover:text-primary"
                      aria-label={`Toggle ${l.label} submenu`}
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                  {expanded && (
                    <div className="bg-secondary/30 max-h-72 overflow-y-auto">
                      {items.map((it) => (
                        <Link
                          key={it.key}
                          to={it.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-9 py-2 text-sm text-foreground/75 hover:text-primary hover:bg-secondary/60"
                        >
                          {it.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="px-6 pt-3 space-y-2 text-sm">
              <a href="/api/catalog.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-gold text-charcoal font-semibold">
                <Download className="w-4 h-4" /> Download Catalog
              </a>
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
