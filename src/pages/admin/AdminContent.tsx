import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { api, uploadFile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { SITE_CONTENT_DEFAULTS, type SiteContentMap } from "@/hooks/useSiteContent";
import { Save, Upload } from "lucide-react";

type FieldType = "text" | "textarea" | "image";
type FieldDef = { key: string; label: string; type: FieldType; placeholder?: string };

const groups: { title: string; description: string; fields: FieldDef[] }[] = [
  {
    title: "Hero (Top of Homepage)",
    description: "The big headline visitors see first.",
    fields: [
      { key: "hero.eyebrow", label: "Small Tagline (above title)", type: "text", placeholder: "e.g. Engineered for excellence" },
      { key: "hero.title", label: "Main Title", type: "text" },
      { key: "hero.titleAccent", label: "Title Accent (gold)", type: "text" },
      { key: "hero.subtitle", label: "Subtitle / Description", type: "textarea" },
      { key: "hero.ctaPrimaryText", label: "Primary Button Text", type: "text" },
      { key: "hero.ctaPrimaryUrl", label: "Primary Button Link", type: "text", placeholder: "#products or /products" },
      { key: "hero.ctaSecondaryText", label: "Secondary Button Text", type: "text" },
      { key: "hero.ctaSecondaryUrl", label: "Secondary Button Link", type: "text" },
    ],
  },
  {
    title: "About Section",
    description: "About the company on the homepage.",
    fields: [
      { key: "about.eyebrow", label: "Tagline", type: "text" },
      { key: "about.title", label: "Heading", type: "text" },
      { key: "about.titleAccent", label: "Heading Accent (gold)", type: "text" },
      { key: "about.body1", label: "Paragraph 1", type: "textarea" },
      { key: "about.body2", label: "Paragraph 2", type: "textarea" },
    ],
  },
  {
    title: "Statistics",
    description: "Animated numbers shown on the homepage.",
    fields: [
      { key: "stats.eyebrow", label: "Tagline", type: "text" },
      { key: "stats.title", label: "Heading", type: "text" },
      { key: "stats.titleAccent", label: "Heading Accent (gold)", type: "text" },
      { key: "stats.years", label: "Years Experience (number)", type: "text" },
      { key: "stats.yearsLabel", label: "Years Label", type: "text" },
      { key: "stats.clients", label: "Happy Clients (number)", type: "text" },
      { key: "stats.clientsLabel", label: "Clients Label", type: "text" },
      { key: "stats.orders", label: "Orders Delivered (number)", type: "text" },
      { key: "stats.ordersLabel", label: "Orders Label", type: "text" },
      { key: "stats.industries", label: "Industries Served (number)", type: "text" },
      { key: "stats.industriesLabel", label: "Industries Label", type: "text" },
    ],
  },
  {
    title: "Contact & Company Info",
    description: "Shown in the contact section, footer, and PDF catalog.",
    fields: [
      { key: "contact.eyebrow", label: "Tagline", type: "text" },
      { key: "contact.title", label: "Heading", type: "text" },
      { key: "contact.titleAccent", label: "Heading Accent (gold)", type: "text" },
      { key: "contact.email", label: "Email Address", type: "text" },
      { key: "contact.phone1", label: "Primary Phone", type: "text" },
      { key: "contact.phone2", label: "Secondary Phone", type: "text" },
      { key: "contact.address", label: "Full Address", type: "textarea" },
      { key: "contact.formIntro", label: "Contact Form Intro", type: "textarea" },
    ],
  },
];

export default function AdminContent() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery<SiteContentMap>({
    queryKey: ["/api/site-content"],
    queryFn: () => api("/api/site-content"),
  });
  const [values, setValues] = useState<SiteContentMap>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    const merged: SiteContentMap = { ...SITE_CONTENT_DEFAULTS, ...(data || {}) };
    setValues(merged);
  }, [data]);

  const save = useMutation({
    mutationFn: (entries: { key: string; value: string }[]) =>
      api("/api/admin/site-content", { method: "POST", body: JSON.stringify(entries) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/site-content"] });
      toast({ title: "Saved", description: "Site content updated." });
    },
    onError: (e: any) => toast({ title: "Save failed", description: e?.message || "Try again", variant: "destructive" }),
  });

  const onSaveGroup = (g: typeof groups[number]) => {
    const entries = g.fields.map((f) => ({ key: f.key, value: values[f.key] ?? "" }));
    save.mutate(entries);
  };

  const onUpload = async (key: string, file: File) => {
    try {
      setUploadingKey(key);
      const { url } = await uploadFile(file);
      setValues((p) => ({ ...p, [key]: url }));
      toast({ title: "Uploaded", description: file.name });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">Site Content</h1>
        <p className="text-muted-foreground text-sm mt-1">Edit the text & images of every section. Changes appear instantly.</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      <div className="space-y-8">
        {groups.map((g) => (
          <section key={g.title} className="bg-card border border-border rounded-xl shadow-sm">
            <header className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">{g.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{g.description}</p>
              </div>
              <button
                type="button"
                onClick={() => onSaveGroup(g)}
                disabled={save.isPending}
                data-testid={`button-save-${g.title.replace(/\s+/g, "-").toLowerCase()}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-gold text-charcoal font-semibold rounded-md disabled:opacity-60 text-sm"
              >
                <Save className="w-4 h-4" /> {save.isPending ? "Saving…" : "Save"}
              </button>
            </header>
            <div className="p-5 grid md:grid-cols-2 gap-4">
              {g.fields.map((f) => {
                const v = values[f.key] ?? "";
                if (f.type === "image") {
                  return (
                    <div key={f.key} className="md:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{f.label}</label>
                      <div className="flex items-center gap-3">
                        {v && <img src={v} alt="" className="w-20 h-20 object-cover rounded border border-border" />}
                        <input
                          value={v}
                          onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.placeholder}
                          data-testid={`input-${f.key}`}
                          className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 bg-secondary hover:bg-secondary/70 rounded-md text-sm">
                          <Upload className="w-4 h-4" /> {uploadingKey === f.key ? "…" : "Upload"}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const fl = e.target.files?.[0]; if (fl) onUpload(f.key, fl); }} />
                        </label>
                      </div>
                    </div>
                  );
                }
                if (f.type === "textarea") {
                  return (
                    <label key={f.key} className="block md:col-span-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{f.label}</span>
                      <textarea
                        rows={3}
                        value={v}
                        onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        data-testid={`input-${f.key}`}
                        className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      />
                    </label>
                  );
                }
                return (
                  <label key={f.key} className="block">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{f.label}</span>
                    <input
                      value={v}
                      onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      data-testid={`input-${f.key}`}
                      className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </AdminLayout>
  );
}
