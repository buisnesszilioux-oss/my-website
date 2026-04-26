import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Save, Loader2, RotateCcw, Palette } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const PRESETS: Record<string, { primary: string; gold: string; charcoal: string; background: string; foreground: string }> = {
  "Default Gold": { primary: "43 74% 52%", gold: "43 74% 52%", charcoal: "0 0% 9%", background: "0 0% 100%", foreground: "0 0% 9%" },
  "Royal Blue":   { primary: "221 83% 53%", gold: "210 80% 55%", charcoal: "222 47% 11%", background: "0 0% 100%", foreground: "222 47% 11%" },
  "Emerald":      { primary: "151 55% 41%", gold: "148 64% 47%", charcoal: "160 20% 10%", background: "0 0% 100%", foreground: "160 20% 10%" },
  "Crimson":      { primary: "0 72% 51%",   gold: "12 85% 55%",  charcoal: "0 30% 10%",  background: "0 0% 100%", foreground: "0 30% 10%" },
  "Midnight":     { primary: "43 74% 52%",  gold: "43 74% 52%",  charcoal: "0 0% 4%",    background: "0 0% 7%",   foreground: "0 0% 95%" },
};

const KEYS = ["theme.primary", "theme.gold", "theme.charcoal", "theme.background", "theme.foreground"] as const;

const DEFAULTS: Record<string, string> = {
  "theme.primary": "43 74% 52%",
  "theme.gold": "43 74% 52%",
  "theme.charcoal": "0 0% 9%",
  "theme.background": "0 0% 100%",
  "theme.foreground": "0 0% 9%",
};

function applyTheme(values: Record<string, string>) {
  const root = document.documentElement;
  for (const k of KEYS) {
    const v = values[k];
    if (!v) continue;
    const cssName = k.replace("theme.", "--");
    root.style.setProperty(cssName, v);
    if (k === "theme.gold") root.style.setProperty("--gold", v);
  }
}

export default function AdminTheme() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: content } = useQuery<Record<string, string>>({ queryKey: ["/api/site-content"] });

  const [vals, setVals] = useState<Record<string, string>>(DEFAULTS);

  useEffect(() => {
    if (!content) return;
    const next: Record<string, string> = { ...DEFAULTS };
    for (const k of KEYS) if (content[k]) next[k] = content[k];
    setVals(next);
    applyTheme(next);
  }, [content]);

  const save = useMutation({
    mutationFn: async () => {
      const entries = KEYS.map((k) => ({ key: k, value: (vals[k] || "").trim() }));
      await api("/api/admin/site-content", { method: "POST", body: JSON.stringify({ entries }) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/site-content"] });
      toast({ title: "Theme saved", description: "Site colors updated for everyone." });
    },
    onError: (e: any) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  const update = (key: string, value: string) => {
    const next = { ...vals, [key]: value };
    setVals(next);
    applyTheme(next);
  };

  const applyPreset = (name: string) => {
    const p = PRESETS[name];
    if (!p) return;
    const next = {
      "theme.primary": p.primary,
      "theme.gold": p.gold,
      "theme.charcoal": p.charcoal,
      "theme.background": p.background,
      "theme.foreground": p.foreground,
    };
    setVals(next);
    applyTheme(next);
    toast({ title: `Loaded "${name}"`, description: "Click Save to apply for everyone." });
  };

  const reset = () => {
    setVals(DEFAULTS);
    applyTheme(DEFAULTS);
  };

  return (
    <AdminLayout>
      <Helmet><title>Theme · Admin</title></Helmet>

      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><Palette className="w-6 h-6 text-primary" /> Website Theme</h1>
          <p className="text-sm text-muted-foreground">Customise the site colors. Live preview updates instantly — click Save to publish.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="inline-flex items-center gap-2 border border-border px-4 py-2 rounded-md text-sm" data-testid="button-reset-theme">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            onClick={() => save.mutate()} disabled={save.isPending}
            data-testid="button-save-theme"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-md hover:opacity-90 disabled:opacity-60"
          >
            {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Theme
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h2 className="font-heading text-lg font-semibold">Presets</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(PRESETS).map(([name, p]) => (
              <button
                key={name}
                onClick={() => applyPreset(name)}
                data-testid={`preset-${name.toLowerCase().replace(/\s+/g, "-")}`}
                className="group p-4 rounded-lg border border-border hover:border-primary/50 transition-all text-left"
              >
                <div className="flex gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full border" style={{ background: `hsl(${p.primary})` }} />
                  <span className="w-8 h-8 rounded-full border" style={{ background: `hsl(${p.gold})` }} />
                  <span className="w-8 h-8 rounded-full border" style={{ background: `hsl(${p.charcoal})` }} />
                </div>
                <div className="text-sm font-semibold">{name}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h2 className="font-heading text-lg font-semibold">Custom Colors</h2>
          <p className="text-xs text-muted-foreground -mt-3">Use HSL format: <code className="text-primary">hue saturation% lightness%</code> (e.g. <code className="text-primary">43 74% 52%</code>)</p>
          {KEYS.map((k) => {
            const label = k.replace("theme.", "").replace(/^./, (c) => c.toUpperCase());
            return (
              <div key={k} className="flex items-center gap-3">
                <span className="w-10 h-10 rounded border shrink-0" style={{ background: `hsl(${vals[k]})` }} aria-hidden />
                <label className="flex-1 block">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
                  <input
                    type="text"
                    value={vals[k] || ""}
                    onChange={(e) => update(k, e.target.value)}
                    placeholder="43 74% 52%"
                    className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm font-mono"
                    data-testid={`input-${k}`}
                  />
                </label>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-2 bg-card rounded-xl border p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Live Preview</h2>
          <div className="rounded-xl border p-6" style={{ background: `hsl(${vals["theme.background"]})`, color: `hsl(${vals["theme.foreground"]})` }}>
            <h3 className="font-heading text-2xl font-bold mb-2" style={{ color: `hsl(${vals["theme.primary"]})` }}>M.I. Engineering Works</h3>
            <p className="opacity-80 mb-4">Premium fastener solutions for industry leaders.</p>
            <div className="flex gap-3">
              <button className="px-5 py-2 rounded-md font-semibold" style={{ background: `hsl(${vals["theme.primary"]})`, color: `hsl(${vals["theme.charcoal"]})` }}>Primary Button</button>
              <button className="px-5 py-2 rounded-md font-semibold border" style={{ borderColor: `hsl(${vals["theme.primary"]})`, color: `hsl(${vals["theme.primary"]})` }}>Outline</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
