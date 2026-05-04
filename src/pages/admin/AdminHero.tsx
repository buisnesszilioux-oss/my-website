import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Save, Loader2, RotateCcw, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { HERO_PAGES, type HeroPage } from "@/hooks/useHeroImage";

const PUBLIC_PATHS: Record<HeroPage, string> = {
  home: "/",
  products: "/products",
  standards: "/standards",
  applications: "/applications",
  gallery: "/gallery",
  specifications: "/specifications",
  gradeChart: "/grade-chart",
  calculator: "/calculator",
  about: "/about",
  contact: "/contact",
};

export default function AdminHero() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: content } = useQuery<Record<string, string>>({ queryKey: ["/api/site-content"] });

  const [vals, setVals] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!content) return;
    const next: Record<string, string> = {};
    for (const p of HERO_PAGES) next[`hero.image.${p.key}`] = content[`hero.image.${p.key}`] || "";
    setVals(next);
  }, [content]);

  const save = useMutation({
    mutationFn: async () => {
      const entries = HERO_PAGES.map((p) => ({
        key: `hero.image.${p.key}`,
        value: (vals[`hero.image.${p.key}`] || "").trim(),
      }));
      await api("/api/admin/site-content", { method: "POST", body: JSON.stringify({ entries }) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/site-content"] });
      toast({ title: "Hero images saved", description: "Updated for everyone." });
    },
    onError: (e: any) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  const update = (page: HeroPage, value: string) => {
    setVals((p) => ({ ...p, [`hero.image.${page}`]: value }));
  };

  const reset = (page: HeroPage) => update(page, "");

  return (
    <AdminLayout>
      <Helmet><title>Hero Images · Admin</title></Helmet>

      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-primary" /> Hero Images
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Set the large image at the top of every public page. Upload a new picture or paste any image URL.
          </p>
        </div>
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          data-testid="button-save-hero"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-md hover:opacity-90 disabled:opacity-60"
        >
          {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Heroes
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {HERO_PAGES.map((p) => {
          const key = `hero.image.${p.key}`;
          const value = vals[key] || "";
          const preview = value || p.defaultImage;
          return (
            <div key={p.key} className="bg-card rounded-xl border border-border overflow-hidden flex flex-col" data-testid={`hero-card-${p.key}`}>
              <div className="aspect-[16/7] bg-secondary relative overflow-hidden">
                {preview ? (
                  <img src={preview} alt={p.label} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image set</div>
                )}
                {!value && (
                  <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider bg-background/90 text-muted-foreground px-2 py-1 rounded-full border border-border">
                    Default
                  </span>
                )}
              </div>

              <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-base font-semibold">{p.label}</h3>
                  <Link
                    to={PUBLIC_PATHS[p.key]}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" /> View page
                  </Link>
                </div>

                <input
                  type="text"
                  value={value}
                  onChange={(e) => update(p.key, e.target.value)}
                  placeholder="Image URL — or upload below"
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                  data-testid={`input-hero-url-${p.key}`}
                />

                <div className="flex gap-2 flex-wrap">
                  {value && (
                    <button
                      type="button"
                      onClick={() => reset(p.key)}
                      data-testid={`button-hero-reset-${p.key}`}
                      className="inline-flex items-center gap-2 border border-border px-3 py-2 rounded-md text-sm hover:bg-secondary"
                    >
                      <RotateCcw className="w-4 h-4" /> Use Default
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-xs text-muted-foreground bg-secondary/40 border border-border rounded-md p-4">
        Tip: hero images you upload here are automatically saved into the <strong>Photos & Videos</strong> library under the
        <strong> "hero" </strong>category, so you can re-use them from there too.
      </div>
    </AdminLayout>
  );
}
