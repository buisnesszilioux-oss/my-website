import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  X,
  ArrowRight,
  Image as ImageIcon,
  Download,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { api, type Media } from "@/lib/api-extras";

const GallerySection = () => {
  const { data, isLoading } = useQuery<Media[]>({ queryKey: ["/api/media"], queryFn: () => api("/api/media") });
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = (data || []).slice(0, 8);

  if (!isLoading && items.length === 0) return null;

  return (
    <section id="gallery" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary">Inside Our Workshop</span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3">
            Photos & <span className="text-gradient-gold">Videos</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            A look inside our manufacturing operations, finished products, and project deliveries.
          </p>
          <div className="gold-divider w-24 mx-auto mt-6" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-secondary/50 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setOpenIndex(i)}
                data-testid={`gallery-item-${m.id}`}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border hover:border-primary/40 hover:shadow-gold transition"
              >
                <img
                  src={m.thumbnail || m.url}
                  alt={m.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                {m.type === "video" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center">
                      <Play className="w-5 h-5 text-charcoal" fill="currentColor" />
                    </span>
                  </span>
                )}
                {m.title && (
                  <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-xs text-white text-left">
                    {m.title}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            to="/gallery"
            data-testid="link-all-gallery"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition"
          >
            <ImageIcon className="w-4 h-4" /> View Full Gallery <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <Lightbox
            items={items}
            startIndex={openIndex}
            onClose={() => setOpenIndex(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Premium Lightbox — supports navigation, counter, thumbnails, autoplay     */
/* ─────────────────────────────────────────────────────────────────────────── */

export interface LightboxProps {
  /** All items in the gallery (for prev/next navigation). */
  items?: Media[];
  /** Single media (back-compat with old API). */
  media?: Media;
  /** Index of the item to open first. */
  startIndex?: number;
  onClose: () => void;
}

export const Lightbox = ({ items, media, startIndex = 0, onClose }: LightboxProps) => {
  // Normalise inputs — accept either {items, startIndex} or legacy {media}.
  const list = useMemo<Media[]>(() => (items && items.length ? items : media ? [media] : []), [items, media]);
  const [index, setIndex] = useState(Math.min(Math.max(startIndex, 0), Math.max(list.length - 1, 0)));
  const current = list[index];

  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);

  const next = () => setIndex((i) => (i + 1) % list.length);
  const prev = () => setIndex((i) => (i - 1 + list.length) % list.length);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key.toLowerCase() === "m") setMuted((m) => !m);
      else if (e.key.toLowerCase() === "f") requestFs();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length]);

  // Reset video state on slide change
  useEffect(() => {
    setPlaying(true);
  }, [index]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const requestFs = () => {
    const v = videoRef.current as any;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
  };

  if (!current) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
      data-testid="lightbox-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Backdrop with subtle gold radial */}
      <div
        className="absolute inset-0 bg-black/95"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, hsl(var(--primary) / 0.10) 0%, rgba(0,0,0,0.95) 55%, rgba(0,0,0,0.98) 100%)",
        }}
      />

      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 sm:p-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-white/95 min-w-0">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-gold text-charcoal shadow-gold">
            {current.type === "video" ? "Video" : "Photo"}
          </span>
          {current.title && (
            <span className="font-heading text-sm sm:text-base font-semibold truncate max-w-[40vw] sm:max-w-[50vw]">
              {current.title}
            </span>
          )}
          {list.length > 1 && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-white/10 text-white/80 backdrop-blur-sm">
              <span className="text-primary">{index + 1}</span>
              <span className="text-white/40">/</span>
              <span>{list.length}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {current.type === "video" && (
            <>
              <button
                onClick={togglePlay}
                aria-label={playing ? "Pause" : "Play"}
                data-testid="button-play-pause"
                className="hidden sm:flex w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition backdrop-blur-sm"
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" fill="currentColor" />}
              </button>
              <button
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? "Unmute" : "Mute"}
                data-testid="button-mute"
                className="hidden sm:flex w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition backdrop-blur-sm"
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={requestFs}
                aria-label="Fullscreen"
                data-testid="button-fullscreen"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition backdrop-blur-sm"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </>
          )}
          <a
            href={current.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download"
            data-testid="button-download-media"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition backdrop-blur-sm"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            aria-label="Close"
            data-testid="button-close-lightbox"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Side navigation arrows */}
      {list.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous"
            data-testid="button-lightbox-prev"
            className="group absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/8 hover:bg-gradient-gold hover:text-charcoal text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10 hover:border-transparent hover:shadow-gold"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next"
            data-testid="button-lightbox-next"
            className="group absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/8 hover:bg-gradient-gold hover:text-charcoal text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10 hover:border-transparent hover:shadow-gold"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      {/* Main content — animated slide */}
      <div className="relative z-[1] max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {current.type === "video" ? (
              <div className="relative rounded-2xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] bg-black ring-1 ring-primary/30">
                <video
                  ref={videoRef}
                  src={current.url}
                  poster={current.thumbnail || undefined}
                  controls
                  autoPlay
                  playsInline
                  muted={muted}
                  controlsList="nodownload"
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  className="w-full h-auto max-h-[72vh] bg-black"
                  data-testid="video-player"
                />
              </div>
            ) : (
              <img
                src={current.url}
                alt={current.title}
                className="w-full rounded-2xl max-h-[78vh] object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/5"
              />
            )}

            {(current.title || current.caption) && (
              <div className="mt-5 text-center px-4">
                {current.title && (
                  <div className="text-white font-heading text-lg sm:text-xl font-semibold tracking-tight">
                    {current.title}
                  </div>
                )}
                {current.caption && (
                  <div className="text-white/70 text-sm mt-1.5 max-w-3xl mx-auto leading-relaxed">
                    {current.caption}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnail strip */}
      {list.length > 1 && (
        <div
          className="absolute bottom-0 left-0 right-0 z-10 px-3 sm:px-6 pb-4 pt-8 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-thin pb-1">
            {list.map((m, i) => {
              const active = i === index;
              return (
                <button
                  key={m.id}
                  onClick={() => setIndex(i)}
                  data-testid={`lightbox-thumb-${i}`}
                  className={`relative shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    active
                      ? "w-16 h-16 sm:w-20 sm:h-20 border-primary shadow-gold scale-105"
                      : "w-12 h-12 sm:w-16 sm:h-16 border-white/10 opacity-55 hover:opacity-100 hover:border-white/30"
                  }`}
                >
                  <img
                    src={m.thumbnail || m.url}
                    alt={m.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {m.type === "video" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="hidden md:flex items-center justify-center gap-4 mt-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
            <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/70">←</kbd> <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/70">→</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/70">Esc</kbd> Close</span>
            {current.type === "video" && (
              <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/70">Space</kbd> Play/Pause</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GallerySection;
