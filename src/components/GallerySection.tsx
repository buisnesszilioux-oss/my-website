import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Play, X, ArrowRight, Image as ImageIcon, Download, Maximize2 } from "lucide-react";
import { api, type Media } from "@/lib/api-extras";

const GallerySection = () => {
  const { data, isLoading } = useQuery<Media[]>({ queryKey: ["/api/media"], queryFn: () => api("/api/media") });
  const [open, setOpen] = useState<Media | null>(null);
  const items = (data || []).slice(0, 8);

  if (!isLoading && items.length === 0) return null;

  return (
    <section id="gallery" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary">Inside Our Workshop</span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3">Photos & <span className="text-gradient-gold">Videos</span></h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">A look inside our manufacturing operations, finished products, and project deliveries.</p>
          <div className="gold-divider w-24 mx-auto mt-6" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square bg-secondary/50 animate-pulse rounded-lg" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((m) => (
              <button key={m.id} onClick={() => setOpen(m)} data-testid={`gallery-item-${m.id}`}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border hover:border-primary/40 hover:shadow-gold transition">
                <img src={m.thumbnail || m.url} alt={m.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                {m.type === "video" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center"><Play className="w-5 h-5 text-charcoal" /></span>
                  </span>
                )}
                {m.title && (
                  <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-xs text-white text-left">{m.title}</span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/gallery" data-testid="link-all-gallery" className="inline-flex items-center gap-2 px-6 py-3 rounded-md border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition">
            <ImageIcon className="w-4 h-4" /> View Full Gallery <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {open && <Lightbox media={open} onClose={() => setOpen(null)} />}
    </section>
  );
};

export const Lightbox = ({ media, onClose }: { media: Media; onClose: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const requestFs = () => {
    const v = videoRef.current as any;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
      data-testid="lightbox-overlay"
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 sm:p-5 bg-gradient-to-b from-black/80 to-transparent" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 text-white/90">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary text-charcoal">
            {media.type === "video" ? "Video" : "Photo"}
          </span>
          {media.title && <span className="font-heading text-sm sm:text-base font-semibold truncate max-w-[50vw]">{media.title}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          {media.type === "video" && (
            <button onClick={requestFs} aria-label="Fullscreen" data-testid="button-fullscreen"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
          <a href={media.url} download target="_blank" rel="noopener noreferrer" aria-label="Download" data-testid="button-download-media"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">
            <Download className="w-4 h-4" />
          </a>
          <button onClick={onClose} aria-label="Close" data-testid="button-close-lightbox"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
        {media.type === "video" ? (
          <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black ring-1 ring-primary/30">
            <video
              ref={videoRef}
              src={media.url}
              poster={media.thumbnail || undefined}
              controls
              autoPlay
              playsInline
              controlsList="nodownload"
              className="w-full h-auto max-h-[78vh] bg-black"
              data-testid="video-player"
            />
          </div>
        ) : (
          <img src={media.url} alt={media.title} className="w-full rounded-xl max-h-[82vh] object-contain shadow-2xl" />
        )}
        {(media.title || media.caption) && (
          <div className="mt-4 text-center px-4">
            {media.title && <div className="text-white font-heading text-lg font-semibold">{media.title}</div>}
            {media.caption && <div className="text-white/70 text-sm mt-1 max-w-3xl mx-auto">{media.caption}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default GallerySection;
