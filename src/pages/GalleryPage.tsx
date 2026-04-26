import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Image as ImageIcon, Video } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Lightbox } from "@/components/GallerySection";
import { api, type Media } from "@/lib/api-extras";
import SEO from "@/components/SEO";

const GalleryPage = () => {
  const { data, isLoading } = useQuery<Media[]>({ queryKey: ["/api/media"], queryFn: () => api("/api/media") });
  const [filter, setFilter] = useState<"all" | "photo" | "video">("all");
  const [open, setOpen] = useState<Media | null>(null);

  const items = (data || []).filter((m) => filter === "all" ? true : m.type === filter);

  return (
    <PageTransition>
      <SEO
        title="Manufacturing Gallery — Photos & Videos"
        description="Behind-the-scenes photos and videos from M.I. Engineering Works — our fastener manufacturing facility, finished product shots, and project deliveries. See ASTM A193 Grade B7 stud bolts, hex bolts and threaded rods in production."
        keywords={[
          "fastener manufacturing photos",
          "stud bolt production Mumbai",
          "M.I. Engineering Works factory",
          "fastener manufacturing process",
          "ASTM A193 B7 production",
          "fastener supplier gallery India",
        ]}
        path="/gallery"
      />
      <Header />

      <section className="relative bg-gradient-dark py-20 md:py-28 text-primary-foreground">
        <div className="container text-center">
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary">Inside Our Workshop</span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mt-3">Photos & <span className="text-gradient-gold">Videos</span></h1>
          <p className="mt-4 max-w-2xl mx-auto text-primary-foreground/80">A behind-the-scenes look at our manufacturing operations, finished products, and project deliveries.</p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background">
        <div className="container">
          <div className="flex justify-center gap-2 mb-8">
            {[
              { v: "all" as const, label: "All", Icon: ImageIcon },
              { v: "photo" as const, label: "Photos", Icon: ImageIcon },
              { v: "video" as const, label: "Videos", Icon: Video },
            ].map(({ v, label, Icon }) => (
              <button key={v} onClick={() => setFilter(v)} data-testid={`filter-${v}`}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${filter === v ? "bg-gradient-gold text-charcoal" : "bg-secondary text-foreground/80 hover:bg-secondary/70"}`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square bg-secondary/50 animate-pulse rounded-lg" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center text-muted-foreground py-20">No {filter === "all" ? "media" : filter + "s"} uploaded yet.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((m) => (
                <button key={m.id} onClick={() => setOpen(m)} data-testid={`gallery-item-${m.id}`} className="group relative aspect-square overflow-hidden rounded-lg border border-border hover:border-primary/40 hover:shadow-gold transition">
                  <img src={m.thumbnail || m.url} alt={m.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  {m.type === "video" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center"><Play className="w-6 h-6 text-charcoal" /></span>
                    </span>
                  )}
                  {m.title && <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-xs text-white text-left">{m.title}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      {open && <Lightbox media={open} onClose={() => setOpen(null)} />}
    </PageTransition>
  );
};

export default GalleryPage;
