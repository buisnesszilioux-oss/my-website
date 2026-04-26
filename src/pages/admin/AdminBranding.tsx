import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Save, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { api, uploadFile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { SITE_CONTENT_DEFAULTS } from "@/hooks/useSiteContent";

type Social = { label: string; url: string; icon: string };

const SOCIAL_ICONS = ["mail", "globe", "linkedin", "twitter", "facebook", "whatsapp", "instagram", "youtube", "github"];

export default function AdminBranding() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: content } = useQuery<Record<string, string>>({ queryKey: ["/api/site-content"] });

  const [brandName, setBrandName] = useState("");
  const [tagline, setTagline] = useState("");
  const [logo, setLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [gst, setGst] = useState("");
  const [socials, setSocials] = useState<Social[]>([]);
  const [uploading, setUploading] = useState<"logo" | "favicon" | null>(null);

  useEffect(() => {
    if (!content) return;
    setBrandName(content["brand.name"] ?? SITE_CONTENT_DEFAULTS["brand.name"]);
    setTagline(content["brand.tagline"] ?? SITE_CONTENT_DEFAULTS["brand.tagline"]);
    setLogo(content["brand.logo"] ?? "");
    setFavicon(content["brand.favicon"] ?? "");
    setGst(content["company.gst"] ?? SITE_CONTENT_DEFAULTS["company.gst"]);
    try {
      const raw = content["socials.json"] || SITE_CONTENT_DEFAULTS["socials.json"];
      const arr = JSON.parse(raw);
      setSocials(Array.isArray(arr) ? arr : []);
    } catch { setSocials([]); }
  }, [content]);

  const save = useMutation({
    mutationFn: async () => {
      const entries = [
        { key: "brand.name", value: brandName.trim() },
        { key: "brand.tagline", value: tagline.trim() },
        { key: "brand.logo", value: logo.trim() },
        { key: "brand.favicon", value: favicon.trim() },
        { key: "company.gst", value: gst.trim() },
        { key: "socials.json", value: JSON.stringify(socials.filter((s) => s.url && s.label)) },
      ];
      await api("/api/admin/site-content", { method: "POST", body: JSON.stringify({ entries }) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/site-content"] });
      toast({ title: "Saved", description: "Branding & identity updated." });
    },
    onError: (e: any) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  const handleUpload = async (file: File, kind: "logo" | "favicon") => {
    setUploading(kind);
    try {
      const r = await uploadFile(file);
      if (kind === "logo") setLogo(r.url);
      else setFavicon(r.url);
      toast({ title: "Uploaded", description: "File uploaded — remember to Save Changes." });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally { setUploading(null); }
  };

  const updateSocial = (idx: number, patch: Partial<Social>) =>
    setSocials((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

  const removeSocial = (idx: number) => setSocials((prev) => prev.filter((_, i) => i !== idx));
  const addSocial = () => setSocials((prev) => [...prev, { label: "", url: "", icon: "globe" }]);

  return (
    <AdminLayout>
      <Helmet><title>Branding & Identity · Admin</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Branding & Identity</h1>
          <p className="text-sm text-muted-foreground">Logo, favicon, brand name, GSTIN and social links shown across the site.</p>
        </div>
        <button
          onClick={() => save.mutate()} disabled={save.isPending}
          data-testid="button-save-branding"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-md hover:opacity-90 disabled:opacity-60"
        >
          {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Brand fields */}
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h2 className="font-heading text-lg font-semibold">Brand</h2>
          <Field label="Brand name">
            <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} className={inputCls} data-testid="input-brand-name" />
          </Field>
          <Field label="Tagline">
            <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputCls} data-testid="input-brand-tagline" />
          </Field>
          <Field label="GST Number">
            <input type="text" value={gst} onChange={(e) => setGst(e.target.value)} placeholder="27CBFPM8207D1ZR" className={inputCls} data-testid="input-gst" />
          </Field>
        </div>

        {/* Logo + Favicon */}
        <div className="bg-card rounded-xl border p-6 space-y-6">
          <h2 className="font-heading text-lg font-semibold">Logo & Favicon</h2>

          <UploadField
            label="Logo (shown next to brand name)" url={logo} onUrl={setLogo}
            onFile={(f) => handleUpload(f, "logo")} uploading={uploading === "logo"}
            testid="upload-logo" preview="logo"
          />

          <UploadField
            label="Favicon (browser tab icon — PNG / 32×32 or 64×64)" url={favicon} onUrl={setFavicon}
            onFile={(f) => handleUpload(f, "favicon")} uploading={uploading === "favicon"}
            testid="upload-favicon" preview="favicon"
          />
        </div>

        {/* Socials */}
        <div className="lg:col-span-2 bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold">Social Links</h2>
            <button onClick={addSocial} data-testid="button-add-social" className="inline-flex items-center gap-2 text-sm font-semibold border border-primary/40 text-primary hover:bg-primary/10 px-3 py-2 rounded-md">
              <Plus className="w-4 h-4" /> Add Social
            </button>
          </div>

          {socials.length === 0 ? (
            <p className="text-sm text-muted-foreground">No socials yet — click "Add Social".</p>
          ) : (
            <div className="space-y-3">
              {socials.map((s, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end" data-testid={`row-social-${idx}`}>
                  <div className="col-span-3">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Label</label>
                    <input type="text" value={s.label} onChange={(e) => updateSocial(idx, { label: e.target.value })} className={inputCls} data-testid={`input-social-label-${idx}`} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Icon</label>
                    <select value={s.icon} onChange={(e) => updateSocial(idx, { icon: e.target.value })} className={inputCls} data-testid={`select-social-icon-${idx}`}>
                      {SOCIAL_ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="col-span-6">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">URL</label>
                    <input type="url" value={s.url} onChange={(e) => updateSocial(idx, { url: e.target.value })} placeholder="https://…" className={inputCls} data-testid={`input-social-url-${idx}`} />
                  </div>
                  <div className="col-span-1">
                    <button onClick={() => removeSocial(idx)} aria-label="Remove" data-testid={`button-remove-social-${idx}`} className="w-full inline-flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-md py-2.5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

const inputCls = "w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary";
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
    {children}
  </div>
);

const UploadField = ({
  label, url, onUrl, onFile, uploading, testid, preview,
}: {
  label: string; url: string; onUrl: (s: string) => void;
  onFile: (f: File) => void; uploading: boolean; testid: string;
  preview: "logo" | "favicon";
}) => (
  <div>
    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
    <div className="flex items-center gap-3 mb-2">
      <div className={`shrink-0 ${preview === "favicon" ? "w-12 h-12" : "w-20 h-20"} rounded border bg-secondary/40 flex items-center justify-center overflow-hidden`}>
        {url ? <img src={url} alt="" className="max-w-full max-h-full object-contain" /> : <span className="text-xs text-muted-foreground">No image</span>}
      </div>
      <label className="inline-flex items-center gap-2 text-sm font-semibold border border-primary/40 text-primary hover:bg-primary/10 px-3 py-2 rounded-md cursor-pointer">
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? "Uploading…" : "Upload File"}
        <input type="file" accept="image/*" className="hidden" data-testid={testid} onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.currentTarget.value = ""; }} />
      </label>
      {url ? <button onClick={() => onUrl("")} className="text-xs text-destructive hover:underline">Remove</button> : null}
    </div>
    <input type="url" value={url} onChange={(e) => onUrl(e.target.value)} placeholder="Or paste a public image URL" className={inputCls} />
  </div>
);
