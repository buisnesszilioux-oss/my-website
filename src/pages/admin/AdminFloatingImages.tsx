import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { api, uploadFile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ImagePlus, Eye, EyeOff, Upload } from "lucide-react";
import type { FloatingImage } from "@/components/FloatingImages";

const empty = {
  url: "",
  title: "",
  enabled: true,
  duration: 6,
  delay: 0,
  positionX: 50,
  positionY: 50,
  size: 120,
};

export default function AdminFloatingImages() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery<FloatingImage[]>({
    queryKey: ["/api/admin/floating-images"],
    queryFn: () => api("/api/admin/floating-images"),
  });
  const [form, setForm] = useState<typeof empty>(empty);
  const [busy, setBusy] = useState(false);

  const create = useMutation({
    mutationFn: (v: typeof empty) =>
      api("/api/admin/floating-images", { method: "POST", body: JSON.stringify(v) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/floating-images"] });
      qc.invalidateQueries({ queryKey: ["/api/floating-images"] });
      setForm(empty);
      toast({ title: "Floating image added" });
    },
    onError: (e: any) =>
      toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FloatingImage> }) =>
      api(`/api/admin/floating-images/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/floating-images"] });
      qc.invalidateQueries({ queryKey: ["/api/floating-images"] });
    },
  });

  const del = useMutation({
    mutationFn: (id: number) => api(`/api/admin/floating-images/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/floating-images"] });
      qc.invalidateQueries({ queryKey: ["/api/floating-images"] });
      toast({ title: "Deleted" });
    },
  });

  const handleFileUpload = async (file: File) => {
    try {
      setBusy(true);
      const { url } = await uploadFile(file);
      setForm((p) => ({ ...p, url, title: p.title || file.name.replace(/\.[^.]+$/, "") }));
      toast({ title: "Uploaded", description: file.name });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url) {
      toast({ title: "Image required", description: "Upload or paste an image URL", variant: "destructive" });
      return;
    }
    create.mutate(form);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">Floating Images Manager</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload images that float gently over the homepage hero. Control position, size, and animation speed.
        </p>
      </div>

      <form onSubmit={submit} className="bg-card rounded-xl border border-border p-6 mb-8 space-y-4">
        <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
          <ImagePlus className="w-5 h-5 text-primary" /> Add New Floating Image
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title (optional)</span>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              data-testid="input-floating-title"
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-foreground"
            />
          </label>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image</span>
            <div className="mt-1 flex items-center gap-3">
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="Paste URL or upload"
                data-testid="input-floating-url"
                className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
              />
              <label className="cursor-pointer inline-flex items-center gap-1 px-4 py-2 bg-gradient-gold text-charcoal rounded-md text-sm font-semibold">
                <Upload className="w-4 h-4" /> {busy ? "…" : "Upload"}
                <input type="file" accept="image/*" className="hidden" data-testid="input-floating-file" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Position X (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              value={form.positionX}
              onChange={(e) => setForm({ ...form, positionX: Number(e.target.value || 0) })}
              data-testid="input-floating-positionx"
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-foreground"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Position Y (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              value={form.positionY}
              onChange={(e) => setForm({ ...form, positionY: Number(e.target.value || 0) })}
              data-testid="input-floating-positiony"
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-foreground"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Size (px)</span>
            <input
              type="number"
              min={40}
              max={400}
              value={form.size}
              onChange={(e) => setForm({ ...form, size: Number(e.target.value || 120) })}
              data-testid="input-floating-size"
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-foreground"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration (s)</span>
            <input
              type="number"
              min={2}
              max={30}
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: Number(e.target.value || 6) })}
              data-testid="input-floating-duration"
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-foreground"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Delay (s)</span>
            <input
              type="number"
              min={0}
              max={20}
              value={form.delay}
              onChange={(e) => setForm({ ...form, delay: Number(e.target.value || 0) })}
              data-testid="input-floating-delay"
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-foreground"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={create.isPending || busy}
          data-testid="button-add-floating"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-gradient-gold text-charcoal font-semibold disabled:opacity-60"
        >
          <Plus className="w-4 h-4" /> {create.isPending ? "Adding…" : "Add Floating Image"}
        </button>
      </form>

      <div>
        <h2 className="font-heading text-lg font-bold text-foreground mb-3">
          Existing Floating Images ({data?.length ?? 0})
        </h2>
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {data && data.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.map((img) => (
              <div
                key={img.id}
                data-testid={`floating-${img.id}`}
                className={`bg-card border rounded-xl overflow-hidden ${
                  img.enabled ? "border-primary/40" : "border-border opacity-70"
                }`}
              >
                <div className="relative aspect-square bg-secondary/40 flex items-center justify-center p-4">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="max-w-full max-h-full object-contain anim-float"
                    style={{ animationDuration: `${img.duration}s`, animationDelay: `${img.delay}s` }}
                  />
                  <span
                    className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] uppercase font-semibold rounded-full ${
                      img.enabled
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {img.enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="p-3 space-y-2">
                  <div className="text-sm font-semibold text-foreground line-clamp-1">
                    {img.title || "(untitled)"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Pos {img.positionX}%, {img.positionY}% · {img.size}px · {img.duration}s · delay {img.delay}s
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => update.mutate({ id: img.id, data: { enabled: !img.enabled } })}
                      data-testid={`button-toggle-floating-${img.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs border border-border rounded hover:bg-secondary/50 text-foreground"
                    >
                      {img.enabled ? (
                        <>
                          <EyeOff className="w-3 h-3" /> Disable
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" /> Enable
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this floating image?")) del.mutate(img.id);
                      }}
                      data-testid={`button-delete-floating-${img.id}`}
                      className="inline-flex items-center gap-1 px-2 py-1.5 text-xs border border-destructive/40 text-destructive rounded hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground text-sm">
              No floating images yet. Upload one above to make it appear over the hero.
            </div>
          )
        )}
      </div>
    </AdminLayout>
  );
}
