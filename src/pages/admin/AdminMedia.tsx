import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { api, uploadFile } from "@/lib/api";
import type { Media } from "@/lib/api-extras";
import { Trash2, Upload, Plus, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const empty = { type: "photo" as "photo" | "video", url: "", title: "", caption: "", thumbnail: "" };

const AdminMedia = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data } = useQuery<Media[]>({ queryKey: ["/api/media"], queryFn: () => api("/api/media") });
  const [form, setForm] = useState<typeof empty>(empty);
  const [busy, setBusy] = useState(false);

  const create = useMutation({
    mutationFn: (v: typeof empty) => api("/api/admin/media", { method: "POST", body: JSON.stringify(v) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/media"] }); setForm(empty); toast({ title: "Uploaded successfully" }); },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => api(`/api/admin/media/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/media"] }); toast({ title: "Deleted" }); },
  });

  const handleFileUpload = async (file: File, target: "url" | "thumbnail") => {
    try {
      setBusy(true);
      const { url } = await uploadFile(file);
      setForm((p) => ({ ...p, [target]: url, type: file.type.startsWith("video/") ? "video" : (target === "url" ? p.type : p.type) }));
      toast({ title: "File uploaded", description: file.name });
    } catch (e: any) { toast({ title: "Upload failed", description: e.message, variant: "destructive" }); }
    finally { setBusy(false); }
  };

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
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</span>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2" data-testid="input-media-title" />
          </label>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Media File ({form.type})</span>
          <div className="mt-1 flex items-center gap-3">
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Paste URL or upload" className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm" data-testid="input-media-url" />
            <label className="cursor-pointer inline-flex items-center gap-1 px-4 py-2 bg-gradient-gold text-charcoal rounded-md text-sm font-semibold">
              <Upload className="w-4 h-4" /> Upload
              <input type="file" accept={form.type === "video" ? "video/*" : "image/*"} className="hidden" data-testid="input-file-media" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "url"); }} />
            </label>
          </div>
        </div>

        {form.type === "video" && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thumbnail (optional)</span>
            <div className="mt-1 flex items-center gap-3">
              <input value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} placeholder="Thumbnail image URL" className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm" />
              <label className="cursor-pointer inline-flex items-center gap-1 px-4 py-2 bg-secondary rounded-md text-sm">
                <Upload className="w-4 h-4" /> Upload
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "thumbnail"); }} />
              </label>
            </div>
          </div>
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
        <h2 className="font-heading text-lg font-bold mb-3">Existing Media ({data?.length ?? 0})</h2>
        {data && data.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.map((m) => (
              <div key={m.id} className="bg-card border border-border rounded-lg overflow-hidden" data-testid={`media-${m.id}`}>
                <div className="relative aspect-square bg-secondary">
                  <img src={m.thumbnail || m.url} alt={m.title} className="w-full h-full object-cover" />
                  {m.type === "video" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center"><Play className="w-4 h-4 text-charcoal" /></span>
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-foreground line-clamp-1">{m.title || "(untitled)"}</div>
                  <div className="text-xs text-muted-foreground capitalize">{m.type}</div>
                  <button onClick={() => { if (confirm("Delete this media?")) del.mutate(m.id); }} data-testid={`button-delete-media-${m.id}`} className="mt-2 inline-flex items-center gap-1 px-2 py-1 text-xs border border-destructive/40 text-destructive rounded hover:bg-destructive/10">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="bg-card rounded-lg border border-border p-8 text-center text-muted-foreground text-sm">No media uploaded yet.</div>}
      </div>
    </AdminLayout>
  );
};

export default AdminMedia;
