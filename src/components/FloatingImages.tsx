import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface FloatingImage {
  id: number;
  url: string;
  title: string;
  enabled: boolean;
  duration: number;
  delay: number;
  positionX: number;
  positionY: number;
  size: number;
}

const FloatingImages = () => {
  const { data } = useQuery<FloatingImage[]>({
    queryKey: ["/api/floating-images"],
    queryFn: () => api("/api/floating-images"),
  });

  const images = (data || []).filter((i) => i.enabled);
  if (!images.length) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]" data-testid="floating-images-layer">
      {images.map((img) => (
        <img
          key={img.id}
          src={img.url}
          alt={img.title || "Floating image"}
          loading="lazy"
          data-testid={`floating-image-${img.id}`}
          className="anim-float absolute object-contain rounded-xl"
          style={{
            left: `${img.positionX}%`,
            top: `${img.positionY}%`,
            width: `${img.size}px`,
            height: "auto",
            transform: "translate(-50%, -50%)",
            animationDuration: `${img.duration}s`,
            animationDelay: `${img.delay}s`,
            filter:
              "drop-shadow(0 8px 24px hsl(210 100% 56% / 0.45)) drop-shadow(0 2px 8px hsl(0 0% 0% / 0.6))",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingImages;
