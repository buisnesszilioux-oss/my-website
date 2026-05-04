import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { api } from "@/lib/api";
import type { Media } from "@/lib/api-extras";
import { Trash2, Plus, Play, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["hero", "product", "banner", "gallery"] as const;
type Cat = (typeof CATEGORIES)[number];

const empty = { type: "photo" as "photo" | "video", category: "gallery" as Cat, url: "", title: "", caption: "", thumbnail: "" };

const AdminMedia = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data } = useQuery<Media[]>({ queryKey: ["/api/media"], queryFn: () => api("/api/media") });
  const [form, setForm] = useState<typeof empty>(empty);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"all" | Cat>("all");

  const filtered = useMemo(() => {
    const arr = data ?? [];
    if (filter === "all") return arr;
    return arr.filter((m) => ((m as any).category || "gallery") === filter);
  }, [data, filter]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: data?.length ?? 0 };
    CATEGORIES.forEach((c) => (m[c] = 0));
    (data ?? []).forEach((it) => { const c = (it as any).category || "gallery"; m[c] = (m[c] || 0) + 1; });
    return m;
  }, [data]);

  const create = useMutation({
    mutationFn: (v: typeof empty) => api("/api/admin/media", { method: "POST", body: JSON.stringify(v) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/media"] }); setForm(empty); toast({ title: "Uploaded successfully" }); },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => api(`/api/admin/media/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/media"] }); toast({ title: "Deleted" }); },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url) { toast({ title: "URL required", description: "Please upload or paste a media URL", variant: "destructive" }); return; }
    create.mutate(form);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold">Photos & Videos</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload images and videos to the public gallery.</p>
      </div>

      <form onSubmit={submit} className="bg-card rounded-lg border border-border p-6 mb-8 space-y-4">
        <h2 className="font-heading text-lg font-bold flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Upload New Media</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</span>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2" data-testid="select-media-type">
              <option value="photo">Photo</option>
              <option value="video">Video</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</span>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Cat })} className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2" data-testid="select-media-category">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</span>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2" data-testid="input-media-title" />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Media URL ({form.type})</span>
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Paste media URL" className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm" data-testid="input-media-url" />
        </label>

        {form.type === "video" && (
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thumbnail URL (optional)</span>
            <input value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} placeholder="Thumbnail image URL" className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm" />
          </label>
        )}

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Caption</span>
          <textarea value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} rows={2} className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm resize-none" />
        </label>

        <button type="submit" disabled={busy || create.isPending} data-testid="button-add-media" className="px-5 py-2 rounded-md bg-gradient-gold text-charcoal font-semibold disabled:opacity-60">
          {create.isPending ? "Adding…" : "Add to Gallery"}
        </button>
      </form>

      <div>
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h2 className="font-heading text-lg font-bold flex items-center gap-2"><ImageIcon className="w-5 h-5 text-primary" /> Existing Media ({filtered.length})</h2>
          <div className="flex gap-2 flex-wrap">
            {(["all", ...CATEGORIES] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c as any)}
                data-testid={`filter-media-${c}`}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${
                  filter === c ? "bg-gradient-gold text-charcoal border-transparent" : "bg-card text-foreground/70 border-border hover:border-primary/50"
                }`}
              >
                {c} <span className="opacity-70 ml-1">({counts[c] || 0})</span>
              </button>
            ))}
          </div>
        </div>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((m) => {
              const cat = ((m as any).category || "gallery") as string;
              return (
                <div key={m.id} className="bg-card border border-border rounded-lg overflow-hidden" data-testid={`media-${m.id}`}>
                  <div className="relative aspect-square bg-secondary">
                    <img src={m.thumbnail || m.url} alt={m.title} className="w-full h-full object-cover" />
                    {m.type === "video" && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center"><Play className="w-4 h-4 text-charcoal" /></span>
                      </span>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] uppercase font-semibold rounded-full bg-charcoal/80 text-primary border border-primary/30">{cat}</span>
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-semibold text-foreground line-clamp-1">{m.title || "(untitled)"}</div>
                    <div className="text-xs text-muted-foreground capitalize">{m.type}</div>
                    <button onClick={() => { if (confirm("Delete this media?")) del.mutate(m.id); }} data-testid={`button-delete-media-${m.id}`} className="mt-2 inline-flex items-center gap-1 px-2 py-1 text-xs border border-destructive/40 text-destructive rounded hover:bg-destructive/10">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <div className="bg-card rounded-lg border border-border p-8 text-center text-muted-foreground text-sm">No media in this category.</div>}
      </div>
    </AdminLayout>
  );
};

export default AdminMedia;
