import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, Loader2, Sparkles, X } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PRODUCT_ANIMATIONS, BACKGROUND_ANIMATIONS, type AnimationPreset } from "@/lib/animations";

export default function AdminAnimations() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: content } = useQuery<Record<string, string>>({ queryKey: ["/api/site-content"] });

  const [productId, setProductId] = useState("lift");
  const [bgId, setBgId] = useState("none");

  useEffect(() => {
    if (!content) return;
    setProductId(content["animations.product"] || "lift");
    setBgId(content["animations.background"] || "none");
  }, [content]);

  const save = useMutation({
    mutationFn: async (entries: { key: string; value: string }[]) =>
      api("/api/admin/site-content", { method: "POST", body: JSON.stringify({ entries }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/site-content"] }),
  });

  const install = (preset: AnimationPreset) => {
    if (preset.type === "product") {
      setProductId(preset.id);
      save.mutate([{ key: "animations.product", value: preset.id }], {
        onSuccess: () => toast({ title: "Installed", description: `Product animation: ${preset.label}` }),
      });
    } else {
      setBgId(preset.id);
      save.mutate([{ key: "animations.background", value: preset.id }], {
        onSuccess: () => toast({ title: "Installed", description: `Background animation: ${preset.label}` }),
      });
    }
  };

  const unequip = (type: "product" | "background") => {
    const key = type === "product" ? "animations.product" : "animations.background";
    if (type === "product") setProductId("none"); else setBgId("none");
    save.mutate([{ key, value: "none" }], {
      onSuccess: () => toast({ title: "Unequipped", description: `${type === "product" ? "Product card" : "Background"} animation removed.` }),
    });
  };

  return (
    <AdminLayout>
      <Helmet><title>Animations · Admin</title></Helmet>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" /> Animations
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Install one animation for product cards and one for the page background. Click <em>Install</em> to enable, or <em>Unequip</em> to remove.
        </p>
      </div>

      <Section
        title="Product Card Animations"
        subtitle="Applied to every fastener card on the homepage."
        activeId={productId}
        onUnequip={() => unequip("product")}
        presets={PRODUCT_ANIMATIONS}
        onInstall={install}
        saving={save.isPending}
      />

      <div className="mt-10">
        <Section
          title="Background Animations"
          subtitle="Applied site-wide as a subtle backdrop effect."
          activeId={bgId}
          onUnequip={() => unequip("background")}
          presets={BACKGROUND_ANIMATIONS}
          onInstall={install}
          saving={save.isPending}
        />
      </div>
    </AdminLayout>
  );
}

const Section = ({
  title, subtitle, activeId, onUnequip, presets, onInstall, saving,
}: {
  title: string; subtitle: string; activeId: string; onUnequip: () => void;
  presets: AnimationPreset[]; onInstall: (p: AnimationPreset) => void; saving: boolean;
}) => {
  const active = presets.find((p) => p.id === activeId);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="text-sm flex items-center gap-3">
          <span className="text-muted-foreground">Installed:</span>
          <span className="font-semibold text-primary">{active?.label || "None"}</span>
          {active && active.id !== "none" && (
            <button onClick={onUnequip} disabled={saving} data-testid="button-unequip"
              className="inline-flex items-center gap-1 text-xs font-semibold border border-destructive/40 text-destructive hover:bg-destructive/10 px-2.5 py-1.5 rounded-md disabled:opacity-50">
              <X className="w-3.5 h-3.5" /> Unequip
            </button>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((p) => {
          const isActive = p.id === activeId;
          return (
            <div
              key={p.id}
              className={`bg-card rounded-xl border p-5 transition-all ${isActive ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"}`}
              data-testid={`card-anim-${p.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{p.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                </div>
                {isActive && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
              </div>

              {/* Preview */}
              <div className="h-24 rounded-md border border-border overflow-hidden bg-secondary/30 flex items-center justify-center mb-3 relative">
                {p.type === "product" ? (
                  <div className={`w-24 h-16 rounded bg-gradient-gold text-black text-xs font-bold flex items-center justify-center shadow-elegant ${p.cardClass || ""}`}>
                    Card
                  </div>
                ) : (
                  <div className={`w-full h-full ${p.bodyClass || ""} relative bg-[hsl(30,10%,15%)]`}>
                    <span className="absolute inset-0 flex items-center justify-center text-xs text-yellow-100/70 font-semibold">Backdrop</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => onInstall(p)}
                disabled={isActive || saving}
                data-testid={`button-install-${p.id}`}
                className={`w-full inline-flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition ${isActive ? "bg-primary/10 text-primary cursor-default" : "bg-primary text-primary-foreground hover:opacity-90"}`}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isActive ? "Installed" : "Install"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
