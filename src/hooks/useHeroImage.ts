import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type HeroPage =
  | "home"
  | "products"
  | "standards"
  | "applications"
  | "gallery"
  | "specifications"
  | "gradeChart"
  | "calculator"
  | "about"
  | "contact";

export const HERO_PAGES: { key: HeroPage; label: string; defaultImage: string }[] = [
  { key: "home", label: "Home", defaultImage: "" },
  { key: "products", label: "Products", defaultImage: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=1600&q=80" },
  { key: "standards", label: "Standards", defaultImage: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1600&q=80" },
  { key: "applications", label: "Applications", defaultImage: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1600&q=80" },
  { key: "gallery", label: "Gallery", defaultImage: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1600&q=80" },
  { key: "specifications", label: "Specifications", defaultImage: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1600&q=80" },
  { key: "gradeChart", label: "Grade Chart", defaultImage: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1600&q=80" },
  { key: "about", label: "About", defaultImage: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1600&q=80" },
  { key: "contact", label: "Contact", defaultImage: "https://images.unsplash.com/photo-1581090700227-1e8e4dba8ff5?w=1600&q=80" },
];

export function useHeroImage(page: HeroPage, fallback?: string) {
  const { data } = useQuery<Record<string, string>>({
    queryKey: ["/api/site-content"],
    queryFn: () => api("/api/site-content"),
    staleTime: 60_000,
  });
  const v = data?.[`hero.image.${page}`];
  if (v && v.trim()) return v.trim();
  if (fallback) return fallback;
  const def = HERO_PAGES.find((p) => p.key === page)?.defaultImage;
  return def || "";
}
